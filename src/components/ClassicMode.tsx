import React from 'react';
import type { Character, ComparisonResult, Language, MatchStatus } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';

interface ClassicModeProps {
  characters: Character[];
  target: Character;
  guesses: ComparisonResult[];
  onMakeGuess: (character: Character) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
  colorblindMode: boolean;
}

const STATUS_BADGE: Record<MatchStatus, string> = {
  correct: '✓',
  partial: '±',
  incorrect: '✕',
};

const StatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => (
  <span
    style={{
      position: 'absolute',
      top: 4,
      right: 4,
      width: 16,
      height: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.4)',
      color: '#fff',
    }}
    aria-hidden="true"
  >
    {STATUS_BADGE[status]}
  </span>
);

export const ClassicMode: React.FC<ClassicModeProps> = ({
  characters,
  guesses,
  onMakeGuess,
  hasWon,
  isDaily,
  onResetPractice,
  language,
  colorblindMode,
}) => {
  const isFr = language === 'fr';
  const guessedIds = guesses.map((g) => g.character.id);

  const getGenderText = (gender: string) => {
    if (!isFr) return gender;
    if (gender === 'Male') return 'Homme';
    if (gender === 'Female') return 'Femme';
    return 'Autre';
  };

  return (
    <div className="game-content">
      <CharacterSearch
        characters={characters}
        alreadyGuessedIds={guessedIds}
        onSelectCharacter={onMakeGuess}
        language={language}
        disabled={hasWon}
      />

      <NextRoundButton
        show={hasWon && !isDaily}
        label={isFr ? 'Personnage Suivant' : 'Next Character'}
        onClick={onResetPractice}
      />

      {guesses.length > 0 && (
        <div className="guess-board">
          <div className="table-header-row">
            <div className="th-cell">{isFr ? 'Personnage' : 'Character'}</div>
            <div className="th-cell">{isFr ? 'Genre' : 'Gender'}</div>
            <div className="th-cell">{isFr ? 'Élément' : 'Element'}</div>
            <div className="th-cell">{isFr ? 'Voie' : 'Path'}</div>
            <div className="th-cell">{isFr ? 'Voie Narrative' : 'Lore Path'}</div>
            <div className="th-cell">{isFr ? 'Rareté' : 'Rarity'}</div>
            <div className="th-cell">Version</div>
            <div className="th-cell">{isFr ? 'Matériau Boss' : 'Boss Mat.'}</div>
            <div className="th-cell">{isFr ? 'Monde' : 'World'}</div>
            <div className="th-cell">Faction</div>
          </div>

          {guesses.map((g, rowIndex) => {
            const isNew = rowIndex === 0;
            return (
              <div key={`${g.character.id}-${rowIndex}`} className={`guess-row ${isNew ? 'is-new-guess' : ''}`}>
                <div
                  className={`guess-cell character-cell rarity-${g.character.rarity}`}
                  title={isFr ? g.character.name_fr : g.character.name_en}
                >
                  <img
                    src={g.character.avatar}
                    alt={isFr ? g.character.name_fr : g.character.name_en}
                    className="character-cell-img"
                  />
                  <span className="character-cell-name">
                    {isFr ? g.character.name_fr : g.character.name_en}
                  </span>
                </div>

                <div className={`guess-cell ${g.gender.status}`}>
                  {colorblindMode && <StatusBadge status={g.gender.status} />}
                  <span>{getGenderText(g.gender.value)}</span>
                </div>

                <div className={`guess-cell ${g.element.status}`}>
                  {colorblindMode && <StatusBadge status={g.element.status} />}
                  <img src={g.element.icon} alt="" className="cell-icon" />
                  <span>{isFr ? g.element.name_fr : g.element.name_en}</span>
                </div>

                <div className={`guess-cell ${g.path.status}`}>
                  {colorblindMode && <StatusBadge status={g.path.status} />}
                  <img src={g.path.icon} alt="" className="cell-icon" />
                  <span>{isFr ? g.path.name_fr : g.path.name_en}</span>
                </div>

                <div className={`guess-cell ${g.lore_paths.status}`}>
                  {colorblindMode && <StatusBadge status={g.lore_paths.status} />}
                  <div className="cell-tag-list">
                    {(isFr ? g.lore_paths.all_fr : g.lore_paths.all_en).map((lp, idx) => {
                      const isMatched = (isFr ? g.lore_paths.matching_fr : g.lore_paths.matching_en).includes(lp);
                      return (
                        <span key={idx} className={`cell-tag ${isMatched ? 'highlight' : ''}`}>
                          {lp}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className={`guess-cell ${g.rarity.status}`}>
                  {colorblindMode && <StatusBadge status={g.rarity.status} />}
                  <span className={`rarity-text rarity-${g.rarity.value}`}>
                    {g.rarity.value} ★
                  </span>
                </div>

                <div className={`guess-cell ${g.release_version.status}`}>
                  {colorblindMode && <StatusBadge status={g.release_version.status} />}
                  <span>v{g.release_version.value}</span>
                  {g.release_version.direction !== 'equal' && (
                    <span
                      className="cell-direction"
                      title={
                        g.release_version.direction === 'higher'
                          ? isFr ? 'Sorti après' : 'Released later'
                          : isFr ? 'Sorti avant' : 'Released earlier'
                      }
                    >
                      {g.release_version.direction === 'higher' ? '↑' : '↓'}
                    </span>
                  )}
                </div>

                <div
                  className={`guess-cell ${g.weekly_boss.status}`}
                  title={`${isFr ? g.weekly_boss.boss_name_fr : g.weekly_boss.boss_name_en}`}
                >
                  {colorblindMode && <StatusBadge status={g.weekly_boss.status} />}
                  <img
                    src={g.weekly_boss.icon}
                    alt=""
                    className="cell-icon"
                  />
                  <span className="cell-boss-text">
                    {isFr ? g.weekly_boss.material_name_fr : g.weekly_boss.material_name_en}
                  </span>
                </div>

                <div className={`guess-cell ${g.world.status}`}>
                  {colorblindMode && <StatusBadge status={g.world.status} />}
                  <span className="cell-world-text">
                    {isFr ? g.world.name_fr : g.world.name_en}
                  </span>
                </div>

                <div className={`guess-cell ${g.factions.status}`}>
                  {colorblindMode && <StatusBadge status={g.factions.status} />}
                  <div className="cell-tag-list">
                    {(isFr ? g.factions.all_fr : g.factions.all_en).map((fac, idx) => {
                      const isMatched = (isFr ? g.factions.matching_fr : g.factions.matching_en).includes(fac);
                      return (
                        <span key={idx} className={`cell-tag ${isMatched ? 'highlight' : ''}`}>
                          {fac}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
