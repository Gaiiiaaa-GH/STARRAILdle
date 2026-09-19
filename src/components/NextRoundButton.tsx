import React from 'react';
import { RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NextRoundButtonProps {
  show: boolean;
  label: string;
  onClick: () => void;
}

export const NextRoundButton: React.FC<NextRoundButtonProps> = ({ show, label, onClick }) => {
  if (!show) return null;
  return (
    <button
      className="action-btn active"
      onClick={() => { soundManager.playSelect(); onClick(); }}
    >
      <RotateCcw size={16} />
      <span>{label}</span>
    </button>
  );
};
