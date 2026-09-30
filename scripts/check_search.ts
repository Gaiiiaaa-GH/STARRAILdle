// Sanity check for the character search ranking. Run: node scripts/check_search.ts
import assert from 'node:assert/strict';
import characters from '../src/data/characters.json' with { type: 'json' };
import { searchCharacters } from '../src/utils/gameLogic.ts';
import type { Character } from '../src/types/index.ts';

const all = characters as unknown as Character[];
const fr = (q: string, byType = false) => searchCharacters(all, q, 'fr', byType).map((c) => c.name_fr);

const a = fr('a');
const startsWithA = a.map((n) => n.toLowerCase().startsWith('a'));
assert.ok(startsWithA[0] && startsWithA.indexOf(false) === -1 || startsWithA.lastIndexOf(true) < startsWithA.indexOf(false), `"a": every name starting with A comes first: ${a}`);
assert.ok(!a.includes('March 7th (Préservation)'), 'March 7th no longer matches "a"');
const aNames = a.filter((n) => n.toLowerCase().startsWith('a'));
assert.deepEqual([...aNames].sort((x, y) => x.localeCompare(y, 'fr')), aNames, 'same-rank results are alphabetical');
assert.ok(fr('wolf').includes("Louve d'argent"), 'English name matches too (Silver Wolf)');
assert.ok(fr('cerydra').includes('Cérydra'), 'accents are ignored');
assert.ok(!fr('feu').includes('Himeko'), 'element search is off by default');
assert.ok(fr('feu', true).includes('Himeko'), 'element search works in easy mode');
assert.ok(fr('chasse', true).includes('Seele'), 'path search works in easy mode');
assert.deepEqual(fr(''), [], 'empty query gives nothing');
console.log('search ok:', a.slice(0, 5).join(', '));
