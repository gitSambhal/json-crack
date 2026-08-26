/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import { getNodeType, SortMode } from '../utils/jsonParser';
import { copyToClipboard } from '../utils/export';
import { Copy, Check, Edit2, Trash2, Key, Link as LinkIcon, FileJson, ArrowDownAZ, ArrowUpZA } from 'lucide-react';

interface NodeInspectorProps {
  selectedPath: string | null;
  data: any;
  onUpdateValue: (path: string, newValue: any) => void;
  onDeleteKey: (path: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSortSubTree?: (path: string, mode: SortMode) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedPath,
  data,
  onUpdateValue,
  onDeleteKey,
  onShowToast,
  onSortSubTree,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');

  // Calculate current node value from path
  let cleanPath = selectedPath || '';
  if (cleanPath.startsWith('root.')) cleanPath = '$.' + cleanPath.slice(5);
  else if (cleanPath === 'root') cleanPath = '$';

  let value: any = undefined;
  if (selectedPath) {
    try {
      if (cleanPath === '$') {
        value = data;
      } else {
        const parts = cleanPath.slice(2).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
        let curr = data;
        for (const p of parts) {
          if (curr !== undefined && curr !== null) {
            curr = curr[p];
          } else {
            curr = undefined;
            break;
          }
        }
        value = curr;
      }
    } catch {
      value = undefined;
    }
  }

  const type = getNodeType(value);

  useEffect(() => {
    setIsEditing(false);
    if (!selectedPath) {
      setEditInputValue('');
    } else if (type === 'string') {
      setEditInputValue(String(value));
    } else if (type === 'number' || type === 'boolean') {
      setEditInputValue(String(value));
    } else {
      setEditInputValue(JSON.stringify(value, null, 2) || '');
    }
  }, [selectedPath, value, type]);

  if (!selectedPath) {
    return (
      <div className="p-4 border-t border-[#2A2A2E] bg-[#111114] text-xs font-mono text-[#6B6B72]">
        Select any node or key in Tree or Graph view to inspect path and values.
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    setCopiedType(label);
    onShowToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSaveEdit = () => {
    try {
      let parsedVal: any = editInputValue;
      if (type === 'number') parsedVal = Number(editInputValue);
      else if (type === 'boolean') parsedVal = editInputValue === 'true';
      else if (type === 'null') parsedVal = null;
      else if (type === 'object' || type === 'array') parsedVal = JSON.parse(editInputValue);

      onUpdateValue(selectedPath, parsedVal);
      setIsEditing(false);
      onShowToast('Node updated successfully', 'success');
    } catch (err: any) {
      onShowToast(`Failed to parse value: ${err.message}`, 'error');
    }
  };

  return (
    <div className="p-4 border-t border-[#2A2A2E] bg-[#111114] font-mono text-xs space-y-3">
      <div className="flex items-center justify-between text-[10px] uppercase text-[#6B6B72] font-bold tracking-wider">
        <span>Node Inspector</span>
        <span className="px-1.5 py-0.5 rounded bg-[#1C1C1F] text-blue-400 font-semibold border border-[#2A2A2E]">
          {type}
        </span>
      </div>

      {/* Path section */}
      <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded p-2 space-y-1">
        <div className="text-[10px] text-[#6B6B72] flex items-center gap-1">
          <LinkIcon className="w-3 h-3 text-blue-400" /> JSON Path:
        </div>
        <div className="flex items-center justify-between gap-2">
          <code className="text-white font-semibold truncate text-[11px]">{cleanPath}</code>
          <button
            onClick={() => handleCopy(cleanPath, 'JSONPath')}
            className="text-[#6B6B72] hover:text-white p-1 rounded transition-colors"
            title="Copy JSONPath"
          >
            {copiedType === 'JSONPath' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Value section */}
      <div className="bg-[#0A0A0B] border border-[#2A2A2E] rounded p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6B6B72]">Value Preview:</span>
          <div className="flex items-center gap-1.5">
            {onSortSubTree && (type === 'object' || type === 'array') && selectedPath && (
              <div className="flex items-center gap-1 border-r border-[#2A2A2E] pr-1.5">
                <button
                  onClick={() => onSortSubTree(selectedPath, 'asc')}
                  className="text-purple-400 hover:text-purple-300 p-1 rounded transition-colors flex items-center gap-0.5 text-[10px]"
                  title="Sort sub-tree A-Z"
                >
                  <ArrowDownAZ className="w-3 h-3" /> A-Z
                </button>
                <button
                  onClick={() => onSortSubTree(selectedPath, 'desc')}
                  className="text-indigo-400 hover:text-indigo-300 p-1 rounded transition-colors flex items-center gap-0.5 text-[10px]"
                  title="Sort sub-tree Z-A"
                >
                  <ArrowUpZA className="w-3 h-3" /> Z-A
                </button>
              </div>
            )}
            <button
              onClick={() => {
                const jsonStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
                handleCopy(jsonStr, 'Sub-tree JSON');
              }}
              className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors flex items-center gap-1 text-[10px]"
              title="Copy partial JSON for this node sub-tree"
            >
              <FileJson className="w-3 h-3" /> Copy Sub-tree
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors flex items-center gap-1 text-[10px]"
              title="Edit value"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            {selectedPath !== 'root' && selectedPath !== '$' && (
              <button
                onClick={() => onDeleteKey(selectedPath)}
                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                title="Delete node"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              className="w-full h-24 bg-[#1C1C1F] border border-[#2A2A2E] rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 bg-[#2A2A2E] text-gray-300 rounded text-[10px] uppercase font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] uppercase font-bold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <pre className="text-xs text-emerald-400 max-h-24 overflow-y-auto whitespace-pre-wrap break-all leading-tight">
            {type === 'object' || type === 'array'
              ? JSON.stringify(value, null, 2)
              : String(value)}
          </pre>
        )}
      </div>
    </div>
  );
};
