import React, { useState, useRef, useEffect } from 'react';
import type { Character, Language } from '../types';
import { Search } from 'lucide-react';
import { soundManager } from '../utils/audio';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isFr = language === 'fr';

  // Filter available characters
  const filtered = query.trim()
    ? characters
        .filter((c) => !alreadyGuessedIds.includes(c.id))
        .filter((c) => {
          const q = query.toLowerCase().trim();
          return (
            c.name_en.toLowerCase().includes(q) ||
            c.name_fr.toLowerCase().includes(q) ||
            c.tag.toLowerCase().includes(q) ||
            c.element.name_en.toLowerCase().includes(q) ||
            c.element.name_fr.toLowerCase().includes(q) ||
            c.path.name_en.toLowerCase().includes(q) ||
            c.path.name_fr.toLowerCase().includes(q)
          );
        })
    : [];

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
  );
};
