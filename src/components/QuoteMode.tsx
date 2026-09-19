import React, { useMemo } from 'react';
import type { Character, Language } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';
import { GuessHistoryList } from './GuessHistoryList';
import { Quote as QuoteIcon, Sparkles } from 'lucide-react';
import { pickSeeded } from '../utils/gameLogic';

interface QuoteModeProps {
  characters: Character[];
  target: Character;
  guessedCharacters: Character[];
  onMakeGuess: (character: Character) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
}

export const QuoteMode: React.FC<QuoteModeProps> = ({
  characters,
  target,
  guessedCharacters,
  onMakeGuess,
  hasWon,
  isDaily,
  onResetPractice,
  language,
}) => {
  const isFr = language === 'fr';
  const attempts = guessedCharacters.length;
  const guessedIds = guessedCharacters.map((c) => c.id);

  const showRarity = hasWon || attempts >= 1;
  const showElement = hasWon || attempts >= 3;
  const showPath = hasWon || attempts >= 5;

  // Stable per round: same quote for the whole daily round (and across
  // reloads, since it's seeded off the date), a fresh pick each practice round.
  const quoteSeed = isDaily
    ? `${target.id}_daily_${new Date().toISOString().slice(0, 10)}`
    : `${target.id}_practice`;
  const quote = useMemo(() => pickSeeded(target.quotes, quoteSeed), [target.quotes, quoteSeed]);

  return (
    <div className="game-content">
      <div className="clue-prompt">
        <h2 className="clue-title">
          {isFr ? 'Qui a dit cette réplique ?' : 'Who said this iconic quote?'}
        </h2>
        <p className="clue-subtitle">
          {isFr
            ? 'Devinez le personnage d\'après sa citation. Des indices se débloquent avec les essais.'
            : 'Guess the character from their voice line. Clues unlock after failed tries.'}
        </p>
      </div>

      <div className="quote-card">
        <QuoteIcon size={28} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '0.65rem' }} />
        <blockquote className="quote-text">
          « {isFr ? quote.fr : quote.en} »
        </blockquote>

        <div className="clue-pills">
          <div className={`clue-pill ${showRarity ? 'unlocked' : ''}`}>
            <Sparkles size={14} />
            <span>
              {isFr ? 'Rareté : ' : 'Rarity: '}
              {showRarity ? `${target.rarity}★` : (isFr ? 'Débloqué à 1 essai' : 'Unlocked at 1 try')}
            </span>
          </div>

          <div className={`clue-pill ${showElement ? 'unlocked-cyan' : ''}`}>
            {showElement && (
              <img src={target.element.icon} alt="" className="clue-pill-icon" />
            )}
            <span>
              {isFr ? 'Élément : ' : 'Element: '}
              {showElement
                ? isFr ? target.element.name_fr : target.element.name_en
                : isFr ? 'Débloqué à 3 essais' : 'Unlocked at 3 tries'}
            </span>
          </div>

          <div className={`clue-pill ${showPath ? 'unlocked-purple' : ''}`}>
            {showPath && (
              <img src={target.path.icon} alt="" className="clue-pill-icon" />
            )}
            <span>
              {isFr ? 'Voie : ' : 'Path: '}
              {showPath
                ? isFr ? target.path.name_fr : target.path.name_en
                : isFr ? 'Débloqué à 5 essais' : 'Unlocked at 5 tries'}
            </span>
          </div>
        </div>
      </div>

      <CharacterSearch
        characters={characters}
        alreadyGuessedIds={guessedIds}
        onSelectCharacter={onMakeGuess}
        language={language}
        disabled={hasWon}
      />

      <NextRoundButton
        show={hasWon && !isDaily}
        label={isFr ? 'Citation Suivante' : 'Next Quote'}
        onClick={onResetPractice}
      />

      <GuessHistoryList guessedCharacters={guessedCharacters} targetId={target.id} language={language} />
    </div>
  );
};
