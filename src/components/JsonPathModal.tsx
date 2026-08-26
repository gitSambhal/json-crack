/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { queryJsonPath, JsonQueryResult } from '../utils/jsonPath';
import { copyToClipboard } from '../utils/export';
import { X, Search, Sparkles, Copy, Check, Plus, Code } from 'lucide-react';

interface JsonPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onOpenNewTabWithData?: (title: string, data: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const JsonPathModal: React.FC<JsonPathModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenNewTabWithData,
  onShowToast,
}) => {
  const [query, setQuery] = useState('$.*');
  const [copied, setCopied] = useState(false);

  const results: JsonQueryResult[] = useMemo(() => queryJsonPath(data, query), [data, query]);

  if (!isOpen) return null;

  const presets = [
    { label: 'All Root Properties', q: '$.*' },
    { label: 'Deep Search IDs', q: '$..id' },
    { label: 'Array Items Wildcard', q: '$.items[*]' },
    { label: 'Filter (price < 50)', q: '$.items[?(@.price < 50)]' },
    { label: 'Filter (status == "active")', q: '$.users[?(@.status == "active")]' },
  ];

  const handleCopyResults = () => {
    const extracted = results.map((r) => r.value);
    copyToClipboard(JSON.stringify(extracted, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast(`Copied ${results.length} matched results`, 'success');
  };

  const handleCreateNewTab = () => {
    const extracted = results.map((r) => r.value);
    if (onOpenNewTabWithData) {
      onOpenNewTabWithData(`Query Result (${results.length}).json`, extracted);
      onClose();
      onShowToast('Created new tab from query results', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-sm">JSONPath / JMESPath Sandbox</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0A0A0B] border-b border-[#2A2A2E] space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-purple-400 text-xs">$</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. $.items[*].name or $..id or $[?(@.status == 'active')]"
              className="w-full bg-[#1C1C1F] text-white pl-8 pr-4 py-2 rounded border border-purple-500/50 outline-none focus:border-purple-400 font-mono text-xs"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-500 uppercase font-bold mr-1">Presets:</span>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setQuery(p.q)}
                className="px-2 py-0.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-gray-300 rounded text-[10px] border border-[#2A2A2E] transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result Counter Bar */}
        <div className="h-8 bg-[#16161A] border-b border-[#2A2A2E] px-4 flex items-center justify-between text-[11px] text-gray-400">
          <span>
            Query Results: <strong className="text-white">{results.length}</strong> matches found
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 p-4 overflow-auto bg-[#0A0A0B] space-y-2">
          {results.length > 0 ? (
            results.map((res, i) => (
              <div key={i} className="bg-[#16161A] border border-[#2A2A2E] rounded p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold border-b border-[#2A2A2E] pb-1">
                  <span>{res.path}</span>
                  <span className="text-gray-500">[{typeof res.value}]</span>
                </div>
                <pre className="text-gray-200 text-[11px] font-mono whitespace-pre-wrap select-text">
                  {typeof res.value === 'object' && res.value !== null
                    ? JSON.stringify(res.value, null, 2)
                    : String(res.value)}
                </pre>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-12">
              No results match query <code className="text-purple-400">{query}</code>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-12 border-t border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Extract query results</span>

          <div className="flex items-center gap-2">
            <button
              disabled={results.length === 0}
              onClick={handleCopyResults}
              className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-[#2A2A2E] disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
              <span>Copy Matched Values</span>
            </button>

            {onOpenNewTabWithData && (
              <button
                disabled={results.length === 0}
                onClick={handleCreateNewTab}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Open in New Tab
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
