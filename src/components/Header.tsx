/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useRef } from 'react';
import { ViewMode, SearchFilterState, ThemeMode } from '../types/json';
import { SortMode } from '../utils/jsonParser';
import {
  Search,
  Upload,
  Download,
  Share2,
  Network,
  ListTree,
  Code2,
  Table,
  Plus,
  SlidersHorizontal,
  X,
  Sparkles,
  Sun,
  Moon,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown,
  Layers,
  Repeat,
  GitCompare,
  FileCode,
  BarChart3,
  RefreshCw,
  Globe,
  Wand2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface HeaderProps {
  searchFilter: SearchFilterState;
  onSearchChange: (filter: Partial<SearchFilterState>) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onImportClick: () => void;
  onExportClick: (type: 'json' | 'minified' | 'csv') => void;
  onOpenPasteModal: () => void;
  onOpenChangelog: () => void;
  onSortJson?: (mode: SortMode) => void;
  matchCount?: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenDiffModal?: () => void;
  onOpenSchemaModal?: () => void;
  onOpenJsonPathModal?: () => void;
  onOpenProfilerModal?: () => void;
  onOpenTransformModal?: () => void;
  onOpenFetchUrlModal?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchFilter,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onImportClick,
  onExportClick,
  onOpenPasteModal,
  onOpenChangelog,
  onSortJson,
  matchCount,
  theme,
  onToggleTheme,
  onOpenDiffModal,
  onOpenSchemaModal,
  onOpenJsonPathModal,
  onOpenProfilerModal,
  onOpenTransformModal,
  onOpenFetchUrlModal,
  isFocusMode,
  onToggleFocusMode,
}) => {
  const [showFilterOptions, setShowFilterOptions] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showToolsMenu, setShowToolsMenu] = React.useState(false);

  return (
    <header className="h-14 border-b border-[#2A2A2E] flex items-center justify-between px-6 bg-[#111114] font-mono text-xs z-30 select-none">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center shadow-lg shadow-blue-500/20">
          <div className="w-3 h-3 border-2 border-white"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white uppercase">JSON_NODE</span>
          <span
            onClick={onOpenChangelog}
            className="px-1.5 py-0.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[10px] text-blue-400 font-bold rounded cursor-pointer transition-colors"
            title="View Changelog (v1.0.0)"
          >
            v1.0.0
          </span>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center bg-[#0A0A0B] border border-[#2A2A2E] rounded-md p-0.5">
        <button
          onClick={() => onViewModeChange('graph')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
            viewMode === 'graph'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-[#6B6B72] hover:text-white hover:bg-[#1C1C1F]'
          }`}
          title="Interactive Visual Node Graph (JSON Crack style)"
        >
          <Network className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Graph</span>
        </button>

        <button
          onClick={() => onViewModeChange('tree')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
            viewMode === 'tree'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-[#6B6B72] hover:text-white hover:bg-[#1C1C1F]'
          }`}
          title="Collapsible Tree View"
        >
          <ListTree className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tree</span>
        </button>

        <button
          onClick={() => onViewModeChange('code')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
            viewMode === 'code'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-[#6B6B72] hover:text-white hover:bg-[#1C1C1F]'
          }`}
          title="Formatted Code Editor"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Code</span>
        </button>

        <button
          onClick={() => onViewModeChange('table')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
            viewMode === 'table'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-[#6B6B72] hover:text-white hover:bg-[#1C1C1F]'
          }`}
          title="Tabular Data View"
        >
          <Table className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="flex-1 max-w-md mx-6 relative">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder='Search keys or values (e.g. "user_id")'
            value={searchFilter.query}
            onChange={(e) => onSearchChange({ query: e.target.value })}
            className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded-md pl-9 pr-20 py-1.5 text-xs text-white placeholder-[#6B6B72] focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-[#6B6B72] absolute left-3 pointer-events-none" />

          {searchFilter.query && (
            <button
              onClick={() => onSearchChange({ query: '' })}
              className="absolute right-10 text-[#6B6B72] hover:text-white p-1 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {matchCount !== undefined && searchFilter.query && (
            <span className="absolute right-14 text-[10px] text-blue-400 font-bold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
              {matchCount}
            </span>
          )}

          <button
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className={`absolute right-2 p-1 rounded transition-colors ${
              showFilterOptions || searchFilter.typeFilter !== 'all' || searchFilter.useRegex
                ? 'text-blue-400 bg-blue-950/50'
                : 'text-[#6B6B72] hover:text-white'
            }`}
            title="Filter Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Popup dropdown */}
        {showFilterOptions && (
          <div className="absolute top-full mt-2 right-0 w-72 bg-[#111114] border border-[#2A2A2E] rounded-md shadow-2xl p-3 z-50 space-y-3 font-mono">
            <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase border-b border-[#2A2A2E] pb-1.5">
              <span>Search Options</span>
              <button
                onClick={() => setShowFilterOptions(false)}
                className="text-[#6B6B72] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <label className="flex items-center justify-between text-[#9CA3AF] cursor-pointer">
                <span>Case Sensitive</span>
                <input
                  type="checkbox"
                  checked={searchFilter.caseSensitive}
                  onChange={(e) => onSearchChange({ caseSensitive: e.target.checked })}
                  className="rounded border-[#2A2A2E] bg-[#1C1C1F] text-blue-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-[#9CA3AF] cursor-pointer">
                <span>Use Regular Expression</span>
                <input
                  type="checkbox"
                  checked={searchFilter.useRegex}
                  onChange={(e) => onSearchChange({ useRegex: e.target.checked })}
                  className="rounded border-[#2A2A2E] bg-[#1C1C1F] text-blue-600 focus:ring-0"
                />
              </label>

              <div className="pt-2 border-t border-[#2A2A2E]">
                <span className="block text-[#6B6B72] text-[10px] uppercase font-bold mb-1">Type Filter:</span>
                <select
                  value={searchFilter.typeFilter}
                  onChange={(e) => onSearchChange({ typeFilter: e.target.value as any })}
                  className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                  <option value="null">Null</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Advanced Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowToolsMenu(!showToolsMenu);
              setShowSortMenu(false);
              setShowExportMenu(false);
            }}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-xs font-semibold text-blue-300 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 border border-blue-500/40 shadow-sm"
            title="Advanced JSON Developer Tools"
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline font-bold">Tools</span>
          </button>

          {showToolsMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#111114] border border-[#2A2A2E] rounded-lg shadow-2xl p-1.5 z-50 text-xs font-mono space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold text-[#6B6B72] uppercase border-b border-[#2A2A2E] mb-1">
                Developer Power Tools
              </div>

              {onOpenDiffModal && (
                <button
                  onClick={() => {
                    onOpenDiffModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                  <span>JSON Diff & Comparison</span>
                </button>
              )}

              {onOpenSchemaModal && (
                <button
                  onClick={() => {
                    onOpenSchemaModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-emerald-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TS Types & JSON Schema</span>
                </button>
              )}

              {onOpenJsonPathModal && (
                <button
                  onClick={() => {
                    onOpenJsonPathModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-cyan-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSONPath / JMESPath Sandbox</span>
                </button>
              )}

              {onOpenProfilerModal && (
                <button
                  onClick={() => {
                    onOpenProfilerModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-blue-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Structure Profiler & Stats</span>
                </button>
              )}

              {onOpenTransformModal && (
                <button
                  onClick={() => {
                    onOpenTransformModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-amber-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>YAML/XML/SQL & Anonymizer</span>
                </button>
              )}

              {onOpenFetchUrlModal && (
                <button
                  onClick={() => {
                    onOpenFetchUrlModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-emerald-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fetch Remote API Endpoint</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sort JSON Dropdown */}
        {onSortJson && (
          <div className="relative">
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowExportMenu(false);
              }}
              className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-xs font-semibold text-purple-300 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 border border-[#2A2A2E]"
              title="Sort JSON keys, arrays, or types"
            >
              <ArrowDownAZ className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Sort JSON</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#111114] border border-[#2A2A2E] rounded-lg shadow-2xl p-1.5 z-50 text-xs font-mono space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold text-[#6B6B72] uppercase border-b border-[#2A2A2E] mb-1">
                  JSON Sorting Options
                </div>

                <button
                  onClick={() => {
                    onSortJson('asc');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowDownAZ className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sort Keys (A to Z)</span>
                </button>

                <button
                  onClick={() => {
                    onSortJson('desc');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowUpZA className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sort Keys (Z to A)</span>
                </button>

                <button
                  onClick={() => {
                    onSortJson('key-length-asc');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>By Key Length (Short → Long)</span>
                </button>

                <button
                  onClick={() => {
                    onSortJson('type');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Group by Type (Values/Arrays/Objects)</span>
                </button>

                <button
                  onClick={() => {
                    onSortJson('reverse');
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
                >
                  <Repeat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reverse Keys & Arrays</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onOpenPasteModal}
          className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-xs font-semibold text-gray-200 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 border border-[#2A2A2E]"
          title="Paste raw JSON text"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Paste JSON</span>
        </button>

        <button
          onClick={onImportClick}
          className="px-3.5 py-1.5 bg-[#2A2A2E] hover:bg-[#3A3A40] text-xs font-semibold text-white rounded uppercase tracking-wider transition-all flex items-center gap-1.5"
          title="Import local JSON file"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111114] border border-[#2A2A2E] rounded shadow-2xl p-1 z-50 text-xs font-mono">
              <button
                onClick={() => {
                  onExportClick('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#1C1C1F] text-gray-200 rounded flex items-center justify-between"
              >
                <span>Formatted JSON (.json)</span>
              </button>
              <button
                onClick={() => {
                  onExportClick('minified');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#1C1C1F] text-gray-200 rounded flex items-center justify-between"
              >
                <span>Minified JSON (.json)</span>
              </button>
              <button
                onClick={() => {
                  onExportClick('csv');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#1C1C1F] text-gray-200 rounded flex items-center justify-between"
              >
                <span>CSV Table (.csv)</span>
              </button>
            </div>
          )}
        </div>

        {/* Toggle Full-screen / Focus Mode Button */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            className={`px-3 py-1.5 text-xs font-semibold rounded uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
              isFocusMode
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-600/20'
                : 'bg-[#1C1C1F] hover:bg-[#2A2A2E] text-gray-200 border-[#2A2A2E]'
            }`}
            title={isFocusMode ? 'Exit Full-Screen Focus Mode' : 'Toggle Full-Screen Focus Mode'}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden lg:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">Focus</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
