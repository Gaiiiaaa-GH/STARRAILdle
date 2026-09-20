export type Language = 'fr' | 'en';

export type GameMode = 'classic' | 'splash' | 'portrait' | 'grayscale' | 'quote' | 'skill';

export interface LocalizedString {
  en: string;
  fr: string;
}

export interface ElementInfo {
  id: string;
  name_en: string;
  name_fr: string;
  icon: string;
}

export interface PathInfo {
  id: string;
  name_en: string;
  name_fr: string;
  icon: string;
}

export interface LorePathInfo {
  id: string;
  name_en: string;
  name_fr: string;
  icon?: string;
}

export interface WeeklyBossInfo {
  material_id: string;
  material_name_fr: string;
  material_name_en: string;
  boss_name_fr: string;
  boss_name_en: string;
  world_fr: string;
  world_en: string;
  icon: string;
}

export interface SkillHint {
  icon: string;
  name_en: string;
  name_fr: string;
  type: string;
}

export interface Character {
  id: string;
  name_en: string;
  name_fr: string;
  tag: string;
  rarity: number;
  gender: 'Male' | 'Female' | 'Other';
  element: ElementInfo;
  path: PathInfo;
  lore_paths: LorePathInfo[];
  release_version: string;
  world_en: string;
  world_fr: string;
  factions_en: string[];
  factions_fr: string[];
  weekly_boss: WeeklyBossInfo;
  avatar: string;
  portrait?: string;
  splash_art?: string;
  quotes: { en: string; fr: string }[];
  skill_hints: SkillHint[];
}

export type MatchStatus = 'correct' | 'partial' | 'incorrect';

export interface ComparisonResult {
  character: Character;
  isCorrect: boolean;
  name: {
    match: boolean;
    name_en: string;
    name_fr: string;
    avatar: string;
  };
  gender: {
    status: MatchStatus;
    value: string;
  };
  element: {
    status: MatchStatus;
    name_en: string;
    name_fr: string;
    icon: string;
  };
  path: {
    status: MatchStatus;
    name_en: string;
    name_fr: string;
    icon: string;
  };
  lore_paths: {
    status: MatchStatus;
    matching_en: string[];
    matching_fr: string[];
    all_en: string[];
    all_fr: string[];
  };
  rarity: {
    status: MatchStatus;
    value: number;
  };
  release_version: {
    status: MatchStatus;
    value: string;
    direction: 'equal' | 'higher' | 'lower';
  };
  weekly_boss: {
    status: MatchStatus;
    material_name_fr: string;
    material_name_en: string;
    boss_name_fr: string;
    boss_name_en: string;
    world_fr: string;
    world_en: string;
    icon: string;
  };
  world: {
    status: MatchStatus;
    name_fr: string;
    name_en: string;
  };
  factions: {
    status: MatchStatus;
    matching_en: string[];
    matching_fr: string[];
    all_en: string[];
    all_fr: string[];
  };
}

export interface ModeStats {
  played: number;
  won: number;
  guessDistribution: Record<number, number>;
}

export interface AllStats {
  classic: ModeStats;
  splash: ModeStats;
  portrait: ModeStats;
  grayscale: ModeStats;
  quote: ModeStats;
  skill: ModeStats;
}

// Kept in a separate localStorage entry from AllStats on purpose: a daily
// streak is precious (and date-sensitive) enough that it shouldn't be at
// risk if a future update ever changes the shape of the general stats blob.
export interface DailyStreak {
  current: number;
  max: number;
  lastWinDate: string | null;
}

export interface AllDailyStreaks {
  classic: DailyStreak;
  splash: DailyStreak;
  portrait: DailyStreak;
  grayscale: DailyStreak;
  quote: DailyStreak;
  skill: DailyStreak;
}
