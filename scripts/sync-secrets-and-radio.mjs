import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GTA6HeistGuideSync/1.0';
const INDEXNOW_KEY = 'df9198ac34c2f27023754589395a56d0';
const HOST = 'www.gta6heistguide.com';

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
    
    // If description is just the title + source, make it an informative summary
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
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.text();
  } catch (err) {
    clearTimeout(id);
    console.warn(`[WARN] Failed fetching ${url}: ${err.message}`);
    return null;
  }
}

function loadExistingJson(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const items = data.items || [];
      // Clean up summaries if any had raw html
      for (const it of items) {
        if (it.summary) it.summary = cleanText(it.summary);
      }
      return items;
    } catch (e) {
      console.warn(`[WARN] Could not parse ${relPath}: ${e.message}`);
    }
  }
  return [];
}

function saveJsonBoth(fileName, dataObj) {
  const publicDir = path.join(ROOT_DIR, 'public', 'data');
  const rootDataDir = path.join(ROOT_DIR, 'data');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(rootDataDir, { recursive: true });

  const content = JSON.stringify(dataObj, null, 2);
  fs.writeFileSync(path.join(publicDir, fileName), content, 'utf-8');
  fs.writeFileSync(path.join(rootDataDir, fileName), content, 'utf-8');
  console.log(`[✓] Successfully saved ${fileName} to public/data/ and data/`);
}

async function pingIndexNow(urls) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  };
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      console.log(`[IndexNow] ${ep} status: ${res.status}`);
    } catch (e) {
      console.warn(`[IndexNow] ${ep} error: ${e.message}`);
    }
  }
}

async function run() {
  console.log('=== GTA 6 SECRETS & RADIO AUTO-SYNC ENGINE ($0/MONTH) ===');

  // 1. Google News RSS for Secrets
  console.log('[1/4] Fetching Google News RSS for Secrets & Easter Eggs...');
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
  console.log('[2/4] Fetching Google News RSS for Radio & Soundtrack...');
  const radioRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=GTA+6+radio+station+OR+soundtrack+OR+music&hl=en-US&gl=US&ceid=US:en'
  );
  const radioNewsItems = radioRss ? parseRssItems(radioRss, 'Google News') : [];

  const redditRadioRss = await fetchWithTimeout(
    'https://news.google.com/rss/search?q=site:reddit.com/r/GTA6+radio+station+OR+soundtrack+OR+music&hl=en-US&gl=US&ceid=US:en'
  );
  const redditRadioNewsItems = redditRadioRss ? parseRssItems(redditRadioRss, 'Reddit r/GTA6') : [];
  console.log(` -> Found ${radioNewsItems.length} news items + ${redditRadioNewsItems.length} Reddit-indexed radio items.`);

  // Merge & Deduplicate SECRETS
  const existingSecrets = loadExistingJson('public/data/secrets-live.json');
  const allSecrets = [
    ...secretNewsItems,
    ...redditSecretNewsItems,
    ...existingSecrets
  ];
  const uniqueSecrets = [];
  const seenSecretTitles = new Set();

  for (const item of allSecrets) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (!seenSecretTitles.has(key)) {
      seenSecretTitles.add(key);
      uniqueSecrets.push(item);
    }
  }

  uniqueSecrets.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
  const finalSecrets = uniqueSecrets.slice(0, 25);

  const secretsData = {
    feed_title: "GTA 6 Verified Easter Eggs, Cryptids & Community Discoveries",
    last_synced: new Date().toISOString(),
    total_count: finalSecrets.length,
    items: finalSecrets
  };
  saveJsonBoth('secrets-live.json', secretsData);

  // Merge & Deduplicate RADIO
  const existingRadio = loadExistingJson('public/data/radio-live.json');
  const allRadio = [
    ...radioNewsItems,
    ...redditRadioNewsItems,
    ...existingRadio
  ];
  const uniqueRadio = [];
  const seenRadioTitles = new Set();

  for (const item of allRadio) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (!seenRadioTitles.has(key)) {
      seenRadioTitles.add(key);
      uniqueRadio.push(item);
    }
  }

  uniqueRadio.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
  const finalRadio = uniqueRadio.slice(0, 25);

  const radioData = {
    feed_title: "GTA 6 Radio Stations, Leaked Tracks & Music Hub Live Intel",
    last_synced: new Date().toISOString(),
    total_count: finalRadio.length,
    items: finalRadio
  };
  saveJsonBoth('radio-live.json', radioData);

  // Ping IndexNow
  console.log('[4/4] Pinging IndexNow for /secrets and /radio...');
  await pingIndexNow([
    `https://${HOST}/secrets`,
    `https://${HOST}/secrets.html`,
    `https://${HOST}/radio`,
    `https://${HOST}/radio.html`
  ]);

  console.log('=== AUTO-SYNC COMPLETE ===');
}

run().catch(err => {
  console.error('[FATAL] Sync failed:', err);
  process.exit(1);
});
