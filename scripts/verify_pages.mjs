import fs from 'node:fs';

const radioHtml = fs.readFileSync('public/radio.html', 'utf-8');
const secretsHtml = fs.readFileSync('public/secrets.html', 'utf-8');

console.log('radio.html size:', radioHtml.length);
console.log('secrets.html size:', secretsHtml.length);

const checks = [
  ['radio STATIONS_DATA has 23 stations', (radioHtml.match(/genreGroup:\s*"[a-z]+"/g) || []).length === 23],
  ['radio has 34-track album', radioHtml.includes('34 Original Tracks') && radioHtml.includes('Justice') && radioHtml.includes('Travis Scott')],
  ['radio has Amazon Music Unlimited', radioHtml.includes('https://www.amazon.com/music/unlimited?tag=gta6heistguid-20')],
  ['radio has Pulse Elite Headset', radioHtml.includes('PlayStation+PULSE+Elite+Wireless+Headset') && radioHtml.includes('tag=gta6heistguid-20')],
  ['radio has Pulse Explore Earbuds', radioHtml.includes('PlayStation+PULSE+Explore+Wireless+Earbuds') && radioHtml.includes('tag=gta6heistguid-20')],
  ['radio has ExitLag referral', radioHtml.includes('https://www.exitlag.com/refer/10386953') && radioHtml.includes('10386953')],
  ['radio has GetApexLocal', radioHtml.includes('https://getapexlocal.com/')],
  ['radio has affiliate disclosure', radioHtml.includes('As an Amazon Associate and affiliate partner, GTA6HeistGuide.com earns from qualifying purchases at no extra cost to you.')],
  ['secrets has 12 master secrets', (secretsHtml.match(/id:\s*"sec-\d+"/g) || []).length === 12],
  ['secrets has Prime trial link', secretsHtml.includes('https://www.amazon.com/tryprimefree?tag=gta6heistguid-20')],
  ['secrets has G2A', secretsHtml.includes('https://www.g2a.com/n/reflink-4094b9aab5')],
  ['secrets has valid links', secretsHtml.includes('https://www.eneba.com/store/all?q=gta')],
  ['secrets has Pulse Elite', secretsHtml.includes('PlayStation+PULSE+Elite+Wireless+Headset') && secretsHtml.includes('tag=gta6heistguid-20')],
  ['secrets has KontrolFreek', secretsHtml.includes('KontrolFreek+Thumbsticks') && secretsHtml.includes('tag=gta6heistguid-20')],
  ['secrets has Samsung 990 PRO', secretsHtml.includes('Samsung+990+PRO+2TB+Heatsink+SSD') && secretsHtml.includes('tag=gta6heistguid-20')],
  ['secrets has GetApexLocal', secretsHtml.includes('https://getapexlocal.com/')],
  ['secrets has ExitLag', secretsHtml.includes('https://www.exitlag.com/refer/10386953')],
  ['secrets has affiliate disclosure', secretsHtml.includes('As an Amazon Associate and affiliate partner, GTA6HeistGuide.com earns from qualifying purchases at no extra cost to you.')],
  ['secrets has progress bar & localStorage', secretsHtml.includes('secretsProgressBar') && secretsHtml.includes('gta6_secrets_progress')]
];

let allPassed = true;
for (const [name, pass, note] of checks) {
  if (!pass) allPassed = false;
  console.log((pass ? 'PASS: ' : 'FAIL: ') + name + (note ? ' (' + note + ')' : ''));
}

if (allPassed) {
  console.log('\n>>> ALL 19 VERIFICATION CHECKS PASSED PERFECTLY! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
