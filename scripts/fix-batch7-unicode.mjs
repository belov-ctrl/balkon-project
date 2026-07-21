import fs from 'fs';

const path = 'src/data/districtFallbacks.ts';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('// ── БАТЧ №7');
if (start < 0) throw new Error('Batch 7 marker not found');

const head = s.slice(0, start);
let tail = s.slice(start);

const pairs = [
  ['\u043a\u0438\u0440\u0070\u0438\u0447', '\u043a\u0438\u0440\u043f\u0438\u0447'],
  ['\u043a\u043e\u0440\u0072o\u0064\u0438\u0440\u0443\u0435\u0442', '\u043a\u043e\u0440\u0440\u043e\u0437\u0438\u0440\u0443\u0435\u0442'],
  ['\u041f\u044f\u0442ikam\u0435\u0440\u043d\u044b\u0435', '\u041f\u044f\u0442\u0438\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u0435'],
  ['\u043f\u044f\u0442ikam\u0435\u0440\u043d\u044b\u0439', '\u043f\u044f\u0442\u0438\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u0439'],
  ['\u0442\u0440\u0451\u0445kam\u0435\u0440\u043d\u043e\u0433\u043e', '\u0442\u0440\u0451\u0445\u043a\u0430\u043c\u0435\u0440\u043d\u043e\u0433\u043e'],
  ['\u0442\u0440\u0451\u0445kam\u0435\u0440\u043d\u044b\u0445', '\u0442\u0440\u0451\u0445\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u0445'],
  ['\u043e\u0441\u0442eklenie', '\u043e\u0441\u0442\u0435\u043a\u043b\u0435\u043d\u0438\u0435'],
  ['\u0412\u0437\u043bomost\u043e\u0439\u043a\u0430\u044f', '\u0412\u0437\u043b\u043e\u043c\u043e\u0441\u0442\u043e\u0439\u043a\u0430\u044f'],
  ['\u043f\u0440\u043e\u0442\u0438\u0432\u043e\u0432\u0437lom\u043d\u043e\u0441\u0442\u044c', '\u043f\u0440\u043e\u0442\u0438\u0432\u043e\u0432\u0437\u043b\u043e\u043c\u043d\u043e\u0441\u0442\u044c'],
  ['\u0442\u0440\u0438plex', '\u0442\u0440\u0438\u043f\u043b\u0435\u043a\u0441'],
];

for (const [from, to] of pairs) {
  const count = tail.split(from).length - 1;
  if (count > 0) {
    tail = tail.split(from).join(to);
    console.log(`Fixed (${count}x):`, from.length, 'chars');
  } else {
    console.log('Skip (0x):', JSON.stringify(from));
  }
}

fs.writeFileSync(path, head + tail);

const re = /[\u0400-\u04FF][a-zA-Z]|[a-zA-Z][\u0400-\u04FF]/g;
const left = tail.match(re);
console.log('Remaining mixed-script in batch 7:', left?.length ?? 0);
