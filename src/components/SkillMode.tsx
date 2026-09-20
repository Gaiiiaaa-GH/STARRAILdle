import React, { useEffect, useMemo, useState } from 'react';
import type { Character, Language } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';
import { GuessHistoryList } from './GuessHistoryList';
import { Zap, Sparkles, Check, X } from 'lucide-react';
import { pickSeeded } from '../utils/gameLogic';

interface SkillModeProps {
  characters: Character[];
  target: Character;
  guessedCharacters: Character[];
  onMakeGuess: (character: Character) => void;
  // Challenge Mode only: finding the character records the guess without
  // winning the round (onCharacterFound); the round is decided once the
  // ability-type question is answered (onChallengeResult) -- a wrong answer
  // never wins, there's no half-credit for finding the character alone.
  onCharacterFound: (character: Character) => void;
  onChallengeResult: (correct: boolean) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
}

const ALL_TYPES = ['Basic ATK', 'Skill', 'Ultimate', 'Talent', 'Technique'] as const;
const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  'Basic ATK': { fr: 'Attaque de base', en: 'Basic ATK' },
  Skill: { fr: 'Compétence', en: 'Skill' },
  Ultimate: { fr: 'Ultime', en: 'Ultimate' },
  Talent: { fr: 'Talent', en: 'Talent' },
  Technique: { fr: 'Technique', en: 'Technique' },
};

export const SkillMode: React.FC<SkillModeProps> = ({
  characters,
  target,
  guessedCharacters,
  onMakeGuess,
  onCharacterFound,
  onChallengeResult,
  hasWon,
  isDaily,
  onResetPractice,
  language,
}) => {
  const isFr = language === 'fr';
  const attempts = guessedCharacters.length;
  const guessedIds = guessedCharacters.map((c) => c.id);
  const characterIdentified = guessedIds.includes(target.id);

  const [challengeMode, setChallengeMode] = useState(
    () => localStorage.getItem('starraildle_challenge_mode') === 'true'
  );
  const [typeAnswer, setTypeAnswer] = useState<string | null>(null);

  useEffect(() => {
    setTypeAnswer(null);
  }, [target.id]);

  const toggleChallengeMode = () => {
    setChallengeMode((prev) => {
      const next = !prev;
      localStorage.setItem('starraildle_challenge_mode', String(next));
      return next;
    });
  };

  // Terminal either way once the type question has been answered, win or
  // lose -- lets Next/search re-enable instead of leaving the round stuck.
  const roundOver = hasWon || (challengeMode && characterIdentified && typeAnswer !== null);

  const handleSelect = (character: Character) => {
    const isCorrectId = character.id === target.id;
    if (isCorrectId && challengeMode && !hasWon) {
      onCharacterFound(character);
    } else {
      onMakeGuess(character);
    }
  };

  const handleTypeAnswer = (type: string) => {
    setTypeAnswer(type);
    onChallengeResult(type === skill.type);
  };

  // Same ability for everyone on a given daily round; a fresh pick per
  // practice character (each character can have up to 5 distinct abilities
  // -- Basic ATK/Skill/Ultimate/Talent/Technique -- so this also varies
  // which one Skill mode shows, not just whether Challenge Mode is on).
  const today = new Date().toISOString().slice(0, 10);
  const skillSeed = isDaily ? `${target.id}_daily_${today}` : `${target.id}_practice`;
  const skill = useMemo(() => pickSeeded(target.skill_hints, skillSeed), [target.skill_hints, skillSeed]);

  const showRarity = characterIdentified || attempts >= 2;
  const showElement = characterIdentified || attempts >= 4;
  // In Challenge Mode the type stays hidden after guessing the character
  // until the follow-up question is answered, otherwise it'd give the
  // answer away for free.
  const showType = characterIdentified && (!challengeMode || typeAnswer !== null);
  const isTypeCorrect = typeAnswer === skill.type;

  let title: string;
  if (hasWon) {
    title = isFr ? `C'est ${target.name_fr} !` : `It's ${target.name_en}!`;
  } else if (characterIdentified && challengeMode && typeAnswer === null) {
    title = isFr ? `Bravo, c'est ${target.name_fr} ! Quel type de compétence ?` : `Nice, it's ${target.name_en}! What type of ability?`;
  } else if (characterIdentified && challengeMode) {
    title = isFr ? 'Raté pour le type...' : 'Missed the type...';
  } else {
    title = isFr ? 'À qui appartient cette compétence ?' : 'Whose skill or ability is this?';
  }

  return (
    <div className="game-content">
      <div className="clue-prompt">
        <h2 className="clue-title">{title}</h2>
        <p className="clue-subtitle">
          {isFr
            ? 'Identifiez le personnage à partir de l\'icône de son aptitude.'
            : 'Identify the character from their ability icon.'}
        </p>
        <button
          className={`challenge-toggle ${challengeMode ? 'active' : ''}`}
          onClick={toggleChallengeMode}
          disabled={characterIdentified}
          aria-pressed={challengeMode}
        >
          <Zap size={13} />
          <span>{isFr ? 'Mode Challenge' : 'Challenge Mode'}</span>
        </button>
      </div>

      <div className="skill-card">
        <div className="skill-icon-frame">
          <img src={skill.icon} alt="" className="skill-icon-img" />
        </div>

        <div className="skill-meta">
          <div className="skill-type-badge">
            <Zap size={12} />
            <span>{showType ? (isFr ? TYPE_LABELS[skill.type]?.fr : TYPE_LABELS[skill.type]?.en) ?? skill.type : '???'}</span>
          </div>

          <div className={`skill-name ${characterIdentified ? 'revealed' : ''}`}>
            {characterIdentified
              ? isFr ? skill.name_fr : skill.name_en
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

        {characterIdentified && challengeMode && (
          <div className="challenge-question">
            {typeAnswer === null ? (
              <>
                <p className="challenge-question-title">
                  {isFr ? 'Quel type de compétence est-ce ? Une seule chance !' : 'What type of ability is this? One shot!'}
                </p>
                <div className="challenge-options">
                  {ALL_TYPES.map((t) => (
                    <button key={t} className="challenge-option-btn" onClick={() => handleTypeAnswer(t)}>
                      {isFr ? TYPE_LABELS[t].fr : TYPE_LABELS[t].en}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={`challenge-result ${isTypeCorrect ? 'correct' : 'wrong'}`}>
                {isTypeCorrect ? <Check size={16} /> : <X size={16} />}
                <span>
                  {isTypeCorrect
                    ? isFr ? 'Exact !' : 'Correct!'
                    : isFr
                      ? `Manche perdue — c'était : ${TYPE_LABELS[skill.type]?.fr ?? skill.type}`
                      : `Round lost — it was: ${TYPE_LABELS[skill.type]?.en ?? skill.type}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <CharacterSearch
        characters={characters}
        alreadyGuessedIds={guessedIds}
        onSelectCharacter={handleSelect}
        language={language}
        disabled={hasWon || characterIdentified}
      />

      <NextRoundButton
        show={roundOver && !isDaily}
        label={isFr ? 'Compétence Suivante' : 'Next Skill'}
        onClick={onResetPractice}
      />

      <GuessHistoryList guessedCharacters={guessedCharacters} targetId={target.id} language={language} />
    </div>
  );
};
