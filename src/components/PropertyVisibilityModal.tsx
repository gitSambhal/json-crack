/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  SlidersHorizontal,
  Filter,
  Layers,
  Trash2,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';
import {
  extractAllProperties,
  PropertyInfo,
  PropertyFilterConfig,
  isCommonNoiseKey,
} from '../utils/propertyFilter';
import { NodeType } from '../types/json';

interface PropertyVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  propertyFilter?: PropertyFilterConfig;
  onUpdateFilter: (newConfig: PropertyFilterConfig) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PropertyVisibilityModal: React.FC<PropertyVisibilityModalProps> = ({
  isOpen,
  onClose,
  data,
  propertyFilter = { hiddenKeys: new Set<string>(), hideNulls: false, hideEmpty: false },
  onUpdateFilter,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<NodeType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'visible' | 'hidden'>('all');

  const safeHiddenKeys = useMemo(() => propertyFilter?.hiddenKeys || new Set<string>(), [propertyFilter?.hiddenKeys]);

  const allProperties: PropertyInfo[] = useMemo(() => {
    if (!data) return [];
    return extractAllProperties(data);
  }, [data]);

  // Filtered properties based on search and type
  const displayedProperties = useMemo(() => {
    return allProperties.filter((prop) => {
      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = prop.name.toLowerCase().includes(q);
        const matchesSample = prop.sampleValue !== undefined && String(prop.sampleValue).toLowerCase().includes(q);
        if (!matchesName && !matchesSample) return false;
      }

      // Type match
      if (typeFilter !== 'all') {
        if (!prop.types.has(typeFilter)) return false;
      }

      // Tab match
      const isHidden = safeHiddenKeys.has(prop.name);
      if (activeTab === 'visible' && isHidden) return false;
      if (activeTab === 'hidden' && !isHidden) return false;

      return true;
    });
  }, [allProperties, searchTerm, typeFilter, activeTab, safeHiddenKeys]);

  const hiddenCount = useMemo(() => {
    return allProperties.filter((p) => safeHiddenKeys.has(p.name)).length;
  }, [allProperties, safeHiddenKeys]);

  const visibleCount = allProperties.length - hiddenCount;

  if (!isOpen) return null;

  const handleToggleKey = (keyName: string) => {
    const nextHidden = new Set(safeHiddenKeys);
    if (nextHidden.has(keyName)) {
      nextHidden.delete(keyName);
    } else {
      nextHidden.add(keyName);
    }
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: nextHidden,
    });
  };

  const handleShowAll = () => {
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: new Set(),
    });
    onShowToast?.('All properties are now visible', 'success');
  };

  const handleHideAllDisplayed = () => {
    const nextHidden = new Set(safeHiddenKeys);
    displayedProperties.forEach((p) => nextHidden.add(p.name));
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: nextHidden,
    });
    onShowToast?.(`Hidden ${displayedProperties.length} properties`, 'info');
  };

  const handleShowAllDisplayed = () => {
    const nextHidden = new Set(safeHiddenKeys);
    displayedProperties.forEach((p) => nextHidden.delete(p.name));
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: nextHidden,
    });
    onShowToast?.(`Showing ${displayedProperties.length} properties`, 'success');
  };

  const handleInvertSelection = () => {
    const nextHidden = new Set<string>();
    allProperties.forEach((p) => {
      if (!safeHiddenKeys.has(p.name)) {
        nextHidden.add(p.name);
      }
    });
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: nextHidden,
    });
    onShowToast?.('Inverted property visibility selection', 'info');
  };

  const handleHideNoiseKeys = () => {
    const nextHidden = new Set(safeHiddenKeys);
    let count = 0;
    allProperties.forEach((p) => {
      if (isCommonNoiseKey(p.name)) {
        nextHidden.add(p.name);
        count++;
      }
    });
    onUpdateFilter({
      ...propertyFilter,
      hiddenKeys: nextHidden,
    });
    onShowToast?.(`Filtered out ${count} system & metadata keys (_id, __v, timestamp, etc.)`, 'success');
  };

  const handleToggleNulls = () => {
    const next = !propertyFilter?.hideNulls;
    onUpdateFilter({
      ...propertyFilter,
      hideNulls: next,
    });
    onShowToast?.(next ? 'Null and undefined values hidden' : 'Null values visible', 'info');
  };

  const handleToggleEmpty = () => {
    const next = !propertyFilter?.hideEmpty;
    onUpdateFilter({
      ...propertyFilter,
      hideEmpty: next,
    });
    onShowToast?.(next ? 'Empty strings, objects & arrays hidden' : 'Empty values visible', 'info');
  };

  const renderTypeBadges = (types: Set<NodeType>) => {
    return Array.from(types).map((t) => {
      let color = 'bg-gray-800 text-gray-400 border-gray-700';
      if (t === 'string') color = 'bg-green-950/60 text-green-400 border-green-800/40';
      else if (t === 'number') color = 'bg-yellow-950/60 text-yellow-400 border-yellow-800/40';
      else if (t === 'boolean') color = 'bg-purple-950/60 text-purple-400 border-purple-800/40';
      else if (t === 'object') color = 'bg-blue-950/60 text-blue-400 border-blue-800/40';
      else if (t === 'array') color = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40';
      else if (t === 'null') color = 'bg-red-950/60 text-red-400 border-red-800/40';

      return (
        <span
          key={t}
          className={`px-1.5 py-0.2 text-[9px] font-mono font-semibold rounded border ${color}`}
        >
          {t}
        </span>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#121215] border border-[#2A2A2E] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2A2E] bg-[#18181C]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Property Visibility & Filter</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2A2A2E] text-gray-300">
                  {visibleCount} visible / {allProperties.length} total
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B6B72] hover:text-white p-1 rounded hover:bg-[#2A2A2E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Preset Actions & Quick Toggles */}
        <div className="p-3.5 bg-[#141418] border-b border-[#2A2A2E] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleHideNoiseKeys}
              className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Automatically hides _id, __v, timestamp, createdAt, updatedAt, tokens, etc."
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Hide Noise & Metadata IDs</span>
            </button>

            <button
              onClick={handleInvertSelection}
              className="px-2.5 py-1 bg-[#1F1F24] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-gray-300 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" />
              <span>Invert</span>
            </button>

            {hiddenCount > 0 && (
              <button
                onClick={handleShowAll}
                className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-blue-300 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3 h-3 text-blue-400" />
                <span>Show All ({hiddenCount} hidden)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-300 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={propertyFilter.hideNulls}
                onChange={handleToggleNulls}
                className="w-3.5 h-3.5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Hide Nulls</span>
            </label>

            <label className="flex items-center gap-1.5 text-[11px] text-gray-300 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={propertyFilter.hideEmpty}
                onChange={handleToggleEmpty}
                className="w-3.5 h-3.5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Hide Empty ("" / [] / {})</span>
            </label>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-4 py-2.5 bg-[#16161A] border-b border-[#2A2A2E] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6B6B72]" />
            <input
              type="text"
              placeholder="Filter properties by name or sample value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0E0E11] text-gray-200 text-xs pl-8 pr-3 py-1.5 rounded border border-[#2A2A2E] focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-gray-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center bg-[#0E0E11] border border-[#2A2A2E] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({allProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('visible')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                activeTab === 'visible' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Visible ({visibleCount})
            </button>
            <button
              onClick={() => setActiveTab('hidden')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                activeTab === 'hidden' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Hidden ({hiddenCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShowAllDisplayed}
              className="px-2 py-1 bg-[#1F1F24] hover:bg-[#2A2A2E] text-gray-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
              title="Show all properties matching current search"
            >
              <CheckSquare className="w-3 h-3 text-green-400" />
              <span>Show All Filtered</span>
            </button>
            <button
              onClick={handleHideAllDisplayed}
              className="px-2 py-1 bg-[#1F1F24] hover:bg-[#2A2A2E] text-gray-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
              title="Hide all properties matching current search"
            >
              <Square className="w-3 h-3 text-red-400" />
              <span>Hide All Filtered</span>
            </button>
          </div>
        </div>

        {/* Properties Checklist */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#0A0A0B]">
          {displayedProperties.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-400" />
              <p className="font-semibold text-gray-400">No properties match your filter</p>
              <p className="text-[11px] text-gray-600 mt-1">Try clearing your search query or switching tabs.</p>
            </div>
          ) : (
            displayedProperties.map((prop) => {
              const isHidden = propertyFilter.hiddenKeys.has(prop.name);
              const isNoise = isCommonNoiseKey(prop.name);

              return (
                <div
                  key={prop.name}
                  onClick={() => handleToggleKey(prop.name)}
                  className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isHidden
                      ? 'bg-[#121215]/60 border-[#222226] opacity-60 hover:opacity-100 hover:bg-[#18181D]'
                      : 'bg-[#151518] border-[#2A2A2E] hover:border-blue-500/50 hover:bg-[#1A1A20]'
                  }`}
                >
                  {/* Left: Checkbox + Property Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={!isHidden}
                      onChange={() => {}} // Handled by container click
                      className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isHidden ? 'text-gray-400 line-through' : 'text-white'
                          }`}
                        >
                          "{prop.name}"
                        </span>

                        {isNoise && (
                          <span className="px-1.5 py-0.2 text-[8px] uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded font-semibold shrink-0">
                            Metadata
                          </span>
                        )}

                        <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                          ({prop.count} {prop.count === 1 ? 'place' : 'places'})
                        </span>
                      </div>

                      {/* Sample Value preview */}
                      {prop.sampleValue !== undefined && (
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          Sample:{' '}
                          <span className="text-gray-400 font-mono">
                            {typeof prop.sampleValue === 'object' && prop.sampleValue !== null
                              ? Array.isArray(prop.sampleValue)
                                ? `[Array(${prop.sampleValue.length})]`
                                : `{Object(${Object.keys(prop.sampleValue).length} keys)}`
                              : String(prop.sampleValue).slice(0, 45)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Type Badges & Eye Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1">
                      {renderTypeBadges(prop.types)}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleKey(prop.name);
                      }}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        isHidden
                          ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30'
                          : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 border border-blue-800/30'
                      }`}
                      title={isHidden ? 'Click to show this property' : 'Click to hide this property'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2A2A2E] bg-[#161619] flex items-center justify-between text-xs">
          <div className="text-gray-400 text-[11px]">
            {hiddenCount > 0 ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                {hiddenCount} properties hidden ({visibleCount} visible)
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                All {allProperties.length} properties visible
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-3.5 h-3.5" /> Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
