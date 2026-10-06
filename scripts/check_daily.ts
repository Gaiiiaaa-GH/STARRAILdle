// Sanity check for the daily picks. Run: node scripts/check_daily.ts
import assert from 'node:assert/strict';
import characters from '../src/data/characters.json' with { type: 'json' };
import { getDailyTarget } from '../src/utils/gameLogic.ts';
import type { Character, GameMode } from '../src/types/index.ts';

const all = characters as unknown as Character[];
const days = Array.from({ length: 365 }, (_, d) => new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10));
const modes: GameMode[] = ['classic', 'splash', 'portrait', 'grayscale', 'quote', 'skill'];
const picks = (roster: Character[], mode: GameMode) => days.map((day) => getDailyTarget(roster, mode, day).id);

// The old hash moved one step down the id-sorted list each day (Clara, Pela,
// Natasha, Gepard...). Random picks land next to yesterday's about 2/93 of the time.
const index = picks(all, 'classic').map((id) => all.findIndex((c) => c.id === id));
const neighbours = index.filter((p, i) => i > 0 && Math.abs(p - index[i - 1]) === 1).length;
assert.ok(neighbours < 30, `${neighbours}/364 days pick yesterday's neighbour in the list`);
assert.ok(new Set(index).size > all.length * 0.9, 'a year of picks covers nearly the whole roster');

// A character joining the roster can be drawn in every mode, and the only
// days that change are the ones it wins.
const newcomer = all[all.length - 1];
for (const mode of modes) {
  const before = picks(all.slice(0, -1), mode);
  const after = picks(all, mode);
  const changed = days.map((_, i) => i).filter((i) => before[i] !== after[i]);
  assert.ok(changed.length > 0, `${mode}: ${newcomer.name_en} is never drawn`);
  const wrong = changed.find((i) => after[i] !== newcomer.id);
  assert.equal(wrong, undefined, `${mode}: ${days[wrong!]} changed to someone other than ${newcomer.name_en}`);
}
console.log(`daily ok: ${neighbours}/364 neighbour days, a newcomer only takes its own days in all ${modes.length} modes`);
