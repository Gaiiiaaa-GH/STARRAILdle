import React from 'react';
import type { GameMode, Language } from '../types';
import { CheckCircle2, AlertCircle, XCircle, ArrowUp, Sparkles, BookOpen } from 'lucide-react';

interface RightSidebarProps {
  language: Language;
  currentMode: GameMode;
  attemptCount: number;
  onOpenHelp: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  language,
  currentMode,
  attemptCount,
  onOpenHelp,
}) => {
  const isFr = language === 'fr';

  const modeDescriptions = {
    classic: isFr
      ? 'Déduisez le personnage grâce à 9 attributs clés (Élément, Voie, Voie Narrative, Rareté, Version, Boss, Monde, Factions).'
      : 'Deduce the character from 9 key attributes (Element, Path, Lore Path, Rarity, Version, Boss, World, Factions).',
    splash: isFr
      ? 'Reconnaissez le personnage à sa silhouette : l\'image dézoome et se recentre à chaque tentative.'
      : 'Recognize the character from their silhouette — the image zooms out and recenters with each attempt.',
    quote: isFr
      ? 'Trouvez l\'auteur de cette réplique culte. Des indices se débloquent progressivement.'
      : 'Identify who speaks this iconic voice line. Hints unlock as you guess.',
    skill: isFr
      ? 'Identifiez le personnage à partir de l\'icône de son ultime ou de sa compétence.'
      : 'Name the character from their ability / ultimate icon.',
  };

  return (
    <aside className="right-panel-guide">
      <div className="guide-card-header">
        <Sparkles size={18} color="var(--gold-star)" />
        <span className="guide-header-title">
          {isFr ? 'GUIDE DES INDICES' : 'CLUE PROTOCOL'}
        </span>
      </div>

      <p className="guide-mode-desc">{modeDescriptions[currentMode]}</p>

      {/* Color Code Breakdown */}
      <div className="guide-indicators-list">
        <div className="guide-indicator-row correct">
          <CheckCircle2 size={18} className="guide-icon correct" />
          <div>
            <div className="guide-indicator-title">{isFr ? 'Vert : Exact' : 'Green: Exact'}</div>
            <div className="guide-indicator-detail">
              {isFr ? 'Attribut identique à la cible.' : 'Matches the target exactly.'}
            </div>
          </div>
        </div>

        <div className="guide-indicator-row partial">
          <AlertCircle size={18} className="guide-icon partial" />
          <div>
            <div className="guide-indicator-title">{isFr ? 'Orange : Partiel' : 'Orange: Partial'}</div>
            <div className="guide-indicator-detail">
              {isFr
                ? 'Monde/Faction partagée, boss du même monde, ou version proche (±2 patchs).'
                : 'Shared world/faction, same boss planet, or close version (±2 patches).'}
            </div>
          </div>
        </div>

        <div className="guide-indicator-row incorrect">
          <XCircle size={18} className="guide-icon incorrect" />
          <div>
            <div className="guide-indicator-title">{isFr ? 'Rouge : Incorrect' : 'Red: Wrong'}</div>
            <div className="guide-indicator-detail">
              {isFr ? 'Aucun lien ou valeur différente.' : 'No overlap or different value.'}
            </div>
          </div>
        </div>

        <div className="guide-indicator-row arrow">
          <ArrowUp size={18} className="guide-icon arrow" />
          <div>
            <div className="guide-indicator-title">{isFr ? 'Flèches ↑ / ↓' : 'Arrows ↑ / ↓'}</div>
            <div className="guide-indicator-detail">
              {isFr ? 'Indique si sorti après (↑) ou avant (↓).' : 'Released later (↑) or earlier (↓).'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Counter */}
      <div className="guide-status-box">
        <div>
          <div className="guide-status-label">{isFr ? 'Tentatives :' : 'Current Tries:'}</div>
          <div className="guide-status-val">{attemptCount}</div>
        </div>
        <button className="guide-learn-more-btn" onClick={onOpenHelp}>
          <BookOpen size={14} />
          <span>{isFr ? 'Règles complètes' : 'Full Rules'}</span>
        </button>
      </div>
    </aside>
  );
};
