/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { ToastMessage } from '../types/json';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-[#1C1C1F] border-[#2A2A2E] text-white';
        let icon = <Info className="w-4 h-4 text-blue-400" />;

        if (toast.type === 'success') {
          bg = 'bg-[#111827] border-green-500/40 text-green-200';
          icon = <CheckCircle2 className="w-4 h-4 text-green-400" />;
        } else if (toast.type === 'error') {
          bg = 'bg-[#1F1214] border-red-500/40 text-red-200';
          icon = <XCircle className="w-4 h-4 text-red-400" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-[#1F1B12] border-amber-500/40 text-amber-200';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-md border shadow-2xl text-xs font-mono transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
