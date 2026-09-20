import React, { useEffect, useMemo, useState } from 'react';
import type { Character, Language } from '../types';
import { CharacterSearch } from './CharacterSearch';
import { NextRoundButton } from './NextRoundButton';
import { GuessHistoryList } from './GuessHistoryList';
import { Sparkles, Lightbulb } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getSilhouetteAnchor, type Anchor, type AnchorMode } from '../utils/silhouetteAnchor';
import bannerManifest from '../data/bannerManifest.json';

export type SplashVariant = 'splashArt' | 'portrait' | 'grayscale';

interface SplashZoomModeProps {
  variant: SplashVariant;
  characters: Character[];
  target: Character;
  guessedCharacters: Character[];
  onMakeGuess: (character: Character) => void;
  hasWon: boolean;
  isDaily: boolean;
  onResetPractice: () => void;
  language: Language;
}

// Progressive zoom-out over a fixed transform-origin — no manual pan/lerp
// needed: CSS `transform: scale(s)` around a fixed origin already pulls the
// visible crop toward the image's center as `s` drops toward 1 (see
// silhouetteAnchor.ts), so shrinking the scale alone produces the
// "zoom out and recenter" motion.
const ZOOM_STEPS = [3.0, 2.4, 1.95, 1.6, 1.3, 1.1];

const bannerIds: Set<string> = new Set(bannerManifest as string[]);

const COPY: Record<SplashVariant, { titleFr: string; titleEn: string; subFr: string; subEn: string }> = {
  splashArt: {
    titleFr: 'Devinez la Silhouette',
    titleEn: 'Guess the Silhouette',
    subFr: "L'art officiel dézoome et se recentre à chaque tentative.",
    subEn: 'The official splash art zooms out and recenters with each attempt.',
  },
  portrait: {
    titleFr: 'Devinez le Portrait',
    titleEn: 'Guess the Portrait',
    subFr: "Le portrait officiel dézoome et se recentre à chaque tentative.",
    subEn: "The character's official portrait zooms out and recenters with each attempt.",
  },
  grayscale: {
    titleFr: 'Devinez en Noir et Blanc',
    titleEn: 'Guess in Black & White',
    subFr: "L'art promotionnel, désaturé, dézoome à chaque tentative.",
    subEn: 'The promo art, desaturated, zooms out with each attempt.',
  },
};

export const SplashZoomMode: React.FC<SplashZoomModeProps> = ({
  variant,
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
  const copy = COPY[variant];

  // Fresh per round: stable for everyone on the same daily target, a new
  // draw each time practice hands out a new character (never re-rolled just
  // by toggling daily/practice, so a round in progress never shifts under you).
  // target.id isn't read in the callback -- it's only here to force a new
  // value each time practice moves to a different character.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const practiceRoundNonce = useMemo(() => Math.random().toString(36).slice(2), [target.id]);
  const today = new Date().toISOString().slice(0, 10);
  const roundSeed = isDaily
    ? `${target.id}_daily_${today}_${variant}`
    : `${target.id}_practice_${practiceRoundNonce}_${variant}`;

  const anchorMode: AnchorMode = variant === 'grayscale' ? 'contrast' : 'opacity';

  // Each mode has its own dedicated source image -- no more mixing, so a
  // character's Portrait mode look never bleeds into Splash Art or vice versa.
  const splashArtSrc = useMemo(() => {
    if (variant === 'portrait') {
      return target.portrait || target.avatar;
    }
    if (variant === 'grayscale') {
      if (bannerIds.has(target.id)) return `/assets/banners/${target.id}.webp`;
      return target.splash_art || target.avatar;
    }
    return target.splash_art || target.avatar;
  }, [variant, target.id, target.portrait, target.splash_art, target.avatar]);

  useEffect(() => {
    let cancelled = false;
    getSilhouetteAnchor(splashArtSrc, ZOOM_STEPS[0], `${roundSeed}_anchor`, anchorMode).then((a) => {
      if (!cancelled) setAnchor(a);
    });
    return () => { cancelled = true; };
  }, [splashArtSrc, roundSeed, anchorMode]);

  const scale = ZOOM_STEPS[Math.min(attempts, ZOOM_STEPS.length - 1)];

  const imgStyle: React.CSSProperties = hasWon
    ? { transform: 'scale(1)', transformOrigin: '50% 50%', filter: 'none' }
    : {
        transform: `scale(${scale})`,
        transformOrigin: `${anchor.x}% ${anchor.y}%`,
        filter: variant === 'grayscale' ? 'grayscale(100%)' : 'brightness(0)',
      };

  return (
    <div className="game-content">
      <div className="splash-mode-header">
        <h2 className="splash-mode-title">
          {hasWon
            ? isFr ? `C'est ${target.name_fr} !` : `It's ${target.name_en}!`
            : isFr ? copy.titleFr : copy.titleEn}
        </h2>
        <p className="splash-mode-sub">{isFr ? copy.subFr : copy.subEn}</p>
      </div>

      <div className={`splash-viewport-frame ${variant === 'grayscale' ? 'mode-grayscale' : ''} ${hasWon ? 'victory-glow' : ''}`}>
        <div className="silhouette-stage">
          {/* Remounted per target: without this, switching to a new round
              reuses the same <img>, so its CSS transition animates FROM the
              previous round's revealed style, flashing the new answer. */}
          <img
            key={`${target.id}_${variant}`}
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
