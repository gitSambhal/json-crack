/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ParsedFile } from '../types/json';
import {
  FileJson,
  Plus,
  X,
  AlertCircle,
  Copy,
  Edit2,
  FileText,
  Upload,
  ClipboardList,
  MoreHorizontal
} from 'lucide-react';

interface TabBarProps {
  files: ParsedFile[];
  activeFileId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseOtherTabs: (id: string) => void;
  onNewTab: () => void;
  onDuplicateTab: (id: string) => void;
  onRenameTab: (id: string, newName: string) => void;
  onImportClick: () => void;
  onOpenPasteModal: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onNewTab,
  onDuplicateTab,
  onRenameTab,
  onImportClick,
  onOpenPasteModal,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string;
  } | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
      setShowPlusMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleStartRename = (file: ParsedFile) => {
    setEditingTabId(file.id);
    setEditingName(file.name);
  };

  const handleFinishRename = (fileId: string) => {
    if (editingName.trim()) {
      let finalName = editingName.trim();
      if (!finalName.endsWith('.json') && !finalName.includes('.')) {
        finalName += '.json';
      }
      onRenameTab(fileId, finalName);
    }
    setEditingTabId(null);
  };

  return (
    <div className="h-9 bg-[#16161a] border-b border-[#2A2A2E] flex items-center justify-between px-2 font-mono text-xs z-20 select-none relative">
      {/* Scrollable Tabs Wrapper */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 py-1 pr-2"
      >
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isEditing = editingTabId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  // Middle click closes tab
                  e.preventDefault();
                  onCloseTab(file.id);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectTab(file.id);
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  fileId: file.id,
                });
              }}
              className={`group relative h-7 px-3 rounded-t-md flex items-center gap-2 cursor-pointer transition-all border-t-2 shrink-0 max-w-[200px] ${
                isActive
                  ? 'bg-[#0A0A0B] border-blue-500 text-white font-medium shadow-md'
                  : 'bg-[#1C1C1F]/60 hover:bg-[#1C1C1F] border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* File Icon / Error Icon */}
              {file.isValid ? (
                <FileJson
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-[#6B6B72] group-hover:text-gray-300'
                  }`}
                />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              )}

              {/* Title or Editable Input */}
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleFinishRename(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(file.id);
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#2A2A2E] text-white text-xs px-1 py-0.5 rounded outline-none border border-blue-500 w-24"
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleStartRename(file);
                  }}
                  className="text-xs truncate"
                  title={`${file.name} (${file.sizeFormatted}) - Double click to rename`}
                >
                  {file.name}
                </span>
              )}

              {/* Tab Close Button */}
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className={`p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-700/60 transition-all ${
                    isActive ? 'opacity-80 text-gray-300' : 'text-gray-500 hover:text-gray-200'
                  }`}
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Plus / New Tab Button */}
        <div className="relative shrink-0 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNewTab();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPlusMenu(true);
            }}
            className="h-7 px-2 rounded hover:bg-[#2A2A2E] text-gray-400 hover:text-white transition-colors flex items-center justify-center border border-transparent hover:border-[#3A3A3E]"
            title="New JSON Tab (Right click for options)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Plus Menu Dropdown */}
          {showPlusMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1.5 w-48 bg-[#111114] border border-[#2A2A2E] rounded-md shadow-2xl p-1 z-50 text-xs font-mono space-y-0.5"
            >
              <button
                onClick={() => {
                  onNewTab();
                  setShowPlusMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-blue-300 text-gray-200 rounded flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>New Blank Tab</span>
              </button>
              <button
                onClick={() => {
                  onImportClick();
                  setShowPlusMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-emerald-300 text-gray-200 rounded flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import File(s)...</span>
              </button>
              <button
                onClick={() => {
                  onOpenPasteModal();
                  setShowPlusMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
              >
                <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                <span>Paste Raw JSON...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bg-[#111114] border border-[#2A2A2E] rounded-md shadow-2xl p-1 z-50 w-44 text-xs font-mono space-y-0.5"
        >
          {files.find((f) => f.id === contextMenu.fileId) && (
            <button
              onClick={() => {
                const targetFile = files.find((f) => f.id === contextMenu.fileId);
                if (targetFile) handleStartRename(targetFile);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-blue-300 text-gray-200 rounded flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Rename Tab</span>
            </button>
          )}

          <button
            onClick={() => {
              onDuplicateTab(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-purple-300 text-gray-200 rounded flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>Duplicate Tab</span>
          </button>

          <div className="my-1 border-t border-[#2A2A2E]" />

          {files.length > 1 && (
            <>
              <button
                onClick={() => {
                  onCloseTab(contextMenu.fileId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-red-300 text-gray-200 rounded flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
                <span>Close Tab</span>
              </button>

              <button
                onClick={() => {
                  onCloseOtherTabs(contextMenu.fileId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#1C1C1F] hover:text-amber-300 text-gray-200 rounded flex items-center gap-2"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Close Other Tabs</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
