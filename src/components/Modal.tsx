import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ onClose, className, children }) => (
  <div
    className="modal-overlay"
    onClick={onClose}
    tabIndex={-1}
    onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
  >
    <div
      className={`modal-content ${className ?? ''}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <button className="modal-close-btn" onClick={onClose} aria-label="Close">
        <X size={18} />
      </button>
      {children}
    </div>
  </div>
);
