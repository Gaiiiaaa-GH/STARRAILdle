import type { Character, ComparisonResult, MatchStatus, AllStats, ModeStats, GameMode } from '../types';

// Number of attribute cards in the Classic mode guess-board row (character +
// gender + element + path + lore_paths + rarity + version + boss + world +
// factions). Must stay in sync with the nth-child animation-delay rules for
// `.guess-row.is-new-guess .guess-cell` in index.css.
export const CLASSIC_MODE_CARD_COUNT = 10;

export function compareCharacters(guess: Character, target: Character): ComparisonResult {
  const isExactCharacter = guess.id === target.id;

  // Gender
  const genderStatus: MatchStatus = guess.gender === target.gender ? 'correct' : 'incorrect';

  // Element
  const elementStatus: MatchStatus =
    guess.element.id.toLowerCase() === target.element.id.toLowerCase() ? 'correct' : 'incorrect';

  // Path
  const pathStatus: MatchStatus =
    guess.path.id.toLowerCase() === target.path.id.toLowerCase() ? 'correct' : 'incorrect';

  // Lore Path (narrative Path alignment(s), may differ from combat Path;
  // a character can have more than one, e.g. Cipher: Elation + Destruction)
  const guessLorePathsEn = guess.lore_paths.map((lp) => lp.name_en);
  const targetLorePathsEn = target.lore_paths.map((lp) => lp.name_en);
  const matchingLorePathsEn = guessLorePathsEn.filter((lp) => targetLorePathsEn.includes(lp));
  const matchingLorePathsFr = guess.lore_paths
    .filter((lp) => matchingLorePathsEn.includes(lp.name_en))
    .map((lp) => lp.name_fr);

  let lorePathsStatus: MatchStatus = 'incorrect';
  if (
    guessLorePathsEn.length === targetLorePathsEn.length &&
    guessLorePathsEn.every((lp) => targetLorePathsEn.includes(lp))
  ) {
    lorePathsStatus = 'correct';
  } else if (matchingLorePathsEn.length > 0) {
    lorePathsStatus = 'partial';
  }

  // Rarity
  const rarityStatus: MatchStatus = guess.rarity === target.rarity ? 'correct' : 'incorrect';

  // Version
  const [guessMajor, guessMinor = 0] = guess.release_version.split('.').map(Number);
  const [targetMajor, targetMinor = 0] = target.release_version.split('.').map(Number);
  const guessVer = parseFloat(guess.release_version);
  const targetVer = parseFloat(target.release_version);
  
  let versionStatus: MatchStatus = 'incorrect';
  let versionDir: 'equal' | 'higher' | 'lower' = 'equal';

  if (guess.release_version === target.release_version) {
    versionStatus = 'correct';
    versionDir = 'equal';
  } else {
    if (targetMajor > guessMajor || (targetMajor === guessMajor && targetMinor > guessMinor)) {
      versionDir = 'higher';
    } else {
      versionDir = 'lower';
    }

    // Partial if same major version cycle (e.g. 1.x or 2.x) or within 0.2 delta
    const sameMajor = guessMajor === targetMajor;
    const closeDelta = Math.abs(guessVer - targetVer) <= 0.2;
    if (sameMajor || closeDelta) {
      versionStatus = 'partial';
    }
  }

  // Weekly Boss Material
  let weeklyStatus: MatchStatus = 'incorrect';
  if (guess.weekly_boss.material_id === target.weekly_boss.material_id) {
    weeklyStatus = 'correct';
  } else if (
    guess.weekly_boss.world_en.toLowerCase() === target.weekly_boss.world_en.toLowerCase() ||
    guess.weekly_boss.boss_name_en.toLowerCase() === target.weekly_boss.boss_name_en.toLowerCase()
  ) {
    weeklyStatus = 'partial';
  }

  // World (Monde)
  let worldStatus: MatchStatus = 'incorrect';
  if (guess.world_en.toLowerCase() === target.world_en.toLowerCase()) {
    worldStatus = 'correct';
  } else {
    const isXianzhou = (w: string) => w.toLowerCase().includes('xianzhou');
    if (isXianzhou(guess.world_en) && isXianzhou(target.world_en)) {
      worldStatus = 'partial';
    }
  }

  // Factions
  const guessFactionsEn = guess.factions_en || [];
  const targetFactionsEn = target.factions_en || [];

  const matchingFactionsEn = guessFactionsEn.filter((f) =>
    targetFactionsEn.some((tf) => tf.toLowerCase() === f.toLowerCase())
  );
  const matchingFactionsFr = (guess.factions_fr || []).filter((_, idx) => {
    const enName = guessFactionsEn[idx];
    return matchingFactionsEn.includes(enName);
  });

  let factionsStatus: MatchStatus = 'incorrect';
  if (
    guessFactionsEn.length > 0 &&
    guessFactionsEn.length === targetFactionsEn.length &&
    guessFactionsEn.every((f) => targetFactionsEn.some((tf) => tf.toLowerCase() === f.toLowerCase()))
  ) {
    factionsStatus = 'correct';
  } else if (matchingFactionsEn.length > 0) {
    factionsStatus = 'partial';
  }

  return {
    character: guess,
    isCorrect: isExactCharacter,
    name: {
      match: isExactCharacter,
      name_en: guess.name_en,
      name_fr: guess.name_fr,
      avatar: guess.avatar,
    },
    gender: {
      status: genderStatus,
      value: guess.gender,
    },
    element: {
      status: elementStatus,
      name_en: guess.element.name_en,
      name_fr: guess.element.name_fr,
      icon: guess.element.icon,
    },
    path: {
      status: pathStatus,
      name_en: guess.path.name_en,
      name_fr: guess.path.name_fr,
      icon: guess.path.icon,
    },
    lore_paths: {
      status: lorePathsStatus,
      matching_en: matchingLorePathsEn,
      matching_fr: matchingLorePathsFr,
      all_en: guessLorePathsEn,
      all_fr: guess.lore_paths.map((lp) => lp.name_fr),
    },
    rarity: {
      status: rarityStatus,
      value: guess.rarity,
    },
    release_version: {
      status: versionStatus,
      value: guess.release_version,
      direction: versionDir,
    },
    weekly_boss: {
      status: weeklyStatus,
      material_name_fr: guess.weekly_boss.material_name_fr,
      material_name_en: guess.weekly_boss.material_name_en,
      boss_name_fr: guess.weekly_boss.boss_name_fr,
      boss_name_en: guess.weekly_boss.boss_name_en,
      world_fr: guess.weekly_boss.world_fr,
      world_en: guess.weekly_boss.world_en,
      icon: guess.weekly_boss.icon,
    },
    world: {
      status: worldStatus,
      name_fr: guess.world_fr,
      name_en: guess.world_en,
    },
    factions: {
      status: factionsStatus,
      matching_en: matchingFactionsEn,
      matching_fr: matchingFactionsFr,
      all_en: guessFactionsEn,
      all_fr: guess.factions_fr || [],
    },
  };
}

