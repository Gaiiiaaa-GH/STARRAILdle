import React, { useState } from 'react';
import type { AllStats, AllDailyStreaks, GameMode, Language } from '../types';
import { Trophy, Flame, Target, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { Modal } from './Modal';

interface StatsModalProps {
  stats: AllStats;
  streaks: AllDailyStreaks;
  language: Language;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, streaks, language, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const isFr = language === 'fr';
  const modeStats = stats[selectedMode];
  const modeStreak = streaks[selectedMode];

  const winRate = modeStats.played > 0 ? Math.round((modeStats.won / modeStats.played) * 100) : 0;

  const modeLabels: { id: GameMode; labelFr: string; labelEn: string }[] = [
    { id: 'classic', labelFr: 'Classique', labelEn: 'Classic' },
    { id: 'splash', labelFr: 'Splash Art', labelEn: 'Splash Art' },
    { id: 'portrait', labelFr: 'Portrait', labelEn: 'Portrait' },
    { id: 'grayscale', labelFr: 'N&B', labelEn: 'B&W' },
    { id: 'quote', labelFr: 'Citation', labelEn: 'Quote' },
    { id: 'skill', labelFr: 'Compétence', labelEn: 'Skill' },
  ];

  const maxGuessCount = Math.max(1, ...Object.values(modeStats.guessDistribution));

  return (
    <Modal onClose={onClose}>
        <div className="modal-header-centered">
          <h2 className="modal-title">{isFr ? 'Statistiques' : 'Statistics'}</h2>
        </div>

        <div className="stats-mode-tabs">
          {modeLabels.map((m) => (
            <button
              key={m.id}
              className={`type-btn ${selectedMode === m.id ? 'active' : ''}`}
              onClick={() => { soundManager.playSelect(); setSelectedMode(m.id); }}
            >
              {isFr ? m.labelFr : m.labelEn}
            </button>
          ))}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <Target size={16} color="#38bdf8" />
            <div className="stat-value">{modeStats.played}</div>
            <div className="stat-label">{isFr ? 'Jouées' : 'Played'}</div>
          </div>
          <div className="stat-card">
            <Trophy size={16} color="var(--accent)" />
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">{isFr ? 'Victoires' : 'Win %'}</div>
          </div>
          <div className="stat-card">
            <Flame size={16} color="#f97316" />
            <div className="stat-value">{modeStreak.current}</div>
            <div className="stat-label">{isFr ? 'Série quotidienne' : 'Daily Streak'}</div>
          </div>
          <div className="stat-card">
            <Award size={16} color="var(--purple)" />
            <div className="stat-value">{modeStreak.max}</div>
            <div className="stat-label">Max</div>
          </div>
        </div>

        <div className="dist-section">
          <h3 className="dist-title">{isFr ? 'Distribution des essais' : 'Guess Distribution'}</h3>
          <div className="dist-chart">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = modeStats.guessDistribution[num] || 0;
              const widthPct = Math.max(8, (count / maxGuessCount) * 100);
              return (
                <div key={num} className="dist-row">
                  <span className="dist-num">{num}</span>
                  <div className="dist-track">
                    <div
                      className={`dist-bar ${count > 0 ? 'filled' : ''}`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </Modal>
  );
};
