/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState } from 'react';
import { X, Code, AlertCircle, Check, Film, FileText, Sparkles } from 'lucide-react';
import { parseAnyInputToJson } from '../utils/jsonParser';

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
      setError('Please enter or paste valid JSON or CSV text.');
      return;
    }

    const parsed = parseAnyInputToJson(text, fileName);
    if (parsed.error || !parsed.data) {
      setError(parsed.error || 'Could not parse input. Check JSON syntax or CSV format.');
      return;
    }

    setError(null);
    const formatted = JSON.stringify(parsed.data, null, 2);
    let finalName = fileName;
    if (!finalName.endsWith('.json')) {
      finalName = `${finalName.replace(/\.[^/.]+$/, '')}.json`;
    }
    onLoadJson(finalName, formatted);
    onClose();
  };

  const handleFormatInput = () => {
    if (!text.trim()) return;
    const parsed = parseAnyInputToJson(text, fileName);
    if (parsed.data) {
      setText(JSON.stringify(parsed.data, null, 2));
      setError(null);
    } else {
      setError(parsed.error || 'Cannot format invalid content');
    }
  };

  const loadNetflixTemplate = () => {
    setFileName('netflix_payload.json');
    setText(
      JSON.stringify(
        {
          service: "Netflix",
          viewing_session: {
            session_id: "nf-sess-991204",
            profile: "Suhail",
            title: "Stranger Things: Season 4",
            episode: "Chapter One: The Hellfire Club",
            playback: {
              current_time_sec: 1420,
              duration_sec: 4560,
              video_quality: "4K UHD HDR",
              audio_track: "English [Original] (Dolby Atmos)",
              subtitles_track: "English [CC]"
            },
            recommendations: [
              { title: "Dark", genre: "Sci-Fi Thriller", match_score: "98%" },
              { title: "Squid Game", genre: "Suspense", match_score: "96%" },
              { title: "Black Mirror", genre: "Dystopian", match_score: "95%" }
            ]
          }
        },
        null,
        2
      )
    );
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-lg max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2A2A2E] bg-[#1C1C1F]">
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-xs uppercase tracking-wider">Paste or Edit JSON / CSV</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B6B72] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-6 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[#6B6B72] text-xs font-semibold uppercase">File Name:</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 bg-[#1C1C1F] border border-[#2A2A2E] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={loadNetflixTemplate}
                className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                title="Load sample Netflix JSON payload"
              >
                <Film className="w-3 h-3 text-red-400" /> Netflix Payload
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`Paste JSON, Netflix Viewing CSV, or JavaScript object here...\n{\n  "title": "Stranger Things",\n  "season": 4\n}`}
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
            className="px-3 py-1.5 bg-[#2A2A2E] hover:bg-[#3A3A40] text-gray-300 text-xs font-semibold rounded uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" /> Format / Clean
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Load Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
