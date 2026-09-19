const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'wiki_research');
const batches = ['batch1.json', 'batch2.json', 'batch3.json', 'batch4.json'].map((f) =>
  JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
);
const merged = Object.assign({}, ...batches);

// Canonical id slugs (fixes batch inconsistencies like "the-hunt" vs "hunt")
const idFix = { 'the-hunt': 'hunt' };

// Canonical French names — aligned with this project's existing playable-path
// translations (src/data/characters.json path.name_fr) where the lore path
// corresponds to a playable path, and the best-sourced wiki term otherwise.
const canonicalFr = {
  destruction: 'La Destruction',
  hunt: 'La Chasse',
  erudition: "L'Érudition",
  harmony: "L'Harmonie",
  nihility: 'La Nihilité',
  preservation: 'La Préservation',
  abundance: "L'Abondance",
  remembrance: 'Le Souvenir',
  elation: "L'Allégresse",
  trailblaze: 'Le Pionnier',
  finality: 'La Finalité',
  permanence: 'La Permanence',
  enigmata: "L'Énigmatique",
  beauty: 'La Beauté',
  propagation: 'La Propagation',
  order: "L'Ordre",
  equilibrium: "L'Équilibre",
  voracity: 'La Voracité',
};
const canonicalEn = {
  finality: 'Finality',
  hunt: 'The Hunt',
};

// Playable paths already have an icon asset under public/assets/paths/<slug>.png
// using the game's internal slug, not the plain English lore_path id.
const iconSlugByLorePathId = {
  destruction: 'warrior',
  hunt: 'rogue',
  erudition: 'mage',
  harmony: 'shaman',
  nihility: 'warlock',
  preservation: 'knight',
  abundance: 'priest',
  remembrance: 'memory',
  elation: 'elation',
};

function normalizeLorePath(lp) {
  const id = idFix[lp.id] || lp.id;
  const iconSlug = iconSlugByLorePathId[id];
  return {
    id,
    name_en: canonicalEn[id] || lp.name_en,
    name_fr: canonicalFr[id] || lp.name_fr,
    icon: iconSlug ? `assets/paths/${iconSlug}.png` : undefined,
  };
}

const out = {};
for (const [id, v] of Object.entries(merged)) {
  const lorePaths = (v.lore_paths || []).map(normalizeLorePath);
  // De-dupe by id (a character shouldn't list the same lore path twice)
  const seen = new Set();
  const dedup = lorePaths.filter((lp) => (seen.has(lp.id) ? false : (seen.add(lp.id), true)));
  out[id] = {
    factions_en: v.factions_en,
    factions_fr: v.factions_fr,
    lore_paths: dedup,
  };
}

fs.writeFileSync(path.join(dir, 'merged.json'), JSON.stringify(out, null, 2), 'utf-8');
console.log('Merged', Object.keys(out).length, 'characters ->', path.join(dir, 'merged.json'));
const multi = Object.entries(out).filter(([, v]) => v.lore_paths.length > 1);
console.log(multi.length, 'characters have 2+ lore paths');
