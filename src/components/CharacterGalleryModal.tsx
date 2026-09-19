import React, { useState } from 'react';
import type { Character, Language } from '../types';
import { X, Search } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { Modal } from './Modal';

interface CharacterGalleryModalProps {
  characters: Character[];
  language: Language;
  onClose: () => void;
}

export const CharacterGalleryModal: React.FC<CharacterGalleryModalProps> = ({
  characters,
  language,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedPath, setSelectedPath] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<number | 'all'>('all');
  const [activeChar, setActiveChar] = useState<Character | null>(null);

  const isFr = language === 'fr';

  const elements = [
    { id: 'all', name_fr: 'Tous les éléments', name_en: 'All Elements' },
    { id: 'physical', name_fr: 'Physique', name_en: 'Physical' },
    { id: 'fire', name_fr: 'Feu', name_en: 'Fire' },
    { id: 'ice', name_fr: 'Glace', name_en: 'Ice' },
    { id: 'thunder', name_fr: 'Foudre', name_en: 'Lightning' },
    { id: 'wind', name_fr: 'Vent', name_en: 'Wind' },
    { id: 'quantum', name_fr: 'Quantique', name_en: 'Quantum' },
    { id: 'imaginary', name_fr: 'Imaginaire', name_en: 'Imaginary' },
  ];

  const paths = [
    { id: 'all', name_fr: 'Toutes les voies', name_en: 'All Paths' },
    { id: 'warrior', name_fr: 'Destruction', name_en: 'Destruction' },
    { id: 'rogue', name_fr: 'Chasse', name_en: 'The Hunt' },
    { id: 'mage', name_fr: 'Érudition', name_en: 'Erudition' },
    { id: 'shaman', name_fr: 'Harmonie', name_en: 'Harmony' },
    { id: 'warlock', name_fr: 'Nihilité', name_en: 'Nihility' },
    { id: 'knight', name_fr: 'Préservation', name_en: 'Preservation' },
    { id: 'priest', name_fr: 'Abondance', name_en: 'Abundance' },
    { id: 'memory', name_fr: 'Souvenir', name_en: 'Remembrance' },
  ];

  const filtered = characters.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name_en.toLowerCase().includes(q) ||
      c.name_fr.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q);

    const matchesElement = selectedElement === 'all' || c.element.id.toLowerCase() === selectedElement;
    const matchesPath = selectedPath === 'all' || c.path.id.toLowerCase() === selectedPath;
    const matchesRarity = selectedRarity === 'all' || c.rarity === selectedRarity;

    return matchesSearch && matchesElement && matchesPath && matchesRarity;
  });

  return (
    <Modal onClose={onClose} className="gallery-modal">
        <div className="modal-header-centered">
          <h2 className="modal-title">{isFr ? 'Galerie' : 'Roster'}</h2>
          <p className="modal-subtitle">
            {isFr
              ? `${filtered.length} personnages disponibles`
              : `${filtered.length} characters available`}
          </p>
        </div>

        <div className="gallery-filters">
          <div className="gallery-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="gallery-search-input"
              placeholder={isFr ? 'Rechercher...' : 'Search...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="gallery-selects">
            <select
              className="gallery-select"
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              aria-label={isFr ? 'Filtre par élément' : 'Filter by element'}
            >
              {elements.map((e) => (
                <option key={e.id} value={e.id}>{isFr ? e.name_fr : e.name_en}</option>
              ))}
            </select>

            <select
              className="gallery-select"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              aria-label={isFr ? 'Filtre par voie' : 'Filter by path'}
            >
              {paths.map((p) => (
                <option key={p.id} value={p.id}>{isFr ? p.name_fr : p.name_en}</option>
              ))}
            </select>

            <select
              className="gallery-select"
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label={isFr ? 'Filtre par rareté' : 'Filter by rarity'}
            >
              <option value="all">{isFr ? 'Toutes raretés' : 'All Rarities'}</option>
              <option value={5}>5 ★</option>
              <option value={4}>4 ★</option>
            </select>
          </div>
        </div>

        {activeChar && (
          <div className="gallery-inspector">
            <button
              className="gallery-inspector-close"
              onClick={() => setActiveChar(null)}
              aria-label={isFr ? 'Fermer' : 'Close'}
            >
              <X size={16} />
            </button>
            <img
              src={activeChar.avatar}
              alt=""
              className={`gallery-inspector-avatar rarity-${activeChar.rarity}`}
            />
            <div className="gallery-inspector-info">
              <div className="gallery-inspector-header">
                <h3 className="gallery-inspector-name">
                  {isFr ? activeChar.name_fr : activeChar.name_en}
                </h3>
                <span className={`rarity-text rarity-${activeChar.rarity}`}>
                  {activeChar.rarity}★
                </span>
                <span className="gallery-inspector-version">v{activeChar.release_version}</span>
              </div>

              <div className="gallery-inspector-traits">
                <img src={activeChar.element.icon} alt="" className="clue-pill-icon" />
                <span>{isFr ? activeChar.element.name_fr : activeChar.element.name_en}</span>
                <span>·</span>
                <img src={activeChar.path.icon} alt="" className="clue-pill-icon" />
                <span>{isFr ? activeChar.path.name_fr : activeChar.path.name_en}</span>
              </div>

              {activeChar.lore_paths.filter((lp) => lp.name_en !== activeChar.path.name_en).length > 0 && (
                <div className="gallery-inspector-lorepath">
                  <span>
                    {isFr ? 'Voie(s) narrative(s) : ' : 'Lore Path(s): '}
                    {activeChar.lore_paths
                      .filter((lp) => lp.name_en !== activeChar.path.name_en)
                      .map((lp) => (isFr ? lp.name_fr : lp.name_en))
                      .join(', ')}
                  </span>
                </div>
              )}

              <div className="gallery-inspector-details">
                <div>
                  <b>{isFr ? 'Boss : ' : 'Boss: '}</b>
                  {isFr ? activeChar.weekly_boss.material_name_fr : activeChar.weekly_boss.material_name_en}
                </div>
                <div>
                  <b>{isFr ? 'Monde : ' : 'World: '}</b>
                  {isFr ? activeChar.world_fr : activeChar.world_en}
                </div>
                <div>
                  <b>{isFr ? 'Factions : ' : 'Factions: '}</b>
                  {(isFr ? activeChar.factions_fr : activeChar.factions_en).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="gallery-grid">
          {filtered.map((char) => (
            <div
              key={char.id}
              className={`gallery-card rarity-${char.rarity}`}
              onClick={() => { soundManager.playSelect(); setActiveChar(char); }}
            >
              <img
                src={char.avatar}
                alt={isFr ? char.name_fr : char.name_en}
                className={`gallery-card-img rarity-${char.rarity}`}
              />
              <span className="gallery-card-name">
                {isFr ? char.name_fr : char.name_en}
              </span>
            </div>
          ))}
        </div>
    </Modal>
  );
};
