import { useState, useEffect, useMemo } from 'react';
import charactersDataRaw from './data/characters.json';
import type { Character, GameMode, Language, ComparisonResult } from './types';
import { BackgroundBanner } from './components/BackgroundBanner';
import { Header } from './components/Header';
import { RightSidebar } from './components/RightSidebar';
import { ClassicMode } from './components/ClassicMode';
import { SplashZoomMode, type SplashVariant } from './components/SplashZoomMode';
import { QuoteMode } from './components/QuoteMode';
import { SkillMode } from './components/SkillMode';
import { VictoryModal } from './components/VictoryModal';
import { StatsModal } from './components/StatsModal';
import { HelpModal } from './components/HelpModal';
import { CharacterGalleryModal } from './components/CharacterGalleryModal';
import {
  compareCharacters,
  getDailyTarget,
  getRandomTarget,
  loadGameStats,
  recordWin,
  CLASSIC_MODE_CARD_COUNT,
} from './utils/gameLogic';
import { soundManager } from './utils/audio';

const characters: Character[] = charactersDataRaw as unknown as Character[];

const MODE_ORDER: GameMode[] = ['classic', 'splash', 'portrait', 'grayscale', 'quote', 'skill'];

// Every mode whose win condition is just "guessed the right id" (everything
// except Classic, which needs the full attribute comparison).
type SimpleMode = Exclude<GameMode, 'classic'>;

// variant/mode pairs for the three SplashZoomMode-driven silhouette games
const SPLASH_VARIANTS: { mode: SimpleMode; variant: SplashVariant }[] = [
  { mode: 'splash', variant: 'mixed' },
  { mode: 'portrait', variant: 'portrait' },
  { mode: 'grayscale', variant: 'grayscale' },
];

interface ModeGuesses {
  classic: ComparisonResult[];
  splash: Character[];
  portrait: Character[];
  grayscale: Character[];
  quote: Character[];
  skill: Character[];
}

