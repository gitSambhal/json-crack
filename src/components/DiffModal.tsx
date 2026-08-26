/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ParsedFile } from '../types/json';
import { compareJson, DiffItem, DiffSummary } from '../utils/jsonDiff';
import { X, GitCompare, Plus, Minus, RefreshCw, FileText } from 'lucide-react';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ParsedFile[];
  activeFileId: string;
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  files,
  activeFileId,
}) => {
  const activeFile = files.find((f) => f.id === activeFileId);

  const [targetFileId, setTargetFileId] = useState<string>(() => {
    const other = files.find((f) => f.id !== activeFileId);
    return other ? other.id : activeFileId;
  });

  const [customTargetJson, setCustomTargetJson] = useState<string>('');
  const [useCustomJson, setUseCustomJson] = useState<boolean>(false);

  const targetData = useMemo(() => {
    if (useCustomJson) {
      try {
        return JSON.parse(customTargetJson);
      } catch {
        return null;
      }
    }
    const target = files.find((f) => f.id === targetFileId);
    return target ? target.data : null;
  }, [useCustomJson, customTargetJson, targetFileId, files]);

  const diffSummary: DiffSummary | null = useMemo(() => {
    if (!activeFile || !targetData) return null;
    return compareJson(activeFile.data, targetData);
  }, [activeFile, targetData]);

  if (!isOpen || !activeFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-sm">JSON Diff & Comparison</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selection Bar */}
        <div className="p-4 bg-[#0A0A0B] border-b border-[#2A2A2E] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              Base Document (Current Tab)
            </label>
            <div className="p-2 bg-[#1C1C1F] border border-blue-500/50 text-white rounded font-bold truncate">
              {activeFile.name}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold">
                Target Comparison Document
              </label>
              <button
                onClick={() => setUseCustomJson(!useCustomJson)}
                className="text-[10px] text-purple-400 hover:underline"
              >
                {useCustomJson ? 'Select Open Tab' : 'Paste Custom JSON'}
              </button>
            </div>

            {useCustomJson ? (
              <textarea
                placeholder="Paste JSON payload to compare against..."
                value={customTargetJson}
                onChange={(e) => setCustomTargetJson(e.target.value)}
                className="w-full h-16 bg-[#1C1C1F] text-gray-200 border border-[#2A2A2E] p-2 rounded outline-none focus:border-purple-500 text-[11px]"
              />
            ) : (
              <select
                value={targetFileId}
                onChange={(e) => setTargetFileId(e.target.value)}
                className="w-full p-2 bg-[#1C1C1F] border border-[#2A2A2E] text-gray-200 rounded font-bold outline-none"
              >
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.id === activeFileId ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stats summary bar */}
        {diffSummary && (
          <div className="h-9 bg-[#16161A] border-b border-[#2A2A2E] px-5 flex items-center justify-around text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> {diffSummary.added} Added
            </span>
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Minus className="w-3.5 h-3.5" /> {diffSummary.removed} Removed
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> {diffSummary.modified} Modified
            </span>
            <span className="text-gray-400 font-medium">
              {diffSummary.unchanged} Unchanged
            </span>
          </div>
        )}

        {/* Diff Tree Details */}
        <div className="flex-1 p-4 overflow-auto bg-[#0A0A0B]">
          {diffSummary ? (
            <div className="space-y-1">
              {diffSummary.diffs.map((diff, i) => (
                <DiffRow key={i} item={diff} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select or paste a valid JSON document to view differences.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DiffRow: React.FC<{ item: DiffItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(true);

  const getStyle = (type: DiffItem['type']) => {
    switch (type) {
      case 'added':
        return 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500';
      case 'removed':
        return 'bg-red-950/40 text-red-300 border-l-2 border-red-500';
      case 'modified':
        return 'bg-amber-950/30 text-amber-300 border-l-2 border-amber-500';
      default:
        return 'text-gray-400 hover:bg-[#1C1C1F]/40';
    }
  };

  return (
    <div className="text-[11px]">
      <div className={`p-1.5 rounded flex items-center justify-between gap-3 ${getStyle(item.type)}`}>
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold">{item.key}:</span>
          <span className="text-gray-400 text-[10px] font-mono">({item.path})</span>
        </div>

        <div className="truncate max-w-md text-right">
          {item.type === 'added' && (
            <span className="text-emerald-400">+ {JSON.stringify(item.newValue)}</span>
          )}
          {item.type === 'removed' && (
            <span className="text-red-400">- {JSON.stringify(item.oldValue)}</span>
          )}
          {item.type === 'modified' && item.children?.length === 0 && (
            <span>
              <span className="text-red-400 line-through mr-2">{JSON.stringify(item.oldValue)}</span>
              <span className="text-emerald-400">➔ {JSON.stringify(item.newValue)}</span>
            </span>
          )}
        </div>
      </div>

      {item.children && item.children.length > 0 && expanded && (
        <div className="pl-4 ml-1 border-l border-[#2A2A2E] space-y-1 mt-1">
          {item.children.map((child, idx) => (
            <DiffRow key={idx} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};
