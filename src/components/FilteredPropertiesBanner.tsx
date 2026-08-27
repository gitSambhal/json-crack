/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React from 'react';
import { EyeOff, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { PropertyFilterConfig } from '../utils/propertyFilter';

interface FilteredPropertiesBannerProps {
  propertyFilter?: PropertyFilterConfig;
  onOpenModal: () => void;
  onUnhideKey?: (key: string) => void;
  onResetFilter: () => void;
}

export const FilteredPropertiesBanner: React.FC<FilteredPropertiesBannerProps> = ({
  propertyFilter,
  onOpenModal,
  onUnhideKey,
  onResetFilter,
}) => {
  const hiddenKeysList = Array.from(propertyFilter?.hiddenKeys || []);
  const isFiltered =
    Boolean(propertyFilter) &&
    (hiddenKeysList.length > 0 ||
      Boolean(propertyFilter?.hideNulls) ||
      Boolean(propertyFilter?.hideEmpty) ||
      Boolean(propertyFilter?.customHiddenPaths && propertyFilter.customHiddenPaths.size > 0));

  if (!isFiltered) return null;

  return (
    <div className="bg-[#18181D] border-b border-amber-500/30 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none z-20">
      <div className="flex items-center flex-wrap gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0">
          <EyeOff className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wider">Filtered View:</span>
        </div>

        {/* Hidden key chips */}
        <div className="flex items-center flex-wrap gap-1.5">
          {hiddenKeysList.slice(0, 6).map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30 text-amber-200 text-[11px]"
            >
              <span>"{key}"</span>
              {onUnhideKey && (
                <button
                  onClick={() => onUnhideKey(key)}
                  className="hover:text-white text-amber-400/80 p-0.5 rounded transition-colors"
                  title={`Unhide "${key}"`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}

          {hiddenKeysList.length > 6 && (
            <span
              onClick={onOpenModal}
              className="text-[10px] text-amber-300/80 underline cursor-pointer hover:text-amber-200"
            >
              +{hiddenKeysList.length - 6} more
            </span>
          )}

          {propertyFilter?.hideNulls && (
            <span className="px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-purple-300 text-[10px]">
              Nulls Hidden
            </span>
          )}

          {propertyFilter?.hideEmpty && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-[10px]">
              Empty Hidden
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenModal}
          className="px-2.5 py-1 bg-[#222228] hover:bg-[#2C2C34] text-gray-200 text-[11px] font-semibold rounded border border-[#33333C] flex items-center gap-1.5 transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3 text-blue-400" />
          <span>Manage Filter</span>
        </button>

        <button
          onClick={onResetFilter}
          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold rounded border border-amber-500/30 flex items-center gap-1 transition-colors"
          title="Show all properties (Reset filter)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Show All</span>
        </button>
      </div>
    </div>
  );
};
