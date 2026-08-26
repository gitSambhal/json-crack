/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-lg max-w-md w-full shadow-2xl p-6 flex flex-col gap-4 font-mono text-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            {isDestructive && <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="text-[#6B6B72] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[#9CA3AF] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded transition-colors font-medium uppercase tracking-wider text-[11px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded transition-colors font-medium uppercase tracking-wider text-[11px] text-white ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
