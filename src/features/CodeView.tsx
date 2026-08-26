/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/export';
import { sortJsonData, SortMode } from '../utils/jsonParser';
import { Copy, Check, Sparkles, Wand2, ArrowDownAZ, ArrowUpZA, ArrowUpDown, Minimize, Layers, Repeat } from 'lucide-react';

interface CodeViewProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CodeView: React.FC<CodeViewProps> = ({
  content,
  onContentChange,
  onShowToast,
}) => {
  const [text, setText] = useState(content);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    setText(content);
  }, [content]);

  const handleChange = (val: string) => {
    setText(val);
    try {
      JSON.parse(val);
      setError(null);
      onContentChange(val);
    } catch (err: any) {
      setError(err.message || 'Syntax Error in JSON');
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setText(formatted);
      onContentChange(formatted);
      setError(null);
      onShowToast('JSON formatted successfully', 'success');
    } catch (err: any) {
      onShowToast(`Cannot format: ${err.message}`, 'error');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(text);
      const minified = JSON.stringify(parsed);
      setText(minified);
      onContentChange(minified);
      setError(null);
      onShowToast('JSON minified successfully', 'success');
    } catch (err: any) {
      onShowToast(`Cannot minify: ${err.message}`, 'error');
    }
  };

  const handleSortKeys = (mode: SortMode = 'asc') => {
    try {
      const parsed = JSON.parse(text);
      const sortedData = sortJsonData(parsed, mode);
      const formatted = JSON.stringify(sortedData, null, 2);
      setText(formatted);
      onContentChange(formatted);
      setError(null);
      setShowSortDropdown(false);
      onShowToast(`Sorted JSON (${mode.toUpperCase()})`, 'success');
    } catch (err: any) {
      onShowToast(`Cannot sort keys: ${err.message}`, 'error');
    }
  };

  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    onShowToast('Code copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = text.split('\n').length;

  return (
    <div className="flex-1 bg-[#0A0A0B] flex flex-col font-mono overflow-hidden">
      {/* Code Editor Toolbar */}
      <div className="h-10 border-b border-[#2A2A2E] bg-[#111114] px-4 flex items-center justify-between text-xs text-[#6B6B72]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-2.5 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-[11px] font-semibold flex items-center gap-1.5 border border-[#2A2A2E]"
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-400" /> Pretty Format
          </button>
          <button
            onClick={handleMinify}
            className="px-2.5 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-[11px] font-semibold flex items-center gap-1.5 border border-[#2A2A2E]"
          >
            <Minimize className="w-3.5 h-3.5 text-amber-400" /> Minify
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="px-2.5 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-[11px] font-semibold flex items-center gap-1.5 border border-[#2A2A2E]"
              title="Sort options"
            >
              <ArrowDownAZ className="w-3.5 h-3.5 text-purple-400" /> Sort Keys
            </button>

            {showSortDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-[#111114] border border-[#2A2A2E] rounded-md shadow-2xl p-1 z-50 text-[11px] font-mono space-y-0.5">
                <button
                  onClick={() => handleSortKeys('asc')}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowDownAZ className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sort A to Z</span>
                </button>
                <button
                  onClick={() => handleSortKeys('desc')}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowUpZA className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sort Z to A</span>
                </button>
                <button
                  onClick={() => handleSortKeys('key-length-asc')}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>By Key Length</span>
                </button>
                <button
                  onClick={() => handleSortKeys('type')}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Group by Type</span>
                </button>
                <button
                  onClick={() => handleSortKeys('reverse')}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Repeat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reverse Keys & Arrays</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error ? (
            <span className="text-red-400 font-semibold text-[11px] truncate max-w-sm">
              Syntax Error: {error}
            </span>
          ) : (
            <span className="text-green-400 font-semibold text-[11px]">Valid JSON ({lineCount} lines)</span>
          )}

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-[#2A2A2E] hover:bg-[#3A3A40] text-white rounded text-[11px] font-semibold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Editor Textarea with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers column */}
        <div className="w-12 bg-[#111114] border-r border-[#2A2A2E] py-4 text-right pr-3 select-none text-xs text-[#6B6B72] font-mono overflow-hidden">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code */}
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-[#0A0A0B] p-4 text-xs font-mono text-gray-200 leading-6 focus:outline-none resize-none overflow-auto border-none whitespace-pre"
        />
      </div>
    </div>
  );
};
