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
  preview?: string;
  quotes: { en: string; fr: string }[];
  skill_hint: SkillHint;
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
  currentStreak: number;
  maxStreak: number;
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
