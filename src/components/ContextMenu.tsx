/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useEffect, useRef } from 'react';
import { Copy, Code, Link as LinkIcon, Eye, FileJson, ArrowDownAZ, ArrowUpZA, EyeOff, SlidersHorizontal } from 'lucide-react';
import { copyToClipboard } from '../utils/export';
import { SortMode } from '../utils/jsonParser';

export interface ContextMenuTarget {
  x: number;
  y: number;
  path: string;
  value: any;
  keyName?: string;
}

interface ContextMenuProps {
  target: ContextMenuTarget | null;
  onClose: () => void;
  onSelectPath: (path: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSortSubTree?: (path: string, mode: SortMode) => void;
  onHideKey?: (key: string) => void;
  onOpenPropertyFilter?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  target,
  onClose,
  onSelectPath,
  onShowToast,
  onSortSubTree,
  onHideKey,
  onOpenPropertyFilter,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (target) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, onClose]);

  if (!target) return null;

  let cleanPath = target.path;
  if (cleanPath.startsWith('root.')) cleanPath = '$.' + cleanPath.slice(5);
  else if (cleanPath === 'root') cleanPath = '$';

  const menuWidth = 230;
  const menuHeight = 190;
  const left = Math.min(target.x, window.innerWidth - menuWidth - 12);
  const top = Math.min(target.y, window.innerHeight - menuHeight - 12);

  const handleCopySubTreeFormatted = () => {
    try {
      const jsonStr =
        typeof target.value === 'string'
          ? target.value
          : JSON.stringify(target.value, null, 2);
      copyToClipboard(jsonStr);
      onShowToast(`Copied sub-tree JSON for "${cleanPath}"`, 'success');
    } catch {
      onShowToast('Failed to copy sub-tree JSON', 'error');
    }
    onClose();
  };

  const handleCopySubTreeMinified = () => {
    try {
      const jsonStr =
        typeof target.value === 'string'
          ? target.value
          : JSON.stringify(target.value);
      copyToClipboard(jsonStr);
      onShowToast(`Copied minified sub-tree JSON for "${cleanPath}"`, 'success');
    } catch {
      onShowToast('Failed to copy sub-tree JSON', 'error');
    }
    onClose();
  };

  const handleCopyPath = () => {
    copyToClipboard(cleanPath);
    onShowToast(`Copied path "${cleanPath}"`, 'success');
    onClose();
  };

  const handleInspect = () => {
    onSelectPath(target.path);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 bg-[#161619] border border-[#2A2A2E] rounded-lg shadow-2xl py-1.5 w-60 text-xs font-mono text-gray-200 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="px-3 py-1.5 border-b border-[#2A2A2E] text-[10px] text-[#6B6B72] truncate font-bold flex items-center justify-between">
        <span className="truncate">{cleanPath}</span>
        {target.keyName && <span className="text-blue-400 ml-1 shrink-0">"{target.keyName}"</span>}
      </div>

      <button
        onClick={handleCopySubTreeFormatted}
        className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer"
      >
        <FileJson className="w-3.5 h-3.5 text-blue-400" />
        <span>Copy Sub-tree (Pretty JSON)</span>
      </button>

      <button
        onClick={handleCopySubTreeMinified}
        className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Code className="w-3.5 h-3.5 text-emerald-400" />
        <span>Copy Sub-tree (Minified)</span>
      </button>

      <button
        onClick={handleCopyPath}
        className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer"
      >
        <LinkIcon className="w-3.5 h-3.5 text-yellow-400" />
        <span>Copy JSONPath</span>
      </button>

      {onSortSubTree && typeof target.value === 'object' && target.value !== null && (
        <>
          <div className="my-1 border-t border-[#2A2A2E]" />
          <button
            onClick={() => {
              onSortSubTree(target.path, 'asc');
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-purple-400" />
            <span>Sort Sub-tree Keys (A to Z)</span>
          </button>
          <button
            onClick={() => {
              onSortSubTree(target.path, 'desc');
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowUpZA className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sort Sub-tree Keys (Z to A)</span>
          </button>
        </>
      )}

      <div className="my-1 border-t border-[#2A2A2E]" />

      <button
        onClick={handleInspect}
        className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-purple-400" />
        <span>Inspect Node</span>
      </button>

      {target.keyName && onHideKey && (
        <>
          <div className="my-1 border-t border-[#2A2A2E]" />
          <button
            onClick={() => {
              if (target.keyName && onHideKey) {
                onHideKey(target.keyName);
              }
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-amber-600/20 hover:text-amber-300 flex items-center gap-2 transition-colors cursor-pointer text-amber-400"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Property "{target.keyName}"</span>
          </button>
        </>
      )}

      {onOpenPropertyFilter && (
        <button
          onClick={() => {
            onOpenPropertyFilter();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2 transition-colors cursor-pointer text-gray-300"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Manage Property Visibility...</span>
        </button>
      )}
    </div>
  );
};
