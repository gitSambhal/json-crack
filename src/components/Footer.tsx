/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  selectedPath: string | null;
  activeFileName: string;
  totalNodes?: number;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  selectedPath,
  activeFileName,
  totalNodes,
  onOpenChangelog,
}) => {
  return (
    <footer className="h-8 border-t border-[#2A2A2E] bg-[#111114] flex items-center px-4 justify-between text-[10px] font-bold text-[#6B6B72] tracking-widest font-mono z-30 select-none">
      {/* Left status items */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 uppercase text-gray-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>READY</span>
        </div>

        <div className="hidden sm:block uppercase">UTF-8</div>
        <div className="hidden sm:block uppercase">LF</div>

        {/* Developer Attribution */}
        <div className="flex items-center gap-1.5 text-[#9CA3AF] border-l border-[#2A2A2E] pl-4">
          <span>Created by</span>
          <a
            href="https://suhail.top"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5"
          >
            Suhail Akhtar <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Right side info & selected path */}
      <div className="flex items-center gap-4">
        {selectedPath ? (
          <div className="bg-[#1C1C1F] px-2.5 py-0.5 rounded text-blue-400 font-mono border border-[#2A2A2E] truncate max-w-xs">
            PATH: {selectedPath}
          </div>
        ) : (
          <div className="bg-[#1C1C1F] px-2 py-0.5 rounded text-gray-400">
            FILE: {activeFileName}
          </div>
        )}

        {totalNodes !== undefined && (
          <span className="hidden md:inline text-gray-400">{totalNodes.toLocaleString()} NODES</span>
        )}

        <button
          onClick={onOpenChangelog}
          className="hover:text-white transition-colors cursor-pointer text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/30"
          title="Click to view v1.0.0 Changelog"
        >
          v1.0.0
        </button>
      </div>
    </footer>
  );
};
