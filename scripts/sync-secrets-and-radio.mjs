import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 GTA6HeistGuideSync/2.0';

function cleanText(text) {
  if (!text) return '';
  let s = text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
  // Decode XML entities that wrap HTML tags
  s = s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  // Strip all HTML tags
  s = s.replace(/<[^>]+>/g, ' ');
  // Decode remaining characters
  s = s.replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'")
       .replace(/&apos;/g, "'")
       .replace(/&#x27;/g, "'")
       .replace(/&#x2F;/g, '/')
       .replace(/&#8216;/g, "'")
       .replace(/&#8217;/g, "'")
       .replace(/&#8220;/g, '"')
       .replace(/&#8221;/g, '"')
       .replace(/&#8212;/g, '—')
       .replace(/&#8211;/g, '–')
       .replace(/&nbsp;/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();
  return s;
}

function parseRssItems(xml, defaultSource = 'Web') {
  const items = [];
  const itemMatches = xml.match(/<item[\s>].*?<\/item>/gs) || [];
  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>(.*?)<\/title>/s);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/s);
    const descMatch = itemXml.match(/<description>(.*?)<\/description>/s);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/s);
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/s);

    const rawTitle = titleMatch ? titleMatch[1] : '';
    let title = cleanText(rawTitle);
    
    let detectedSource = defaultSource;
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length > 1) {
        detectedSource = parts[parts.length - 1].trim();
        title = parts.slice(0, parts.length - 1).join(' - ').trim();
      }
    }
    if (sourceMatch) {
      detectedSource = cleanText(sourceMatch[1]);
    }

    const link = (linkMatch ? linkMatch[1] : '').replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    let description = cleanText(descMatch ? descMatch[1] : '');
    
    if (!description || description.length < 25 || description.toLowerCase().includes(title.toLowerCase())) {
      description = `Live community discovery and gameplay intel reported by ${detectedSource}: ${title}.`;
    }

    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && link) {
      items.push({
        id: Buffer.from(link).toString('base64').substring(0, 16),
        title,
        summary: description,
        url: link,
        source: detectedSource,
        date: pubDate.split('T')[0],
        timestamp: pubDate,
        is_new: true
      });
    }
  }

  // Atom <entry>
  const entryMatches = xml.match(/<entry[\s>].*?<\/entry>/gs) || [];
  for (const entryXml of entryMatches) {
    const titleMatch = entryXml.match(/<title>(.*?)<\/title>/s);
    const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["']/s);
    const contentMatch = entryXml.match(/<content[^>]*>(.*?)<\/content>/s) || entryXml.match(/<summary[^>]*>(.*?)<\/summary>/s);
    const updatedMatch = entryXml.match(/<updated>(.*?)<\/updated>/s);

    const title = cleanText(titleMatch ? titleMatch[1] : '');
    const link = linkMatch ? linkMatch[1].trim() : '';
    let description = cleanText(contentMatch ? contentMatch[1] : '');
    if (!description || description.length < 20) {
      description = `r/GTA6 community discovery: ${title}.`;
    }

    const pubDate = updatedMatch ? new Date(updatedMatch[1]).toISOString() : new Date().toISOString();

    if (title && link) {
      items.push({
        id: Buffer.from(link).toString('base64').substring(0, 16),
        title,
        summary: description.slice(0, 240),
        url: link,
        source: 'Reddit r/GTA6',
        date: pubDate.split('T')[0],
        timestamp: pubDate,
        is_new: true
      });
    }
  }

  return items;
}

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT }
    });
    clearTimeout(id);
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    clearTimeout(id);
    console.warn(`[WARN] Fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

function loadExistingJson(relativeFilePath) {
  try {
    const fullPath = path.join(ROOT_DIR, relativeFilePath);
    if (fs.existsSync(fullPath)) {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      return data.items || [];
    }
  } catch (err) {
    console.warn(`[WARN] Could not read ${relativeFilePath}: ${err.message}`);
  }
  return [];
}

function saveJsonIfChanged(fileName, nextItems, feedTitle, existingItems) {
  // Never overwrite or shrink existing records if an external feed temporarily returns empty
  if (nextItems.length < existingItems.length) {
    console.log(`[OK] Preserved ${fileName} (external feed returned fewer items than existing ${existingItems.length}).`);
    return false;
  }

  const normalizeForDiff = (arr) =>
    arr.map((it) => ({
      title: (it.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60),
      source: it.source || '',
      region: it.region || '',
    }));

  if (JSON.stringify(normalizeForDiff(nextItems)) === JSON.stringify(normalizeForDiff(existingItems))) {
    console.log(`[OK] No meaningful changes for ${fileName} — left untouched (zero-change protection).`);
    return false;
  }

  const dataObj = {
    feed_title: feedTitle,
    last_synced: new Date().toISOString(),
    total_count: nextItems.length,
    items: nextItems,
  };

  const publicDir = path.join(ROOT_DIR, 'public', 'data');
  const rootDataDir = path.join(ROOT_DIR, 'data');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(rootDataDir, { recursive: true });

  const content = JSON.stringify(dataObj, null, 2) + '\n';
  fs.writeFileSync(path.join(publicDir, fileName), content, 'utf-8');
  fs.writeFileSync(path.join(rootDataDir, fileName), content, 'utf-8');
  console.log(`[✓] Updated ${fileName} in public/data/ and data/ (${nextItems.length} items).`);
  return true;
}

// Bounding boxes matching exact leonida-map.jpg coordinates
const REGION_BOUNDS = {
  'Vice Beach': { yMin: 0.44, yMax: 0.58, xMin: 0.76, xMax: 0.85, name: 'Vice City' },
  'Vice City': { yMin: 0.42, yMax: 0.58, xMin: 0.64, xMax: 0.85, name: 'Vice City' },
  'South Vice': { yMin: 0.35, yMax: 0.44, xMin: 0.49, xMax: 0.68, name: 'Vice City' },
  'Grassrivers': { yMin: 0.21, yMax: 0.32, xMin: 0.39, xMax: 0.56, name: 'Grassrivers' },
  'Leonida Keys': { yMin: 0.09, yMax: 0.18, xMin: 0.23, xMax: 0.61, name: 'Leonida Keys' },
  'Mt. Kalaga': { yMin: 0.68, yMax: 0.85, xMin: 0.35, xMax: 0.65, name: 'Mt. Kalaga' },
  'Lake Leonida': { yMin: 0.62, yMax: 0.73, xMin: 0.50, xMax: 0.68, name: 'Lake Leonida' },
  'Port Gellhorn': { yMin: 0.46, yMax: 0.68, xMin: 0.22, xMax: 0.37, name: 'Port Gellhorn' }
};

function detectRegionAndCoords(title, description, itemId) {
  const text = (title + ' ' + description).toLowerCase();
  let selectedRegionKey = 'Vice City';

  if (text.includes('beach') || text.includes('ocean drive')) selectedRegionKey = 'Vice Beach';
  else if (text.includes('grassrivers') || text.includes('wetland') || text.includes('swamp') || text.includes('everglades') || text.includes('airboat') || text.includes('skunk ape') || text.includes('gator')) selectedRegionKey = 'Grassrivers';
  else if (text.includes('keys') || text.includes('marathon') || text.includes('largo') || text.includes('key west') || text.includes('reef') || text.includes('superyacht')) selectedRegionKey = 'Leonida Keys';
  else if (text.includes('kalaga') || text.includes('mountain') || text.includes('peak') || text.includes('chiliad') || text.includes('ranger')) selectedRegionKey = 'Mt. Kalaga';
  else if (text.includes('gellhorn') || text.includes('container') || text.includes('crane') || text.includes('docks')) selectedRegionKey = 'Port Gellhorn';
  else if (text.includes('lake') || text.includes('ambrosia') || text.includes('citrus') || text.includes('orchard')) selectedRegionKey = 'Lake Leonida';
  else if (text.includes('airport') || text.includes('terminal')) selectedRegionKey = 'South Vice';
  else {
    const regions = ['Vice City', 'Grassrivers', 'Leonida Keys', 'Mt. Kalaga', 'Port Gellhorn', 'Lake Leonida'];
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) hash = ((hash << 5) - hash) + itemId.charCodeAt(i);
    selectedRegionKey = regions[Math.abs(hash) % regions.length];
  }

  const box = REGION_BOUNDS[selectedRegionKey] || REGION_BOUNDS['Vice City'];
  
  let h1 = 0, h2 = 0;
  for (let i = 0; i < itemId.length; i++) {
    if (i % 2 === 0) h1 = ((h1 << 5) - h1) + itemId.charCodeAt(i);
    else h2 = ((h2 << 5) - h2) + itemId.charCodeAt(i);
  }
  const norm1 = (Math.abs(h1) % 10000) / 10000;
  const norm2 = (Math.abs(h2) % 10000) / 10000;

  const yPct = +(box.yMin + norm1 * (box.yMax - box.yMin)).toFixed(4);
  const xPct = +(box.xMin + norm2 * (box.xMax - box.xMin)).toFixed(4);

  return { region: box.name, yPct, xPct };
}

async function run() {
  console.log('=== GTA 6 SECRETS, RADIO & LIVE MAP PINS AUTO-SYNC ENGINE ($0/MONTH) ===');

  // 1. Google News RSS for Secrets & Locations
  console.log('[1/5] Fetching Google News RSS for Secrets & Easter Eggs...');
  const secretsRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=GTA+6+easter+egg+OR+secret&hl=en-US&gl=US&ceid=US:en'
  );
  const secretNewsItems = secretsRss ? parseRssItems(secretsRss, 'Google News') : [];

  const redditSecretsRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=site:reddit.com/r/GTA6+easter+egg+OR+secret+OR+cryptid&hl=en-US&gl=US&ceid=US:en'
  );
  const redditSecretNewsItems = redditSecretsRss ? parseRssItems(redditSecretsRss, 'Reddit r/GTA6') : [];
  console.log(` -> Found ${secretNewsItems.length} news items + ${redditSecretNewsItems.length} Reddit-indexed secret items.`);

  // 2. Google News RSS for Radio & Music
  console.log('[2/5] Fetching Google News RSS for Radio & Soundtrack...');
  const radioRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=GTA+6+radio+station+OR+soundtrack+OR+music&hl=en-US&gl=US&ceid=US:en'
  );
  const radioNewsItems = radioRss ? parseRssItems(radioRss, 'Google News') : [];

  const redditRadioRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=site:reddit.com/r/GTA6+radio+station+OR+soundtrack+OR+music&hl=en-US&gl=US&ceid=US:en'
  );
  const redditRadioNewsItems = redditRadioRss ? parseRssItems(redditRadioRss, 'Reddit r/GTA6') : [];
  console.log(` -> Found ${radioNewsItems.length} news items + ${redditRadioNewsItems.length} Reddit-indexed radio items.`);

  // 3. Google News RSS for Live Map Locations & Discoveries
  console.log('[3/5] Fetching Google News & Reddit for Map Locations & Discoveries...');
  const mapRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=GTA+6+map+location+OR+vault+OR+secret+stash&hl=en-US&gl=US&ceid=US:en'
  );
  const mapNewsItems = mapRss ? parseRssItems(mapRss, 'Google News') : [];

  const redditMapRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=site:reddit.com/r/GTA6+map+location+OR+vault+OR+secret+stash&hl=en-US&gl=US&ceid=US:en'
  );
  const redditMapNewsItems = redditMapRss ? parseRssItems(redditMapRss, 'Reddit r/GTA6') : [];
  console.log(` -> Found ${mapNewsItems.length} map news items + ${redditMapNewsItems.length} Reddit map items.`);

  // Merge & Deduplicate SECRETS (existing first to preserve stable IDs/URLs and prevent zero-change churn)
  const existingSecrets = loadExistingJson('public/data/secrets-live.json');
  const allSecrets = [
    ...existingSecrets,
    ...secretNewsItems,
    ...redditSecretNewsItems
  ];
  const uniqueSecrets = [];
  const seenSecretTitles = new Set();

  for (const item of allSecrets) {
    const key = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (key && !seenSecretTitles.has(key)) {
      seenSecretTitles.add(key);
      uniqueSecrets.push(item);
    }
  }

  uniqueSecrets.sort((a, b) => (new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)) || String(a.title || '').localeCompare(String(b.title || '')));
  const finalSecrets = uniqueSecrets.slice(0, 25);

  saveJsonIfChanged(
    'secrets-live.json',
    finalSecrets,
    'GTA 6 Verified Easter Eggs, Cryptids & Community Discoveries',
    existingSecrets
  );

  // Merge & Deduplicate RADIO
  const existingRadio = loadExistingJson('public/data/radio-live.json');
  const allRadio = [
    ...existingRadio,
    ...radioNewsItems,
    ...redditRadioNewsItems
  ];
  const uniqueRadio = [];
  const seenRadioTitles = new Set();

  for (const item of allRadio) {
    const key = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (key && !seenRadioTitles.has(key)) {
      seenRadioTitles.add(key);
      uniqueRadio.push(item);
    }
  }

  uniqueRadio.sort((a, b) => (new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)) || String(a.title || '').localeCompare(String(b.title || '')));
  const finalRadio = uniqueRadio.slice(0, 25);

  saveJsonIfChanged(
    'radio-live.json',
    finalRadio,
    'GTA 6 Radio Stations, Leaked Tracks & Music Hub Live Intel',
    existingRadio
  );

  // 4. Merge & Deduplicate LIVE MAP PINS
  console.log('[4/4] Processing Live Map Pins with Calibrated Coordinates...');
  const existingPins = loadExistingJson('public/data/map-pins-live.json');
  const rawPinCandidates = [
    ...mapNewsItems,
    ...redditMapNewsItems,
    ...secretNewsItems,
    ...redditSecretNewsItems
  ];

  const processedNewPins = rawPinCandidates.map(c => {
    const loc = detectRegionAndCoords(c.title, c.summary, c.id);
    return {
      id: `live-${c.id}`,
      title: c.title,
      region: loc.region,
      yPct: loc.yPct,
      xPct: loc.xPct,
      category: "live-discovery",
      icon: "🆕",
      badge: "🆕 LIVE DISCOVERY",
      source: c.source,
      payout: "Community Intel Hotspot",
      difficulty: "Community Discovery",
      description: c.summary,
      tips: `Discovered by ${c.source}. Keep eyes peeled for nearby security relays and collectible tags.`,
      link: c.url,
      timestamp: c.timestamp || new Date().toISOString()
    };
  });

  const allMapPins = [...existingPins, ...processedNewPins];
  const uniquePins = [];
  const seenPinKeys = new Set();

  for (const p of allMapPins) {
    const key = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
    if (key && !seenPinKeys.has(key)) {
      seenPinKeys.add(key);
      uniquePins.push(p);
    }
  }

  uniquePins.sort((a, b) => (new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) || String(a.title || '').localeCompare(String(b.title || '')));
  const finalLivePins = uniquePins.slice(0, 25);

  saveJsonIfChanged(
    'map-pins-live.json',
    finalLivePins,
    'GTA 6 Live Auto-Discovered Hotspots & Community Coordinates',
    existingPins
  );

  console.log('=== AUTO-SYNC COMPLETE (SECRETS, RADIO & LIVE MAP PINS) ===');
}

run().catch(err => {
  console.error('[FATAL] Sync failed:', err);
  process.exit(1);
});
