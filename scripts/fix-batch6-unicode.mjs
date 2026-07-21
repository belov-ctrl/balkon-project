import fs from 'fs';

const path = 'src/data/districtFallbacks.ts';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('// ── БАТЧ №6');
if (start < 0) throw new Error('Batch 6 marker not found');

const head = s.slice(0, start);
let tail = s.slice(start);

const pairs = [
  ['\u0413\u0443\u0441\u0430\u0440ova', '\u0413\u0443\u0441\u0430\u0440\u043e\u0432\u0430'],
  ['\u043c\u0430\u043b\u043e\u044dta\u0436', '\u043c\u0430\u043b\u043e\u044d\u0442\u0430\u0436'],
  ['\u043a\u043e\u0437\u044b\u0440\u043a\u006f\u0432', '\u043a\u043e\u0437\u044b\u0440\u043a\u043e\u0432'],
  ['\u041c\u0438\u043a\u0440ora\u0439\u043e\u043d', '\u041c\u0438\u043a\u0440\u043e\u0440\u0430\u0439\u043e\u043d'],
  ['\u043f\u0440\u043e\u0442\u0438\u0432ov\u0437\u043bom\u043d\u044b\u0435', '\u043f\u0440\u043e\u0442\u0438\u0432\u043e\u0432\u0437\u043b\u043e\u043c\u043d\u044b\u0435'],
  ['\u0446\u0438\u043bind\u0440\u044b', '\u0446\u0438\u043b\u0438\u043d\u0434\u0440\u044b'],
];

for (const [from, to] of pairs) {
  const count = tail.split(from).length - 1;
  if (count > 0) {
    tail = tail.split(from).join(to);
    console.log(`Fixed ${JSON.stringify(from)} → ${JSON.stringify(to)} (${count}x)`);
  }
}

fs.writeFileSync(path, head + tail);

const re = /[\u0400-\u04FF][a-zA-Z]|[a-zA-Z][\u0400-\u04FF]/g;
const left = tail.match(re);
console.log('Remaining mixed-script in batch 6:', left?.length ?? 0);
