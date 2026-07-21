import fs from 'fs';

const path = 'src/data/districtFallbacks.ts';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('// ── БАТЧ №8');
if (start < 0) throw new Error('Batch 8 marker not found');

const head = s.slice(0, start);
let tail = s.slice(start);

const pairs = [
  ['\u043a\u0438\u0440\u0070\u0438\u0447', '\u043a\u0438\u0440\u043f\u0438\u0447'],
  ['\u041f\u044f\u0442ikam\u0435\u0440\u043d\u044b\u0435', '\u041f\u044f\u0442\u0438\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u0435'],
  ['\u0434\u0432\u0443\u0445kamer\u043d\u044b\u043c\u0438', '\u0434\u0432\u0443\u0445\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u043c\u0438'],
  ['\u0414\u0432\u0443\u0445kamer\u043d\u044b\u0439', '\u0414\u0432\u0443\u0445\u043a\u0430\u043c\u0435\u0440\u043d\u044b\u0439'],
  ['\u041f\u0435\u043d\u043e\u043f\u043b\u044dk\u0441', '\u041f\u0435\u043d\u043e\u043f\u043b\u044d\u043a\u0441'],
  ['\u043f\u043e\u043b\u0438\u043a\u0430\u0440bonata', '\u043f\u043e\u043b\u0438\u043a\u0430\u0440\u0431\u043e\u043d\u0430\u0442\u0430'],
  ['\u0412\u0437\u043bomost\u043e\u0439\u043a\u0430\u044f', '\u0412\u0437\u043b\u043e\u043c\u043e\u0441\u0442\u043e\u0439\u043a\u0430\u044f'],
  ['\u0441\u043a\u0432oznyaki', '\u0441\u043a\u0432\u043e\u0437\u043d\u044f\u043a\u0438'],
  ['\u0441\u043a\u0432ozny\u0430', '\u0441\u043a\u0432\u043e\u0437\u043d\u044f'],
  ['\u041feno\u0444ol', '\u041f\u0435\u043d\u043e\u0444\u043e\u043b'],
  ['\u0417\u0430\u0433orod\u043d\u043e\u0435', '\u0417\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u043e\u0435'],
  ['\u043a\u043e\u0437\u044b\u0440\u0451k', '\u043a\u043e\u0437\u044b\u0440\u0451\u043a'],
  ['\u043b\u0430\u043c\u0438\u043d\u0446\u0438\u044f', '\u043b\u0430\u043c\u0438\u043d\u0430\u0446\u0438\u044f'],
];

for (const [from, to] of pairs) {
  const count = tail.split(from).length - 1;
  if (count > 0) {
    tail = tail.split(from).join(to);
    console.log(`Fixed (${count}x):`, JSON.stringify(from));
  }
}

fs.writeFileSync(path, head + tail);

const re = /[\u0400-\u04FF][a-zA-Z]|[a-zA-Z][\u0400-\u04FF]/g;
const left = tail.match(re);
console.log('Remaining mixed-script in batch 8:', left?.length ?? 0);
if (left) left.slice(0, 15).forEach((m) => console.log(' ', m));