interface ModeWon {
  classic: boolean;
  splash: boolean;
  portrait: boolean;
  grayscale: boolean;
  quote: boolean;
  skill: boolean;
}

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('starraildle_lang') as Language) || 'fr';
  });

  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const [isDaily, setIsDaily] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    return localStorage.getItem('starraildle_colorblind') === 'true';
  });

  // Modals
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);

  // Targets
  const dailyTargets = useMemo(() => {
    return {
      classic: getDailyTarget(characters, 'classic'),
      splash: getDailyTarget(characters, 'splash'),
      portrait: getDailyTarget(characters, 'portrait'),
      grayscale: getDailyTarget(characters, 'grayscale'),
      quote: getDailyTarget(characters, 'quote'),
      skill: getDailyTarget(characters, 'skill'),
    };
  }, []);

  const [practiceTargets, setPracticeTargets] = useState(() => ({
    classic: getRandomTarget(characters),
    splash: getRandomTarget(characters),
    portrait: getRandomTarget(characters),
    grayscale: getRandomTarget(characters),
    quote: getRandomTarget(characters),
    skill: getRandomTarget(characters),
  }));

  // Guesses & win state, tracked separately for daily vs. practice so hopping
  // over to practice mode and back can never clobber the day's progress.
  const emptyGuesses = (): ModeGuesses => ({ classic: [], splash: [], portrait: [], grayscale: [], quote: [], skill: [] });
  const emptyWon = (): ModeWon => ({ classic: false, splash: false, portrait: false, grayscale: false, quote: false, skill: false });

  const [dailyGuesses, setDailyGuesses] = useState<ModeGuesses>(emptyGuesses);
  const [dailyHasWon, setDailyHasWon] = useState<ModeWon>(emptyWon);
  const [practiceGuesses, setPracticeGuesses] = useState<ModeGuesses>(emptyGuesses);
  const [practiceHasWon, setPracticeHasWon] = useState<ModeWon>(emptyWon);

  const guesses = isDaily ? dailyGuesses : practiceGuesses;
  const setGuesses = isDaily ? setDailyGuesses : setPracticeGuesses;
  const hasWon = isDaily ? dailyHasWon : practiceHasWon;
  const setHasWon = isDaily ? setDailyHasWon : setPracticeHasWon;

  // Current Target based on mode & daily status
  const currentTarget = isDaily ? dailyTargets[currentMode] : practiceTargets[currentMode];

  const currentGuesses = guesses[currentMode];

  const currentAttemptCount = currentGuesses.length;

  // Language toggle
  const toggleLanguage = () => {
    const nextLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(nextLang);
    localStorage.setItem('starraildle_lang', nextLang);
    soundManager.playSelect();
  };

  // Mute toggle
  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Colorblind mode toggle
  const toggleColorblindMode = () => {
    setColorblindMode((prev) => {
      const next = !prev;
      localStorage.setItem('starraildle_colorblind', String(next));
      return next;
    });
  };

  // Load Daily state on startup and re-hydrate with latest character schema
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDailyKey = `starraildle_daily_${today}`;
    try {
      const saved = localStorage.getItem(savedDailyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.classicGuesses && Array.isArray(parsed.classicGuesses)) {
          const rehydrated = parsed.classicGuesses.map((cg: { character?: { id: string } }) => {
            const char = characters.find((c) => c.id === cg.character?.id);
            return char ? compareCharacters(char, dailyTargets.classic) : null;
          }).filter(Boolean);
          setDailyGuesses((prev) => ({ ...prev, classic: rehydrated as ComparisonResult[] }));
        }
        if (parsed.splashGuesses && Array.isArray(parsed.splashGuesses)) {
          const rehydrated = parsed.splashGuesses
            .map((sg: { id: string }) => characters.find((c) => c.id === sg.id))
            .filter(Boolean) as Character[];
          setDailyGuesses((prev) => ({ ...prev, splash: rehydrated }));
        }
        if (parsed.portraitGuesses && Array.isArray(parsed.portraitGuesses)) {
          const rehydrated = parsed.portraitGuesses
            .map((pg: { id: string }) => characters.find((c) => c.id === pg.id))
            .filter(Boolean) as Character[];
          setDailyGuesses((prev) => ({ ...prev, portrait: rehydrated }));
        }
        if (parsed.grayscaleGuesses && Array.isArray(parsed.grayscaleGuesses)) {
          const rehydrated = parsed.grayscaleGuesses
            .map((gg: { id: string }) => characters.find((c) => c.id === gg.id))
            .filter(Boolean) as Character[];
          setDailyGuesses((prev) => ({ ...prev, grayscale: rehydrated }));
        }
        if (parsed.quoteGuesses && Array.isArray(parsed.quoteGuesses)) {
          const rehydrated = parsed.quoteGuesses
            .map((qg: { id: string }) => characters.find((c) => c.id === qg.id))
            .filter(Boolean) as Character[];
          setDailyGuesses((prev) => ({ ...prev, quote: rehydrated }));
        }
        if (parsed.skillGuesses && Array.isArray(parsed.skillGuesses)) {
          const rehydrated = parsed.skillGuesses
            .map((sk: { id: string }) => characters.find((c) => c.id === sk.id))
            .filter(Boolean) as Character[];
          setDailyGuesses((prev) => ({ ...prev, skill: rehydrated }));
        }
        if (parsed.hasWon) setDailyHasWon(parsed.hasWon);
      }
    } catch {
      // Ignore
    }
  }, [dailyTargets]);

  // Save Daily state whenever it changes (daily guesses/wins only ever change via daily play)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDailyKey = `starraildle_daily_${today}`;
    const payload = {
      classicGuesses: dailyGuesses.classic,
      splashGuesses: dailyGuesses.splash,
      portraitGuesses: dailyGuesses.portrait,
      grayscaleGuesses: dailyGuesses.grayscale,
      quoteGuesses: dailyGuesses.quote,
      skillGuesses: dailyGuesses.skill,
      hasWon: dailyHasWon,
    };
    try {
      localStorage.setItem(savedDailyKey, JSON.stringify(payload));
    } catch {
      // Ignore
    }
  }, [dailyGuesses, dailyHasWon]);

  // Mode change handler
  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
    setIsVictoryModalOpen(false);
  };

  // Next daily mode not yet won today, if any (chains Classic -> Splash -> Quote -> Skill)
  const nextUnplayedDailyMode = MODE_ORDER.find((m) => m !== currentMode && !hasWon[m]);

  const handleGoToNextDailyMode = () => {
    if (!nextUnplayedDailyMode) return;
    setCurrentMode(nextUnplayedDailyMode);
    setIsVictoryModalOpen(false);
  };

  // Daily / Practice toggle
  const handleToggleDaily = (daily: boolean) => {
    soundManager.playSelect();
    setIsDaily(daily);
    if (!daily) {
      setPracticeTargets({
        classic: getRandomTarget(characters),
        splash: getRandomTarget(characters),
        portrait: getRandomTarget(characters),
        grayscale: getRandomTarget(characters),
        quote: getRandomTarget(characters),
        skill: getRandomTarget(characters),
      });
      setPracticeGuesses(emptyGuesses());
      setPracticeHasWon(emptyWon());
    }
  };

  // Reset a specific practice mode
  const handleResetPractice = (mode: GameMode) => {
    setPracticeTargets((prev) => ({
      ...prev,
      [mode]: getRandomTarget(characters, prev[mode].id),
    }));
    setPracticeGuesses((prev) => ({ ...prev, [mode]: [] }));
    setPracticeHasWon((prev) => ({ ...prev, [mode]: false }));
    setIsVictoryModalOpen(false);
  };

  // Guess Handlers
  const handleClassicGuess = (guessChar: Character) => {
    if (hasWon.classic) return;
    const result = compareCharacters(guessChar, currentTarget);
    const newGuesses = [result, ...guesses.classic];
    setGuesses((prev) => ({ ...prev, classic: newGuesses }));

    // Play suspenseful ascending chimes synchronously with card flip animations
    for (let i = 0; i < CLASSIC_MODE_CARD_COUNT; i++) {
      setTimeout(() => {
        soundManager.playFlip(i);
      }, i * 280);
    }

    if (result.isCorrect) {
      setTimeout(() => {
        setHasWon((prev) => ({ ...prev, classic: true }));
        recordWin('classic', newGuesses.length);
        setIsVictoryModalOpen(true);
      }, CLASSIC_MODE_CARD_COUNT * 280 + 350);
    }
  };

  const handleSimpleGuess = (mode: SimpleMode) => (guessChar: Character) => {
    if (hasWon[mode]) return;
    const newGuesses = [guessChar, ...guesses[mode]];
    setGuesses((prev) => ({ ...prev, [mode]: newGuesses }));

    if (guessChar.id === currentTarget.id) {
      setHasWon((prev) => ({ ...prev, [mode]: true }));
      recordWin(mode, newGuesses.length);
      setIsVictoryModalOpen(true);
    } else {
      soundManager.playFlip(0);
    }
  };

  return (
    <>
      <BackgroundBanner />
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        isDaily={isDaily}
        onToggleDaily={handleToggleDaily}
        language={language}
        onToggleLanguage={toggleLanguage}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        colorblindMode={colorblindMode}
        onToggleColorblindMode={toggleColorblindMode}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenGallery={() => setIsGalleryModalOpen(true)}
      />

      <div className="app-container">
        {/* Dead-Centered Main Game Stage */}
        <div className="app-center-stage">
          <main style={{ width: '100%' }}>
            {currentMode === 'classic' && (
              <ClassicMode
                characters={characters}
                target={currentTarget}
                guesses={guesses.classic}
                onMakeGuess={handleClassicGuess}
                hasWon={hasWon.classic}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice('classic')}
                language={language}
                colorblindMode={colorblindMode}
              />
            )}

            {SPLASH_VARIANTS.map(({ mode, variant }) => currentMode === mode && (
              <SplashZoomMode
                key={mode}
                variant={variant}
                characters={characters}
                target={currentTarget}
                guessedCharacters={guesses[mode]}
                onMakeGuess={handleSimpleGuess(mode)}
                hasWon={hasWon[mode]}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice(mode)}
                language={language}
              />
            ))}

            {currentMode === 'quote' && (
              <QuoteMode
                characters={characters}
                target={currentTarget}
                guessedCharacters={guesses.quote}
                onMakeGuess={handleSimpleGuess('quote')}
                hasWon={hasWon.quote}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice('quote')}
                language={language}
              />
            )}

            {currentMode === 'skill' && (
              <SkillMode
                characters={characters}
                target={currentTarget}
                guessedCharacters={guesses.skill}
                onMakeGuess={handleSimpleGuess('skill')}
                hasWon={hasWon.skill}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice('skill')}
                language={language}
              />
            )}
          </main>
        </div>

        {/* Pinned Far-Right Guide Panel */}
        <RightSidebar
          language={language}
          currentMode={currentMode}
          attemptCount={currentAttemptCount}
          onOpenHelp={() => setIsHelpModalOpen(true)}
        />

        {/* Victory Modal */}
        {isVictoryModalOpen && (
          <VictoryModal
            target={currentTarget}
            mode={currentMode}
            isDaily={isDaily}
            guesses={currentGuesses}
            language={language}
            onClose={() => setIsVictoryModalOpen(false)}
            onNextRound={!isDaily ? () => handleResetPractice(currentMode) : undefined}
            onNextMode={isDaily && nextUnplayedDailyMode ? handleGoToNextDailyMode : undefined}
          />
        )}

        {/* Stats Modal */}
        {isStatsModalOpen && (
          <StatsModal
            stats={loadGameStats()}
            language={language}
            onClose={() => setIsStatsModalOpen(false)}
          />
        )}

        {/* Help Modal */}
        {isHelpModalOpen && (
          <HelpModal language={language} onClose={() => setIsHelpModalOpen(false)} />
        )}

        {/* Character Gallery Modal */}
        {isGalleryModalOpen && (
          <CharacterGalleryModal
            characters={characters}
            language={language}
            onClose={() => setIsGalleryModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;
