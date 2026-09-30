import React, { useState, useRef, useEffect } from 'react';
import type { Character, Language } from '../types';
import { Search, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { searchCharacters } from '../utils/gameLogic';

const EASY_MODE_KEY = 'starraildle_easy_search';

interface CharacterSearchProps {
  characters: Character[];
  alreadyGuessedIds: string[];
  onSelectCharacter: (character: Character) => void;
  language: Language;
  disabled?: boolean;
}

export const CharacterSearch: React.FC<CharacterSearchProps> = ({
  characters,
  alreadyGuessedIds,
  onSelectCharacter,
  language,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  // Only one search bar is mounted at a time (one per game mode), so reading
  // the saved choice on mount is enough to share it across modes.
  const [easyMode, setEasyMode] = useState(() => localStorage.getItem(EASY_MODE_KEY) === 'true');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isFr = language === 'fr';

  const filtered = searchCharacters(
    characters.filter((c) => !alreadyGuessedIds.includes(c.id)),
    query,
    language,
    easyMode
  );

  const toggleEasyMode = () => {
    soundManager.playSelect();
    setEasyMode((prev) => {
      localStorage.setItem(EASY_MODE_KEY, String(!prev));
      return !prev;
    });
  };
  const easyModeLabel = isFr ? 'Mode facile : autoriser la recherche par élément ou voie' : 'Easy mode: allow searching by element or path';

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (character: Character) => {
    soundManager.playSelect();
    onSelectCharacter(character);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) return;

    const maxItems = Math.min(filtered.length, 10);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % maxItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + maxItems) % maxItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`search-easy-toggle ${easyMode ? 'active' : ''}`}
        onClick={toggleEasyMode}
        aria-pressed={easyMode}
        aria-label={easyModeLabel}
        title={easyModeLabel}
      >
        <Sparkles size={14} />
        <span>{isFr ? 'Mode facile' : 'Easy mode'}</span>
      </button>
      <div className="search-field">
        <div className="search-input-box">
          <Search size={20} color="#f5b335" />
          <input
            type="text"
            className="search-input"
            placeholder={
              disabled
                ? isFr
                  ? 'Partie terminée !'
                  : 'Game finished!'
                : easyMode
                ? isFr
                  ? 'Nom, élément ou voie (ex: Kafka, Feu, Chasse...)'
                  : 'Name, element or path (e.g. Kafka, Fire, Hunt...)'
                : isFr
                ? 'Tapez le nom d\'un personnage (ex: Acheron, Kafka, Feixiao...)'
                : 'Type a character name (e.g. Acheron, Kafka, Feixiao...)'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        {isOpen && filtered.length > 0 && !disabled && (
          <div className="search-dropdown">
            {filtered.slice(0, 10).map((char, index) => (
              <div
                key={char.id}
                className={`search-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleSelect(char)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <img
                  src={char.avatar}
                  alt={isFr ? char.name_fr : char.name_en}
                  className="search-item-avatar"
                  loading="lazy"
                />
                <span className="search-item-name">{isFr ? char.name_fr : char.name_en}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
