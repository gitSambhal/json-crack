/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState } from 'react';
import { X, Code, AlertCircle, Check } from 'lucide-react';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadJson: (name: string, content: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({ isOpen, onClose, onLoadJson }) => {
  const [fileName, setFileName] = useState('custom_data.json');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndLoad = () => {
    if (!text.trim()) {
      setError('Please enter or paste valid JSON text.');
      return;
    }
    try {
      JSON.parse(text);
      setError(null);
      onLoadJson(fileName.endsWith('.json') ? fileName : `${fileName}.json`, text);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const handleFormatInput = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Cannot format invalid JSON');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-lg max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2A2A2E] bg-[#1C1C1F]">
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-xs uppercase tracking-wider">Paste or Edit JSON</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B6B72] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <label className="text-[#6B6B72] text-xs font-semibold uppercase">File Name:</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="flex-1 bg-[#1C1C1F] border border-[#2A2A2E] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`Paste your JSON payload here...\n{\n  "key": "value"\n}`}
              className="flex-1 w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-[#2A2A2E] bg-[#1C1C1F] flex items-center justify-between">
          <button
            onClick={handleFormatInput}
            className="px-3 py-1.5 bg-[#2A2A2E] hover:bg-[#3A3A40] text-gray-300 text-xs font-semibold rounded uppercase tracking-wider transition-colors"
          >
            Format JSON
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#2A2A2E] hover:bg-[#3A3A40] text-xs font-semibold text-gray-300 rounded uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleValidateAndLoad}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" /> Load JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
