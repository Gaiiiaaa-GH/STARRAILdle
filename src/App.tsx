import { useState, useEffect, useMemo } from 'react';
import charactersDataRaw from './data/characters.json';
import type { Character, GameMode, Language, ComparisonResult } from './types';
import { BackgroundBanner } from './components/BackgroundBanner';
import { Header } from './components/Header';
import { RightSidebar } from './components/RightSidebar';
import { ClassicMode } from './components/ClassicMode';
import { SplashZoomMode } from './components/SplashZoomMode';
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
      quote: getDailyTarget(characters, 'quote'),
      skill: getDailyTarget(characters, 'skill'),
    };
  }, []);

  const [practiceTargets, setPracticeTargets] = useState(() => ({
    classic: getRandomTarget(characters),
    splash: getRandomTarget(characters),
    quote: getRandomTarget(characters),
    skill: getRandomTarget(characters),
  }));

  // Guesses State
  const [classicGuesses, setClassicGuesses] = useState<ComparisonResult[]>([]);
  const [splashGuesses, setSplashGuesses] = useState<Character[]>([]);
  const [quoteGuesses, setQuoteGuesses] = useState<Character[]>([]);
  const [skillGuesses, setSkillGuesses] = useState<Character[]>([]);

  // Win States
  const [hasWon, setHasWon] = useState({
    classic: false,
    splash: false,
    quote: false,
    skill: false,
  });

  // Current Target based on mode & daily status
  const currentTarget = isDaily ? dailyTargets[currentMode] : practiceTargets[currentMode];

  const currentAttemptCount = {
    classic: classicGuesses.length,
    splash: splashGuesses.length,
    quote: quoteGuesses.length,
    skill: skillGuesses.length,
  }[currentMode];

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
          setClassicGuesses(rehydrated as ComparisonResult[]);
        }
        if (parsed.splashGuesses && Array.isArray(parsed.splashGuesses)) {
          const rehydrated = parsed.splashGuesses
            .map((sg: { id: string }) => characters.find((c) => c.id === sg.id))
            .filter(Boolean) as Character[];
          setSplashGuesses(rehydrated);
        }
        if (parsed.quoteGuesses && Array.isArray(parsed.quoteGuesses)) {
          const rehydrated = parsed.quoteGuesses
            .map((qg: { id: string }) => characters.find((c) => c.id === qg.id))
            .filter(Boolean) as Character[];
          setQuoteGuesses(rehydrated);
        }
        if (parsed.skillGuesses && Array.isArray(parsed.skillGuesses)) {
          const rehydrated = parsed.skillGuesses
            .map((sk: { id: string }) => characters.find((c) => c.id === sk.id))
            .filter(Boolean) as Character[];
          setSkillGuesses(rehydrated);
        }
        if (parsed.hasWon) setHasWon(parsed.hasWon);
      }
    } catch {
      // Ignore
    }
  }, [dailyTargets]);

  // Save Daily state when daily guesses change
  useEffect(() => {
    if (!isDaily) return;
    const today = new Date().toISOString().slice(0, 10);
    const savedDailyKey = `starraildle_daily_${today}`;
    const payload = {
      classicGuesses,
      splashGuesses,
      quoteGuesses,
      skillGuesses,
      hasWon,
    };
    try {
      localStorage.setItem(savedDailyKey, JSON.stringify(payload));
    } catch {
      // Ignore
    }
  }, [classicGuesses, splashGuesses, quoteGuesses, skillGuesses, hasWon, isDaily]);

  // Mode change handler
  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
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
        quote: getRandomTarget(characters),
        skill: getRandomTarget(characters),
      });
      setClassicGuesses([]);
      setSplashGuesses([]);
      setQuoteGuesses([]);
      setSkillGuesses([]);
      setHasWon({ classic: false, splash: false, quote: false, skill: false });
    }
  };

  // Reset a specific practice mode
  const handleResetPractice = (mode: GameMode) => {
    setPracticeTargets((prev) => ({
      ...prev,
      [mode]: getRandomTarget(characters, prev[mode].id),
    }));
    if (mode === 'classic') setClassicGuesses([]);
    if (mode === 'splash') setSplashGuesses([]);
    if (mode === 'quote') setQuoteGuesses([]);
    if (mode === 'skill') setSkillGuesses([]);
    setHasWon((prev) => ({ ...prev, [mode]: false }));
    setIsVictoryModalOpen(false);
  };

  // Guess Handlers
  const handleClassicGuess = (guessChar: Character) => {
    if (hasWon.classic) return;
    const result = compareCharacters(guessChar, currentTarget);
    const newGuesses = [result, ...classicGuesses];
    setClassicGuesses(newGuesses);

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

  const handleSplashGuess = (guessChar: Character) => {
    if (hasWon.splash) return;
    const newGuesses = [guessChar, ...splashGuesses];
    setSplashGuesses(newGuesses);

    if (guessChar.id === currentTarget.id) {
      setHasWon((prev) => ({ ...prev, splash: true }));
      recordWin('splash', newGuesses.length);
      setIsVictoryModalOpen(true);
    } else {
      soundManager.playFlip(0);
    }
  };

  const handleQuoteGuess = (guessChar: Character) => {
    if (hasWon.quote) return;
    const newGuesses = [guessChar, ...quoteGuesses];
    setQuoteGuesses(newGuesses);

    if (guessChar.id === currentTarget.id) {
      setHasWon((prev) => ({ ...prev, quote: true }));
      recordWin('quote', newGuesses.length);
      setIsVictoryModalOpen(true);
    } else {
      soundManager.playFlip(0);
    }
  };

  const handleSkillGuess = (guessChar: Character) => {
    if (hasWon.skill) return;
    const newGuesses = [guessChar, ...skillGuesses];
    setSkillGuesses(newGuesses);

    if (guessChar.id === currentTarget.id) {
      setHasWon((prev) => ({ ...prev, skill: true }));
      recordWin('skill', newGuesses.length);
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
                guesses={classicGuesses}
                onMakeGuess={handleClassicGuess}
                hasWon={hasWon.classic}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice('classic')}
                language={language}
                colorblindMode={colorblindMode}
              />
            )}

            {currentMode === 'splash' && (
              <SplashZoomMode
                characters={characters}
                target={currentTarget}
                guessedCharacters={splashGuesses}
                onMakeGuess={handleSplashGuess}
                hasWon={hasWon.splash}
                isDaily={isDaily}
                onResetPractice={() => handleResetPractice('splash')}
                language={language}
              />
            )}

            {currentMode === 'quote' && (
              <QuoteMode
                characters={characters}
                target={currentTarget}
                guessedCharacters={quoteGuesses}
                onMakeGuess={handleQuoteGuess}
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
                guessedCharacters={skillGuesses}
                onMakeGuess={handleSkillGuess}
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
            guesses={classicGuesses}
            language={language}
            onClose={() => setIsVictoryModalOpen(false)}
            onNextRound={!isDaily ? () => handleResetPractice(currentMode) : undefined}
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
