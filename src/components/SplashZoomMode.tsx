import React, { useEffect, useState } from 'react';
import type { Character, Language } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';
import { GuessHistoryList } from './GuessHistoryList';
import { Sparkles, Lightbulb } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getSilhouetteAnchor, type Anchor } from '../utils/silhouetteAnchor';

interface SplashZoomModeProps {
  characters: Character[];
  target: Character;
  guessedCharacters: Character[];
  onMakeGuess: (character: Character) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
}

// Progressive zoom-out over a black silhouette, transform-origin held fixed
// at the computed anchor — no color fade, no manual pan/lerp needed: CSS
// `transform: scale(s)` around a fixed origin already pulls the visible crop
// toward the image's center as `s` drops toward 1 (see silhouetteAnchor.ts),
// so shrinking the scale alone produces the "zoom out and recenter" motion.
const ZOOM_STEPS = [3.0, 2.4, 1.95, 1.6, 1.3, 1.1];

export const SplashZoomMode: React.FC<SplashZoomModeProps> = ({
  characters,
  target,
  guessedCharacters,
  onMakeGuess,
  hasWon,
  isDaily,
  onResetPractice,
  language,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({ x: 50, y: 42 });
  const isFr = language === 'fr';
  const attempts = guessedCharacters.length;
  const guessedIds = guessedCharacters.map((c) => c.id);

  const splashArtSrc = target.portrait || target.avatar;

  useEffect(() => {
    let cancelled = false;
    getSilhouetteAnchor(splashArtSrc, ZOOM_STEPS[0]).then((a) => {
      if (!cancelled) setAnchor(a);
    });
    return () => { cancelled = true; };
  }, [splashArtSrc]);

  const scale = ZOOM_STEPS[Math.min(attempts, ZOOM_STEPS.length - 1)];

  const imgStyle: React.CSSProperties = hasWon
    ? { transform: 'scale(1)', transformOrigin: '50% 50%', filter: 'none' }
    : {
        transform: `scale(${scale})`,
        transformOrigin: `${anchor.x}% ${anchor.y}%`,
        filter: 'brightness(0)',
      };

  return (
    <div className="game-content">
      <div className="splash-mode-header">
        <h2 className="splash-mode-title">
          {hasWon
            ? isFr ? `C'est ${target.name_fr} !` : `It's ${target.name_en}!`
            : isFr ? 'Devinez la Silhouette' : 'Guess the Silhouette'}
        </h2>
        <p className="splash-mode-sub">
          {isFr
            ? 'L\'image dézoome et se recentre à chaque tentative.'
            : 'The image zooms out and recenters with each attempt.'}
        </p>
      </div>

      <div className={`splash-viewport-frame ${hasWon ? 'victory-glow' : ''}`}>
        <div className="silhouette-stage">
          {/* Remounted per target: without this, switching to a new round
              reuses the same <img>, so its CSS transition animates FROM the
              previous round's revealed style, flashing the new answer. */}
          <img
            key={target.id}
            src={splashArtSrc}
            alt={hasWon ? (isFr ? target.name_fr : target.name_en) : ''}
            className="silhouette-layer"
            style={imgStyle}
          />
        </div>

        {!hasWon && (
          <div className="splash-step-pill">
            <span>{isFr ? 'Tentative' : 'Attempt'}</span>
            <span className="splash-step-count">{attempts}</span>
          </div>
        )}

        {hasWon && (
          <div className="splash-victory-badge">
            <Sparkles size={14} />
            <span>{isFr ? 'TROUVÉ' : 'SOLVED'}</span>
          </div>
        )}

        {attempts >= 3 && !hasWon && (
          <div className="splash-hint-pod">
            {!showHint ? (
              <button className="splash-hint-trigger" onClick={() => { soundManager.playSelect(); setShowHint(true); }}>
                <Lightbulb size={14} />
                <span>{isFr ? 'Indice' : 'Hint'}</span>
              </button>
            ) : (
              <div className="splash-hint-card">
                <img src={target.element.icon} alt="" className="clue-pill-icon" />
                <span>{isFr ? target.element.name_fr : target.element.name_en}</span>
                <span>·</span>
                <img src={target.path.icon} alt="" className="clue-pill-icon" />
                <span>{isFr ? target.path.name_fr : target.path.name_en}</span>
              </div>
            )}
          </div>
        )}
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
        label={isFr ? 'Suivant' : 'Next'}
        onClick={() => { setShowHint(false); onResetPractice(); }}
      />

      <GuessHistoryList guessedCharacters={guessedCharacters} targetId={target.id} language={language} />
    </div>
  );
};
