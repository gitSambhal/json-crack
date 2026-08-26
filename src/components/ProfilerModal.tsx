/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useMemo } from 'react';
import { generateDataProfile, ProfileSummary } from '../utils/dataProfiler';
import { X, BarChart3, PieChart, Layers, FileText, Hash, CheckCircle } from 'lucide-react';

interface ProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  filename: string;
}

export const ProfilerModal: React.FC<ProfilerModalProps> = ({
  isOpen,
  onClose,
  data,
  filename,
}) => {
  const profile: ProfileSummary = useMemo(() => generateDataProfile(data), [data]);

  if (!isOpen) return null;

  const totalTypes =
    profile.typeCounts.string +
    profile.typeCounts.number +
    profile.typeCounts.boolean +
    profile.typeCounts.object +
    profile.typeCounts.array +
    profile.typeCounts.null || 1;

  const getPercent = (count: number) => Math.round((count / totalTypes) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-sm">JSON Data Profiler & Structure Analytics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-auto bg-[#0A0A0B] space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#16161A] border border-[#2A2A2E] p-3 rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Records</span>
              <span className="text-xl font-bold text-white">{profile.totalRecords}</span>
            </div>
            <div className="bg-[#16161A] border border-[#2A2A2E] p-3 rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Unique Property Keys</span>
              <span className="text-xl font-bold text-blue-400">{profile.totalKeys}</span>
            </div>
            <div className="bg-[#16161A] border border-[#2A2A2E] p-3 rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Max Nesting Depth</span>
              <span className="text-xl font-bold text-purple-400">{profile.maxDepth} levels</span>
            </div>
            <div className="bg-[#16161A] border border-[#2A2A2E] p-3 rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Nodes</span>
              <span className="text-xl font-bold text-emerald-400">{totalTypes}</span>
            </div>
          </div>

          {/* Type Distribution Breakdown */}
          <div className="bg-[#16161A] border border-[#2A2A2E] p-4 rounded-lg space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" /> Data Type Breakdown
            </h4>

            {/* Visual Bar */}
            <div className="h-3 w-full bg-[#1C1C1F] rounded-full overflow-hidden flex">
              <div style={{ width: `${getPercent(profile.typeCounts.string)}%` }} className="bg-emerald-500 h-full" title="Strings" />
              <div style={{ width: `${getPercent(profile.typeCounts.number)}%` }} className="bg-purple-500 h-full" title="Numbers" />
              <div style={{ width: `${getPercent(profile.typeCounts.boolean)}%` }} className="bg-amber-500 h-full" title="Booleans" />
              <div style={{ width: `${getPercent(profile.typeCounts.object)}%` }} className="bg-blue-500 h-full" title="Objects" />
              <div style={{ width: `${getPercent(profile.typeCounts.array)}%` }} className="bg-cyan-500 h-full" title="Arrays" />
              <div style={{ width: `${getPercent(profile.typeCounts.null)}%` }} className="bg-red-500 h-full" title="Nulls" />
            </div>

            {/* Type Badges */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strings: {profile.typeCounts.string} ({getPercent(profile.typeCounts.string)}%)
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Numbers: {profile.typeCounts.number} ({getPercent(profile.typeCounts.number)}%)
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Booleans: {profile.typeCounts.boolean} ({getPercent(profile.typeCounts.boolean)}%)
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Objects: {profile.typeCounts.object} ({getPercent(profile.typeCounts.object)}%)
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Arrays: {profile.typeCounts.array} ({getPercent(profile.typeCounts.array)}%)
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Nulls: {profile.typeCounts.null} ({getPercent(profile.typeCounts.null)}%)
              </div>
            </div>
          </div>

          {/* Fields Analysis Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Field Frequency & Profiling
            </h4>

            <div className="border border-[#2A2A2E] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#16161A] border-b border-[#2A2A2E] text-gray-300 font-bold">
                    <th className="p-2.5 border-r border-[#2A2A2E]">Property Path</th>
                    <th className="p-2.5 border-r border-[#2A2A2E]">Types</th>
                    <th className="p-2.5 border-r border-[#2A2A2E]">Distinct Values</th>
                    <th className="p-2.5 border-r border-[#2A2A2E]">Null Count</th>
                    <th className="p-2.5">Sample Values</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.fields.slice(0, 100).map((field, idx) => (
                    <tr key={idx} className="border-b border-[#1C1C1F] hover:bg-[#16161A] text-gray-300">
                      <td className="p-2 border-r border-[#1C1C1F] font-mono text-blue-400 font-bold truncate max-w-xs">
                        {field.key}
                      </td>
                      <td className="p-2 border-r border-[#1C1C1F]">
                        {Object.entries(field.types)
                          .map(([t, c]) => `${t} (${c})`)
                          .join(', ')}
                      </td>
                      <td className="p-2 border-r border-[#1C1C1F] text-purple-400 font-bold">
                        {field.distinctCount}
                      </td>
                      <td className="p-2 border-r border-[#1C1C1F] text-red-400">
                        {field.nullCount}
                      </td>
                      <td className="p-2 text-gray-400 text-[10px] truncate max-w-xs">
                        {field.sampleValues.map((s) => (typeof s === 'object' ? JSON.stringify(s) : String(s))).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
