import React, { useEffect, useState } from 'react';
import type { Character, ComparisonResult, GameMode, Language } from '../types';
import { Share2, Check, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateShareResult } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';
import { Modal } from './Modal';

interface VictoryModalProps {
  target: Character;
  mode: GameMode;
  isDaily: boolean;
  guesses: ComparisonResult[] | Character[];
  language: Language;
  onClose: () => void;
  onNextRound?: () => void;
  onNextMode?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  target,
  mode,
  isDaily,
  guesses,
  language,
  onClose,
  onNextRound,
  onNextMode,
}) => {
  const [copied, setCopied] = useState(false);
  const isFr = language === 'fr';

  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4a44a', '#38bdf8', '#34d399', '#fff'],
    });
  }, []);

  const handleShare = () => {
    soundManager.playSelect();
    const shareText = generateShareResult(mode, isDaily, guesses, true, language);
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal onClose={onClose}>
        <div className="victory-card">
          <div className="victory-avatar-wrap">
            <img
              src={target.avatar}
              alt={isFr ? target.name_fr : target.name_en}
              className="victory-avatar"
            />
          </div>

          <div>
            <div className="brand-subtext" style={{ marginBottom: '4px' }}>
              {isFr ? 'FÉLICITATIONS' : 'CONGRATULATIONS'}
            </div>
            <h2 className="victory-title">{isFr ? target.name_fr : target.name_en}</h2>
            <div className="victory-subtitle">
              {isFr
                ? `Trouvé en ${guesses.length} tentative${guesses.length > 1 ? 's' : ''}`
                : `Solved in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}`}
            </div>
          </div>

          <div className="victory-quote">
            « {isFr ? target.quotes[0].fr : target.quotes[0].en} »
          </div>

          <div className="victory-attrs">
            <div>
              <span className="attr-label">{isFr ? 'Élément : ' : 'Element: '}</span>
              <span className="attr-value">{isFr ? target.element.name_fr : target.element.name_en}</span>
            </div>
            <div>
              <span className="attr-label">{isFr ? 'Voie : ' : 'Path: '}</span>
              <span className="attr-value">{isFr ? target.path.name_fr : target.path.name_en}</span>
            </div>
            {(() => {
              const distinct = target.lore_paths.filter((lp) => lp.name_en !== target.path.name_en);
              if (distinct.length === 0) return null;
              return (
                <div className="attr-span">
                  <span className="attr-label">{isFr ? 'Voie(s) narrative(s) : ' : 'Lore Path(s): '}</span>
                  <span className="attr-value">
                    {distinct.map((lp) => (isFr ? lp.name_fr : lp.name_en)).join(', ')}
                  </span>
                </div>
              );
            })()}
            <div>
              <span className="attr-label">{isFr ? 'Version : ' : 'Version: '}</span>
              <span className="attr-value">v{target.release_version}</span>
            </div>
            <div>
              <span className="attr-label">{isFr ? 'Rareté : ' : 'Rarity: '}</span>
              <span className="attr-value">{target.rarity} ★</span>
            </div>
            <div className="attr-span">
              <span className="attr-label">{isFr ? 'Boss : ' : 'Boss: '}</span>
              <span className="attr-value">
                {isFr ? target.weekly_boss.material_name_fr : target.weekly_boss.material_name_en}
              </span>
            </div>
            <div>
              <span className="attr-label">{isFr ? 'Monde : ' : 'World: '}</span>
              <span className="attr-value">{isFr ? target.world_fr : target.world_en}</span>
            </div>
            <div>
              <span className="attr-label">{isFr ? 'Factions : ' : 'Factions: '}</span>
              <span className="attr-value">
                {(isFr ? target.factions_fr : target.factions_en).join(', ')}
              </span>
            </div>
          </div>

          <div className="victory-actions">
            <button className="share-btn" onClick={handleShare}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>
                {copied
                  ? isFr ? 'Copié !' : 'Copied!'
                  : isFr ? 'Partager' : 'Share Results'}
              </span>
            </button>

            {!isDaily && onNextRound && (
              <button
                className="action-btn"
                onClick={() => { onClose(); onNextRound(); }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RotateCcw size={14} />
                <span>{isFr ? 'Rejouer' : 'Play Again'}</span>
              </button>
            )}

            {isDaily && onNextMode && (
              <button
                className="action-btn active"
                onClick={() => { onClose(); onNextMode(); }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ArrowRight size={14} />
                <span>{isFr ? 'Mode Suivant' : 'Next Mode'}</span>
              </button>
            )}
          </div>
        </div>
    </Modal>
  );
};
