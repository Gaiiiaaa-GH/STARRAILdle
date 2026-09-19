import React from 'react';
import type { GameMode, Language } from '../types';
import { HelpCircle, BarChart3, Volume2, VolumeX, Grid, Image, MessageSquare, Flame, Eye, EyeOff, Calendar, Infinity as InfinityIcon, UserRound, Contrast } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isDaily: boolean;
  onToggleDaily: (daily: boolean) => void;
  language: Language;
  onToggleLanguage: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  colorblindMode: boolean;
  onToggleColorblindMode: () => void;
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenGallery: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  isDaily,
  onToggleDaily,
  language,
  onToggleLanguage,
  isMuted,
  onToggleMute,
  colorblindMode,
  onToggleColorblindMode,
  onOpenHelp,
  onOpenStats,
  onOpenGallery,
}) => {
  const isFr = language === 'fr';

  const modes: { id: GameMode; labelFr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'classic', labelFr: 'Classique', labelEn: 'Classic', icon: <Grid size={17} /> },
    { id: 'splash', labelFr: 'Splash Art', labelEn: 'Splash Art', icon: <Image size={17} /> },
    { id: 'portrait', labelFr: 'Portrait', labelEn: 'Portrait', icon: <UserRound size={17} /> },
    { id: 'grayscale', labelFr: 'Noir & Blanc', labelEn: 'Black & White', icon: <Contrast size={17} /> },
    { id: 'quote', labelFr: 'Citation', labelEn: 'Quote', icon: <MessageSquare size={17} /> },
    { id: 'skill', labelFr: 'Compétence', labelEn: 'Skill', icon: <Flame size={17} /> },
  ];

  const handleModeClick = (mode: GameMode) => {
    soundManager.playSelect();
    onSelectMode(mode);
  };

  return (
    <header className="station-header-bar">
      <div className="station-header-inner">
        {/* Brand Terminal Logo */}
        <div 
          className="brand-title" 
          onClick={() => handleModeClick('classic')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleModeClick('classic'); }}
        >
          <div className="brand-icon-box">
            <img src="/assets/characters/1406.png" alt="Cipher" className="brand-cipher-icon" />
          </div>
          <div>
            <div className="brand-text">
              STARRAIL<span>dle</span>
            </div>
            <div className="brand-subtext">
              {'STATION // ARCHIVE_DUEL'}
            </div>
          </div>
        </div>

        {/* Central Tactical Modes Selector */}
        <nav className="mode-nav">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`mode-tab ${currentMode === m.id ? 'active' : ''}`}
              onClick={() => handleModeClick(m.id)}
            >
              {m.icon}
              <span>{isFr ? m.labelFr : m.labelEn}</span>
            </button>
          ))}
        </nav>

        {/* Right Tools & Daily/Practice Pill */}
        <div className="header-actions">
          {/* Embedded Daily / Practice Switch */}
          <div className="type-toggle">
            <button
              className={`type-btn ${isDaily ? 'active' : ''}`}
              onClick={() => onToggleDaily(true)}
            >
              <Calendar size={14} />
              <span>{isFr ? 'Quotidien' : 'Daily'}</span>
            </button>
            <button
              className={`type-btn ${!isDaily ? 'active' : ''}`}
              onClick={() => onToggleDaily(false)}
            >
              <InfinityIcon size={14} />
              <span>{isFr ? 'Infini' : 'Practice'}</span>
            </button>
          </div>

          <button
            className="action-btn"
            onClick={onOpenGallery}
            title={isFr ? 'Base de données des personnages' : 'Character Database'}
          >
            <Grid size={15} />
            <span>{'Roster'}</span>
          </button>

          <button
            className="action-btn"
            onClick={onOpenStats}
            title={isFr ? 'Statistiques et séries' : 'Statistics & Streaks'}
          >
            <BarChart3 size={15} />
            <span>{'Stats'}</span>
          </button>

          <button
            className={`action-btn ${colorblindMode ? 'active' : ''}`}
            onClick={onToggleColorblindMode}
            title={isFr ? 'Mode daltonien' : 'Colorblind mode'}
            aria-label={isFr ? 'Mode daltonien' : 'Colorblind mode'}
            aria-pressed={colorblindMode}
          >
            {colorblindMode ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>

          <button
            className="action-btn"
            onClick={onOpenHelp}
            title={isFr ? 'Protocoles et indices' : 'Rules & Indicators'}
            aria-label={isFr ? 'Protocoles et indices' : 'Rules & Indicators'}
          >
            <HelpCircle size={15} />
          </button>

          <button
            className="action-btn"
            onClick={onToggleMute}
            title={isMuted ? (isFr ? 'Activer le son' : 'Unmute') : (isFr ? 'Couper le son' : 'Mute')}
            aria-label={isMuted ? (isFr ? 'Activer le son' : 'Unmute') : (isFr ? 'Couper le son' : 'Mute')}
          >
            {isMuted ? <VolumeX size={15} color="#94a3b8" /> : <Volume2 size={15} color="var(--accent-secondary)" />}
          </button>

          <button
            className="action-btn active"
            onClick={onToggleLanguage}
            title={isFr ? 'Passer en Anglais' : 'Switch to French'}
          >
            <span>{isFr ? 'FR' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
