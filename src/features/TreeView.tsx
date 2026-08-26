/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { getNodeType } from '../utils/jsonParser';
import { SearchResult } from '../types/json';
import { copyToClipboard } from '../utils/export';
import { ChevronDown, ChevronRight, Copy, Check, Maximize2, Minimize2, FileJson } from 'lucide-react';
import { ContextMenu, ContextMenuTarget } from '../components/ContextMenu';
import { SortMode } from '../utils/jsonParser';

interface TreeViewProps {
  data: any;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  searchResults: SearchResult[];
  activeSearchQuery: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSortSubTree?: (path: string, mode: SortMode) => void;
}

interface TreeNodeProps {
  keyName?: string;
  value: any;
  path: string;
  depth: number;
  lineNumber: { current: number };
  isLast: boolean;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  searchResultsPaths: Set<string>;
  collapsedPaths: Set<string>;
  onToggleCollapse: (path: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onContextMenuTrigger: (target: ContextMenuTarget) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  path,
  depth,
  lineNumber,
  isLast,
  selectedPath,
  onSelectPath,
  searchResultsPaths,
  collapsedPaths,
  onToggleCollapse,
  onShowToast,
  onContextMenuTrigger,
}) => {
  const type = getNodeType(value);
  const isCollapsed = collapsedPaths.has(path);
  const isSelected = selectedPath === path;
  const isMatchingSearch = searchResultsPaths.has(path);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedSubtree, setCopiedSubtree] = useState(false);

  lineNumber.current += 1;
  const currentLine = lineNumber.current;

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    let cleanPath = path;
    if (cleanPath.startsWith('root.')) cleanPath = '$.' + cleanPath.slice(5);
    else if (cleanPath === 'root') cleanPath = '$';
    copyToClipboard(cleanPath);
    setCopiedPath(true);
    onShowToast(`Copied path "${cleanPath}"`, 'success');
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleCopySubtree = (e: React.MouseEvent) => {
    e.stopPropagation();
    let cleanPath = path;
    if (cleanPath.startsWith('root.')) cleanPath = '$.' + cleanPath.slice(5);
    else if (cleanPath === 'root') cleanPath = '$';
    try {
      const jsonStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      copyToClipboard(jsonStr);
      setCopiedSubtree(true);
      onShowToast(`Copied sub-tree JSON for "${cleanPath}"`, 'success');
      setTimeout(() => setCopiedSubtree(false), 2000);
    } catch {
      onShowToast('Failed to copy sub-tree JSON', 'error');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectPath(path);
    onContextMenuTrigger({
      x: e.clientX,
      y: e.clientY,
      path,
      value,
      keyName,
    });
  };

  const renderValue = () => {
    if (type === 'string') {
      return <span className="text-green-400">"{String(value)}"</span>;
    }
    if (type === 'number') {
      return <span className="text-yellow-400 font-semibold">{String(value)}</span>;
    }
    if (type === 'boolean') {
      return <span className="text-purple-400 font-bold">{String(value)}</span>;
    }
    if (type === 'null') {
      return <span className="text-gray-500 italic">null</span>;
    }
    return null;
  };

  const indentStyle = { paddingLeft: `${depth * 20}px` };

  if (type === 'object' || type === 'array') {
    const isObj = type === 'object';
    const openBrace = isObj ? '{' : '[';
    const closeBrace = isObj ? '}' : ']';
    const entries = isObj ? Object.entries(value || {}) : (value as any[]).map((v, i) => [`${i}`, v]);

    return (
      <div className="select-text">
        {/* Node Line Header */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectPath(path);
          }}
          onContextMenu={handleContextMenu}
          style={indentStyle}
          className={`flex items-center gap-2 py-0.5 px-2 rounded group transition-colors cursor-pointer text-sm leading-6 ${
            isSelected
              ? 'bg-blue-900/30 ring-1 ring-blue-500/50'
              : isMatchingSearch
              ? 'bg-amber-950/30 border-l-2 border-amber-400'
              : 'hover:bg-[#1C1C1F]'
          }`}
        >
          <span className="text-[#6B6B72] text-xs font-mono w-6 text-right shrink-0 select-none">
            {currentLine}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(path);
            }}
            className="text-[#888888] hover:text-white shrink-0 p-0.5"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {keyName !== undefined && (
            <>
              <span className="text-white font-bold">"{keyName}"</span>
              <span className="text-[#6B6B72]">:</span>
            </>
          )}

          <span className="text-[#888888]">{openBrace}</span>

          {isCollapsed && (
            <span className="text-[#6B6B72] text-xs italic px-1 bg-[#1C1C1F] rounded">
              ... {entries.length} {isObj ? 'keys' : 'items'} ...
            </span>
          )}

          {isCollapsed && <span className="text-[#888888]">{closeBrace}</span>}
          {!isLast && <span className="text-[#6B6B72]">,</span>}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex items-center gap-1">
            <button
              onClick={handleCopySubtree}
              className="text-[#6B6B72] hover:text-blue-400 p-1 rounded hover:bg-[#2A2A2E] flex items-center gap-1 text-[11px]"
              title="Right-click node or click here to copy sub-tree JSON"
            >
              {copiedSubtree ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <FileJson className="w-3 h-3 text-blue-400" />
              )}
            </button>
            <button
              onClick={handleCopyPath}
              className="text-[#6B6B72] hover:text-white p-1 rounded hover:bg-[#2A2A2E]"
              title="Copy JSON path"
            >
              {copiedPath ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Children recursively */}
        {!isCollapsed && (
          <div>
            {entries.map(([k, v], idx) => {
              const childPath = isObj
                ? path === 'root'
                  ? `root.${k}`
                  : `${path}.${k}`
                : `${path}[${k}]`;

              return (
                <TreeNode
                  key={childPath}
                  keyName={isObj ? k : undefined}
                  value={v}
                  path={childPath}
                  depth={depth + 1}
                  lineNumber={lineNumber}
                  isLast={idx === entries.length - 1}
                  selectedPath={selectedPath}
                  onSelectPath={onSelectPath}
                  searchResultsPaths={searchResultsPaths}
                  collapsedPaths={collapsedPaths}
                  onToggleCollapse={onToggleCollapse}
                  onShowToast={onShowToast}
                  onContextMenuTrigger={onContextMenuTrigger}
                />
              );
            })}

            {/* Closing Brace Line */}
            <div
              style={indentStyle}
              className="flex items-center gap-2 py-0.5 px-2 text-sm leading-6"
            >
              <span className="text-[#6B6B72] text-xs font-mono w-6 text-right shrink-0 select-none">
                {++lineNumber.current}
              </span>
              <span className="w-3.5 h-3.5 shrink-0"></span>
              <span className="text-[#888888]">{closeBrace}</span>
              {!isLast && <span className="text-[#6B6B72]">,</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Primitive node line
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectPath(path);
      }}
      onContextMenu={handleContextMenu}
      style={indentStyle}
      className={`flex items-center gap-2 py-0.5 px-2 rounded group transition-colors cursor-pointer text-sm leading-6 ${
        isSelected
          ? 'bg-blue-900/30 ring-1 ring-blue-500/50'
          : isMatchingSearch
          ? 'bg-amber-950/30 border-l-2 border-amber-400'
          : 'hover:bg-[#1C1C1F]'
      }`}
    >
      <span className="text-[#6B6B72] text-xs font-mono w-6 text-right shrink-0 select-none">
        {currentLine}
      </span>
      <span className="w-3.5 h-3.5 shrink-0"></span>

      {keyName !== undefined && (
        <>
          <span className="text-white font-bold">"{keyName}"</span>
          <span className="text-[#6B6B72]">:</span>
        </>
      )}

      {renderValue()}
      {!isLast && <span className="text-[#6B6B72]">,</span>}

      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex items-center gap-1">
        <button
          onClick={handleCopySubtree}
          className="text-[#6B6B72] hover:text-blue-400 p-1 rounded hover:bg-[#2A2A2E] flex items-center gap-1 text-[11px]"
          title="Right-click node or click here to copy sub-tree JSON"
        >
          {copiedSubtree ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <FileJson className="w-3 h-3 text-blue-400" />
          )}
        </button>
        <button
          onClick={handleCopyPath}
          className="text-[#6B6B72] hover:text-white p-1 rounded hover:bg-[#2A2A2E]"
          title="Copy JSON path"
        >
          {copiedPath ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  selectedPath,
  onSelectPath,
  searchResults,
  activeSearchQuery,
  onShowToast,
  onSortSubTree,
}) => {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [contextMenuTarget, setContextMenuTarget] = useState<ContextMenuTarget | null>(null);

  const searchResultsPaths = useMemo(() => {
    const set = new Set<string>();
    searchResults.forEach((r) => set.add(r.path));
    return set;
  }, [searchResults]);

  const toggleCollapse = (path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedPaths(new Set());
    onShowToast('Expanded all nodes', 'info');
  };

  const handleCollapseAll = () => {
    const paths = new Set<string>();
    function collect(node: any, path: string) {
      const type = getNodeType(node);
      if ((type === 'object' || type === 'array') && path !== 'root') {
        paths.add(path);
      }
      if (type === 'object' && node) {
        Object.entries(node).forEach(([k, v]) => collect(v, `${path}.${k}`));
      } else if (type === 'array' && Array.isArray(node)) {
        node.forEach((v, idx) => collect(v, `${path}[${idx}]`));
      }
    }
    collect(data, 'root');
    setCollapsedPaths(paths);
    onShowToast('Collapsed all nodes', 'info');
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] flex flex-col overflow-hidden font-mono relative">
      <ContextMenu
        target={contextMenuTarget}
        onClose={() => setContextMenuTarget(null)}
        onSelectPath={onSelectPath}
        onShowToast={onShowToast}
        onSortSubTree={onSortSubTree}
      />

      {/* Top Tree Controls Bar */}
      <div className="h-9 border-b border-[#2A2A2E] bg-[#111114] px-4 flex items-center justify-between text-xs text-[#6B6B72]">
        <div className="flex items-center gap-2">
          <span>Tree Controls:</span>
          <button
            onClick={handleExpandAll}
            className="px-2 py-0.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-[11px] font-semibold flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3 text-blue-400" /> Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-2 py-0.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-[11px] font-semibold flex items-center gap-1"
          >
            <Minimize2 className="w-3 h-3 text-amber-400" /> Collapse All
          </button>
        </div>

        {activeSearchQuery && (
          <div className="text-amber-400 font-semibold text-[11px]">
            Filtered matches: {searchResults.length}
          </div>
        )}
      </div>

      {/* Main Tree Canvas */}
      <div className="flex-1 p-6 overflow-auto relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 max-w-5xl">
          <TreeNode
            value={data}
            path="root"
            depth={0}
            lineNumber={{ current: 0 }}
            isLast={true}
            selectedPath={selectedPath}
            onSelectPath={onSelectPath}
            searchResultsPaths={searchResultsPaths}
            collapsedPaths={collapsedPaths}
            onToggleCollapse={toggleCollapse}
            onShowToast={onShowToast}
            onContextMenuTrigger={setContextMenuTarget}
          />
        </div>
      </div>
    </div>
  );
};
