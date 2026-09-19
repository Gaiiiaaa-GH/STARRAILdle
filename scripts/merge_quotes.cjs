const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'wiki_research');
const batches = ['quotes_batch1.json', 'quotes_batch2.json', 'quotes_batch3.json', 'quotes_batch4.json'].map((f) =>
  JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
);
const merged = Object.assign({}, ...batches);

const out = {};
for (const [id, v] of Object.entries(merged)) {
  out[id] = v.quotes;
}

fs.writeFileSync(path.join(dir, 'merged_quotes.json'), JSON.stringify(out, null, 2), 'utf-8');
console.log('Merged quotes for', Object.keys(out).length, 'characters ->', path.join(dir, 'merged_quotes.json'));
const thin = Object.entries(out).filter(([, q]) => q.length < 4);
if (thin.length) {
  console.log(thin.length, 'characters have fewer than 4 quotes:', thin.map(([id, q]) => `${id} (${q.length})`).join(', '));
}
