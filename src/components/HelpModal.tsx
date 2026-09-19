import React from 'react';
import type { Language } from '../types';
import { HelpCircle, CheckCircle2, AlertCircle, XCircle, ArrowUp } from 'lucide-react';
import { Modal } from './Modal';

interface HelpModalProps {
  language: Language;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ language, onClose }) => {
  const isFr = language === 'fr';

  return (
    <Modal onClose={onClose}>
        <div className="modal-header-centered">
          <HelpCircle size={28} color="var(--accent)" />
          <h2 className="modal-title">{isFr ? 'Comment jouer' : 'How to Play'}</h2>
          <p className="modal-subtitle">
            {isFr ? 'Guide des indices et couleurs' : 'Clues guide & color meanings'}
          </p>
        </div>

        <div className="help-indicators">
          <div className="help-row correct">
            <CheckCircle2 size={20} color="#34d399" className="help-row-icon" />
            <div>
              <div className="help-row-title" style={{ color: '#34d399' }}>
                {isFr ? '🟩 Vert : Exact' : '🟩 Green: Exact Match'}
              </div>
              <div className="help-row-desc">
                {isFr ? 'La propriété correspond parfaitement au personnage mystère.' : 'The attribute matches the mystery character exactly.'}
              </div>
            </div>
          </div>

          <div className="help-row partial">
            <AlertCircle size={20} color="#fb923c" className="help-row-icon" />
            <div>
              <div className="help-row-title" style={{ color: '#fb923c' }}>
                {isFr ? '🟧 Orange : Partiel' : '🟧 Orange: Partial'}
              </div>
              <div className="help-row-desc">
                {isFr ? (
                  <>
                    • <b>Monde :</b> Région ou alliance partagée.<br />
                    • <b>Faction :</b> Partage au moins 1 organisation.<br />
                    • <b>Boss :</b> Boss du même monde.<br />
                    • <b>Version :</b> ±2 patchs ou même cycle majeur.
                  </>
                ) : (
                  <>
                    • <b>World:</b> Same overarching system/alliance.<br />
                    • <b>Faction:</b> Shares at least 1 faction.<br />
                    • <b>Boss:</b> Boss from the same world.<br />
                    • <b>Version:</b> Within ±2 patches or same major arc.
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="help-row wrong">
            <XCircle size={20} color="#f87171" className="help-row-icon" />
            <div>
              <div className="help-row-title" style={{ color: '#f87171' }}>
                {isFr ? '🟥 Rouge : Incorrect' : '🟥 Red: No Match'}
              </div>
              <div className="help-row-desc">
                {isFr ? 'Aucun lien ou valeur différente.' : 'No overlap or completely different value.'}
              </div>
            </div>
          </div>

          <div className="help-row arrow">
            <ArrowUp size={20} color="#38bdf8" className="help-row-icon" />
            <div className="help-row-desc">
              {isFr
                ? 'Les flèches ↑ / ↓ indiquent si la cible est sortie après (↑) ou avant (↓).'
                : 'Arrows ↑ / ↓ show if the target was released later (↑) or earlier (↓).'}
            </div>
          </div>
        </div>

        <h3 className="help-section-title">{isFr ? 'Les 4 modes' : 'Game Modes'}</h3>
        <ul className="help-modes-list">
          <li><b>{isFr ? 'Classique :' : 'Classic:'}</b> {isFr ? 'Tableau complet avec tous les attributs' : 'Full attribute table with clues'}</li>
          <li><b>{isFr ? 'Splash Art :' : 'Splash Art:'}</b> {isFr ? 'Silhouette qui dézoome et se recentre' : 'Silhouette that zooms out and recenters'}</li>
          <li><b>{isFr ? 'Citation :' : 'Quote:'}</b> {isFr ? 'Répliques vocales cultes' : 'Iconic voice lines'}</li>
          <li><b>{isFr ? 'Compétence :' : 'Skill:'}</b> {isFr ? 'Icône de compétence à identifier' : 'Ability icon identification'}</li>
        </ul>
    </Modal>
  );
};