// Deterministic pick from a list based on a seed string (same seed always
// picks the same item — used to keep the Quote mode's chosen line stable
// across re-renders/reloads for a given character + day).
export function pickSeeded<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const index = Math.abs(hash) % items.length;
  return items[index];
}

// Pseudo-random daily target picker based on date and mode seed
export function getDailyTarget(characters: Character[], mode: GameMode = 'classic', dateStr?: string): Character {
  const d = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  const seedString = `starraildle_${mode}_${d}`;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const index = Math.abs(hash) % characters.length;
  return characters[index];
}

// Random target picker for unlimited practice mode
export function getRandomTarget(characters: Character[], excludeId?: string): Character {
  const pool = excludeId ? characters.filter((c) => c.id !== excludeId) : characters;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

// Default initial stats
const defaultModeStats: ModeStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
};

export const defaultAllStats: AllStats = {
  classic: { ...defaultModeStats },
  splash: { ...defaultModeStats },
  portrait: { ...defaultModeStats },
  grayscale: { ...defaultModeStats },
  quote: { ...defaultModeStats },
  skill: { ...defaultModeStats },
};

export function loadGameStats(): AllStats {
  try {
    const saved = localStorage.getItem('starraildle_stats_v1');
    if (saved) {
      return { ...defaultAllStats, ...JSON.parse(saved) };
    }
  } catch {
    // Fallback
  }
  return defaultAllStats;
}

export function saveGameStats(stats: AllStats) {
  try {
    localStorage.setItem('starraildle_stats_v1', JSON.stringify(stats));
  } catch {
    // Fallback
  }
}

export function recordWin(mode: GameMode, guessCount: number): AllStats {
  const stats = loadGameStats();
  const modeStat = stats[mode];
  modeStat.played += 1;
  modeStat.won += 1;
  modeStat.currentStreak += 1;
  if (modeStat.currentStreak > modeStat.maxStreak) {
    modeStat.maxStreak = modeStat.currentStreak;
  }
  modeStat.guessDistribution[guessCount] = (modeStat.guessDistribution[guessCount] || 0) + 1;
  saveGameStats(stats);
  return stats;
}

export function recordLoss(mode: GameMode): AllStats {
  const stats = loadGameStats();
  const modeStat = stats[mode];
  modeStat.played += 1;
  modeStat.currentStreak = 0;
  saveGameStats(stats);
  return stats;
}

// Share text generation for Discord/Twitter
export function generateShareResult(
  mode: GameMode,
  isDaily: boolean,
  guesses: ComparisonResult[] | Character[],
  hasWon: boolean,
  lang: 'fr' | 'en'
): string {
  const modeName = {
    classic: lang === 'fr' ? 'Classique' : 'Classic',
    splash: lang === 'fr' ? 'Splash Art Zoom' : 'Splash Art',
    portrait: lang === 'fr' ? 'Portrait' : 'Portrait',
    grayscale: lang === 'fr' ? 'Noir et Blanc' : 'Black & White',
    quote: lang === 'fr' ? 'Citation' : 'Quote',
    skill: lang === 'fr' ? 'Compétence' : 'Skill',
  }[mode];

  const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
  let text = `STARRAILdle - ${modeName} ${isDaily ? `(${dateStr})` : '(Pratique)'}\n`;
  text += `${hasWon ? `Trouvé en ${guesses.length} essai${guesses.length > 1 ? 's' : ''}` : 'Non trouvé'}\n\n`;

  if (mode === 'classic') {
    for (const g of guesses as ComparisonResult[]) {
      const getMark = (status: MatchStatus) => (status === 'correct' ? 'O' : status === 'partial' ? '~' : 'X');
      const row = [
        getMark(g.gender.status),
        getMark(g.element.status),
        getMark(g.path.status),
        getMark(g.lore_paths.status),
        getMark(g.rarity.status),
        getMark(g.release_version.status),
        getMark(g.weekly_boss.status),
        getMark(g.world.status),
        getMark(g.factions.status),
      ].join(' ');
      text += `${row}\n`;
    }
  } else {
    for (let i = 0; i < guesses.length; i++) {
      if (i === guesses.length - 1 && hasWon) {
        text += 'O';
      } else {
        text += 'X';
      }
    }
    text += '\n';
  }

  text += '\nhttps://starraildle.gg';
  return text;
}
