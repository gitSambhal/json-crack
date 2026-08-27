/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { X, Sparkles, Code2, Check, FileJson, Cpu } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-lg max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl font-mono text-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2E] bg-[#1C1C1F]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">What's New in v1.2.0</h3>
              <p className="text-[10px] text-[#6B6B72]">JSON Reader & Node Graph Visualizer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B6B72] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#E0E0E0]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold rounded text-[10px] uppercase border border-blue-500/30">
                Release v1.2.0
              </span>
              <span className="text-[#6B6B72] text-[10px]">August 2026</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-xs">
              This update introduces comprehensive <strong>Property Visibility & Noise Filtering</strong> to declutter large JSON payloads by hiding unnecessary keys with intuitive checkboxes, noise presets, and inline toggles across Graph, Tree, and Table views.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> Key Features & Enhancements
            </h4>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 bg-[#1C1C1F] p-3 rounded border border-[#2A2A2E]">
                <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Property Visibility Checkbox Modal</strong>
                  <span className="text-[#9CA3AF] leading-normal">Easily select which keys to show or hide, with search, type tags, frequency counts, and sample values.</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 bg-[#1C1C1F] p-3 rounded border border-[#2A2A2E]">
                <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Noise Reduction Presets</strong>
                  <span className="text-[#9CA3AF] leading-normal">1-click presets to hide technical metadata, timestamps, IDs, null values, empty strings, and empty objects.</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 bg-[#1C1C1F] p-3 rounded border border-[#2A2A2E]">
                <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Inline Hide Toggles & Context Menus</strong>
                  <span className="text-[#9CA3AF] leading-normal">Quick-hide keys with hover eye icons on Tree nodes, Graph cards, Table headers, and right-click menus.</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 bg-[#1C1C1F] p-3 rounded border border-[#2A2A2E]">
                <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Filtered Export & Active Filter Banner</strong>
                  <span className="text-[#9CA3AF] leading-normal">Export clean JSON payloads excluding hidden properties and monitor active filter rules with instant reset.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-[#1C1C1F]/60 rounded border border-[#2A2A2E] flex justify-between items-center text-[10px] text-[#6B6B72]">
            <span>Developed by <strong className="text-white">Suhail Akhtar</strong></span>
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              https://suhail.top
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2A2A2E] bg-[#1C1C1F] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded uppercase tracking-wider text-[11px] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
