import React from 'react';
import type { Character, Language } from '../types';

interface GuessHistoryListProps {
  guessedCharacters: Character[];
  targetId: string;
  language: Language;
}

export const GuessHistoryList: React.FC<GuessHistoryListProps> = ({
  guessedCharacters,
  targetId,
  language,
}) => {
  if (guessedCharacters.length === 0) return null;
  const isFr = language === 'fr';

  return (
    <div className="guess-history">
      {guessedCharacters.map((char, idx) => {
        const isCorrect = char.id === targetId;
        return (
          <div key={idx} className={`guess-history-item ${isCorrect ? 'correct' : 'wrong'}`}>
            <img
              src={char.avatar}
              alt={isFr ? char.name_fr : char.name_en}
              className="guess-history-avatar"
            />
            <span className="guess-history-name">{isFr ? char.name_fr : char.name_en}</span>
            <span>{isCorrect ? '✓' : '✗'}</span>
          </div>
        );
      })}
    </div>
  );
};
