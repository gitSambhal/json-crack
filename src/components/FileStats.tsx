/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { JsonStats } from '../types/json';
import { Hash, Layers, Box, Brackets, Type, ToggleRight, Minus } from 'lucide-react';

interface FileStatsProps {
  stats: JsonStats | null;
  selectedPath?: string;
}

export const FileStats: React.FC<FileStatsProps> = ({ stats, selectedPath }) => {
  if (!stats) return null;

  return (
    <div className="p-4 border-t border-[#2A2A2E] bg-[#0A0A0B] text-xs font-mono space-y-3">
      <div className="text-[10px] uppercase text-[#6B6B72] font-bold tracking-widest flex items-center justify-between">
        <span>File Metadata</span>
        <span className="text-blue-400">{stats.formattedSize}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-[#111114] border border-[#2A2A2E] rounded p-2 flex items-center justify-between">
          <span className="text-[#6B6B72] flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-blue-400" /> Nodes
          </span>
          <span className="font-bold text-white">{stats.totalNodes.toLocaleString()}</span>
        </div>

        <div className="bg-[#111114] border border-[#2A2A2E] rounded p-2 flex items-center justify-between">
          <span className="text-[#6B6B72] flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-purple-400" /> Max Depth
          </span>
          <span className="font-bold text-white">{stats.maxDepth}</span>
        </div>

        <div className="bg-[#111114] border border-[#2A2A2E] rounded p-2 flex items-center justify-between">
          <span className="text-[#6B6B72] flex items-center gap-1.5">
            <Box className="w-3 h-3 text-cyan-400" /> Objects
          </span>
          <span className="font-bold text-white">{stats.objectCount}</span>
        </div>

        <div className="bg-[#111114] border border-[#2A2A2E] rounded p-2 flex items-center justify-between">
          <span className="text-[#6B6B72] flex items-center gap-1.5">
            <Brackets className="w-3 h-3 text-emerald-400" /> Arrays
          </span>
          <span className="font-bold text-white">{stats.arrayCount}</span>
        </div>
      </div>

      <div className="pt-1 border-t border-[#2A2A2E]/50 space-y-1 text-[10px]">
        <div className="flex justify-between py-0.5">
          <span className="text-[#6B6B72] flex items-center gap-1">
            <Type className="w-3 h-3 text-green-400" /> Strings:
          </span>
          <span className="text-gray-300 font-semibold">{stats.stringCount}</span>
        </div>

        <div className="flex justify-between py-0.5">
          <span className="text-[#6B6B72] flex items-center gap-1">
            <Hash className="w-3 h-3 text-yellow-400" /> Numbers:
          </span>
          <span className="text-gray-300 font-semibold">{stats.numberCount}</span>
        </div>

        <div className="flex justify-between py-0.5">
          <span className="text-[#6B6B72] flex items-center gap-1">
            <ToggleRight className="w-3 h-3 text-purple-400" /> Booleans:
          </span>
          <span className="text-gray-300 font-semibold">{stats.booleanCount}</span>
        </div>

        <div className="flex justify-between py-0.5">
          <span className="text-[#6B6B72] flex items-center gap-1">
            <Minus className="w-3 h-3 text-gray-500" /> Nulls:
          </span>
          <span className="text-gray-300 font-semibold">{stats.nullCount}</span>
        </div>
      </div>
    </div>
  );
};
