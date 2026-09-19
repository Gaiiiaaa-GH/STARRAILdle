import React from 'react';
import type { Character, Language } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';
import { GuessHistoryList } from './GuessHistoryList';
import { Zap, Sparkles } from 'lucide-react';

interface SkillModeProps {
  characters: Character[];
  target: Character;
  guessedCharacters: Character[];
  onMakeGuess: (character: Character) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
}

export const SkillMode: React.FC<SkillModeProps> = ({
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

  const showRarity = hasWon || attempts >= 2;
  const showElement = hasWon || attempts >= 4;

  return (
    <div className="game-content">
      <div className="clue-prompt">
        <h2 className="clue-title">
          {isFr ? 'À qui appartient cette compétence ?' : 'Whose skill or ability is this?'}
        </h2>
        <p className="clue-subtitle">
          {isFr
            ? 'Identifiez le personnage à partir de l\'icône de son aptitude.'
            : 'Identify the character from their ability icon.'}
        </p>
      </div>

      <div className="skill-card">
        <div className="skill-icon-frame">
          <img src={target.skill_hint.icon} alt="" className="skill-icon-img" />
        </div>

        <div className="skill-meta">
          <div className="skill-type-badge">
            <Zap size={12} />
            <span>{target.skill_hint.type || 'Ultimate'}</span>
          </div>

          <div className={`skill-name ${hasWon ? 'revealed' : ''}`}>
            {hasWon
              ? isFr ? target.skill_hint.name_fr : target.skill_hint.name_en
              : isFr ? '??? (Nom masqué)' : '??? (Hidden Name)'}
          </div>
        </div>

        <div className="clue-pills">
          <div className={`clue-pill ${showRarity ? 'unlocked' : ''}`}>
            <Sparkles size={12} />
            <span>
              {isFr ? 'Rareté : ' : 'Rarity: '}
              {showRarity ? `${target.rarity}★` : (isFr ? '2 essais requis' : '2 tries required')}
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
                : isFr ? '4 essais requis' : '4 tries required'}
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
        label={isFr ? 'Compétence Suivante' : 'Next Skill'}
        onClick={onResetPractice}
      />

      <GuessHistoryList guessedCharacters={guessedCharacters} targetId={target.id} language={language} />
    </div>
  );
};
