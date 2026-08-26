/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * JSON Crack style interactive graph view
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GraphNode, GraphEdge, NodeType, SearchResult } from '../types/json';
import { generateGraphLayout, getNodeType, getPathValue, SortMode } from '../utils/jsonParser';
import { copyToClipboard } from '../utils/export';
import { ContextMenu, ContextMenuTarget } from '../components/ContextMenu';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Move,
  Layers,
  FileJson
} from 'lucide-react';

interface GraphViewProps {
  data: any;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  searchResults: SearchResult[];
  activeSearchQuery: string;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSortSubTree?: (path: string, mode: SortMode) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  data,
  selectedPath,
  onSelectPath,
  searchResults,
  activeSearchQuery,
  onShowToast,
  onSortSubTree,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout state
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [contextMenuTarget, setContextMenuTarget] = useState<ContextMenuTarget | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate layout nodes & edges
  const { nodes, edges } = useMemo(() => {
    return generateGraphLayout(data, collapsedPaths);
  }, [data, collapsedPaths]);

  // Highlighted path matching search or selected node
  const matchingPathsSet = useMemo(() => {
    const set = new Set<string>();
    searchResults.forEach((r) => set.add(r.path));
    return set;
  }, [searchResults]);

  // Toggle node expand/collapse
  const toggleCollapse = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start pan if clicking background canvas, not a node card
    if ((e.target as HTMLElement).closest('.graph-node-card')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(2.5, Math.max(0.2, prev * zoomFactor)));
  };

  // Reset & fit graph to center
  const fitGraphToScreen = () => {
    if (nodes.length === 0 || !containerRef.current) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + n.height);
    });

    const graphWidth = maxX - minX + 100;
    const graphHeight = maxY - minY + 100;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const scaleX = containerWidth / graphWidth;
    const scaleY = containerHeight / graphHeight;
    const newZoom = Math.min(1.2, Math.max(0.3, Math.min(scaleX, scaleY)));

    setZoom(newZoom);
    setPan({
      x: (containerWidth - graphWidth * newZoom) / 2 - minX * newZoom + 40,
      y: (containerHeight - graphHeight * newZoom) / 2 - minY * newZoom + 40,
    });
  };

  useEffect(() => {
    fitGraphToScreen();
  }, [data]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 bg-[#0A0A0B] overflow-hidden select-none cursor-grab active:cursor-grabbing font-mono"
    >
      <ContextMenu
        target={contextMenuTarget}
        onClose={() => setContextMenuTarget(null)}
        onSelectPath={onSelectPath}
        onShowToast={onShowToast || (() => {})}
        onSortSubTree={onSortSubTree}
      />

      {/* Background dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Main Zoomable & Pannable Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-none z-0">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" opacity="0.6" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const dx = edge.targetPoint.x - edge.sourcePoint.x;
            const controlOffset = Math.min(180, Math.max(60, Math.abs(dx) * 0.5));

            const pathD = `M ${edge.sourcePoint.x} ${edge.sourcePoint.y} C ${
              edge.sourcePoint.x + controlOffset
            } ${edge.sourcePoint.y}, ${edge.targetPoint.x - controlOffset} ${
              edge.targetPoint.y
            }, ${edge.targetPoint.x} ${edge.targetPoint.y}`;

            const isSelectedEdge =
              selectedPath &&
              (edge.sourceId === selectedPath || edge.targetId === selectedPath);

            return (
              <g key={edge.id}>
                <path
                  d={pathD}
                  stroke={isSelectedEdge ? '#3B82F6' : '#2A2A2E'}
                  strokeWidth={isSelectedEdge ? 2.5 : 1.5}
                  fill="none"
                  strokeDasharray={isSelectedEdge ? '4 2' : undefined}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = selectedPath === node.path;
          const isMatchingSearch = matchingPathsSet.has(node.path);

          let badgeColor = 'bg-[#2A2A2E] text-gray-300';
          if (node.type === 'object') badgeColor = 'bg-blue-950/80 text-blue-400 border-blue-500/40';
          else if (node.type === 'array') badgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';

          const handleNodeContextMenu = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectPath(node.path);
            const subTreeVal = getPathValue(data, node.path);
            setContextMenuTarget({
              x: e.clientX,
              y: e.clientY,
              path: node.path,
              value: subTreeVal,
              keyName: node.label,
            });
          };

          const handleCopyNodeSubtree = (e: React.MouseEvent) => {
            e.stopPropagation();
            const subTreeVal = getPathValue(data, node.path);
            let cleanPath = node.path;
            if (cleanPath.startsWith('root.')) cleanPath = '$.' + cleanPath.slice(5);
            else if (cleanPath === 'root') cleanPath = '$';
            try {
              const jsonStr = typeof subTreeVal === 'string' ? subTreeVal : JSON.stringify(subTreeVal, null, 2);
              copyToClipboard(jsonStr);
              if (onShowToast) onShowToast(`Copied sub-tree JSON for "${cleanPath}"`, 'success');
            } catch {
              if (onShowToast) onShowToast('Failed to copy sub-tree JSON', 'error');
            }
          };

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPath(node.path);
              }}
              onContextMenu={handleNodeContextMenu}
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
              }}
              className={`graph-node-card absolute pointer-events-auto rounded-md bg-[#111114] border shadow-2xl transition-all duration-150 z-10 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-blue-500/10'
                  : isMatchingSearch
                  ? 'border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
                  : 'border-[#2A2A2E] hover:border-[#3A3A40]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A2E] bg-[#1C1C1F] rounded-t-md">
                <div className="flex items-center gap-2 truncate">
                  <button
                    onClick={(e) => toggleCollapse(node.path, e)}
                    className="text-[#6B6B72] hover:text-white p-0.5 rounded transition-colors"
                  >
                    {node.collapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="font-bold text-xs text-white truncate" title={node.label}>
                    {node.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyNodeSubtree}
                    className="text-[#6B6B72] hover:text-blue-400 p-0.5 rounded transition-colors"
                    title="Right-click node or click here to copy sub-tree JSON"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${badgeColor}`}
                  >
                    {node.type}
                  </span>
                </div>
              </div>

              {/* Card Entries list */}
              {!node.collapsed && (
                <div className="p-2 space-y-1 text-xs">
                  {node.entries.length === 0 ? (
                    <div className="text-[#6B6B72] text-[10px] italic py-1 text-center">Empty</div>
                  ) : (
                    node.entries.map((entry, idx) => {
                      const entryType = entry.type;
                      let valColor = 'text-green-400';
                      if (entryType === 'number') valColor = 'text-yellow-400';
                      else if (entryType === 'boolean') valColor = 'text-purple-400 font-bold';
                      else if (entryType === 'null') valColor = 'text-gray-500 italic';
                      else if (entryType === 'object') valColor = 'text-cyan-400';
                      else if (entryType === 'array') valColor = 'text-emerald-400';

                      const entryPath =
                        entry.targetNodeId ||
                        (node.path === 'root' ? `root.${entry.key}` : `${node.path}.${entry.key}`);

                      const handleEntryContextMenu = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectPath(entryPath);
                        setContextMenuTarget({
                          x: e.clientX,
                          y: e.clientY,
                          path: entryPath,
                          value: entry.value,
                          keyName: entry.key,
                        });
                      };

                      return (
                        <div
                          key={idx}
                          onContextMenu={handleEntryContextMenu}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPath(entryPath);
                          }}
                          className="flex items-center justify-between gap-2 px-1.5 py-1 rounded hover:bg-[#1C1C1F] group transition-colors text-[11px] cursor-pointer"
                        >
                          <span className="text-gray-300 font-bold truncate max-w-[100px]" title={entry.key}>
                            "{entry.key}"
                          </span>
                          <span className="text-[#6B6B72]">:</span>

                          {entry.isExpandable ? (
                            <span className="text-[#6B6B72] text-[10px] font-semibold bg-[#1C1C1F] px-1.5 py-0.5 rounded">
                              {entryType === 'object'
                                ? `{ ${Object.keys(entry.value || {}).length} keys }`
                                : `[ ${Array.isArray(entry.value) ? entry.value.length : 0} items ]`}
                            </span>
                          ) : (
                            <span className={`truncate max-w-[110px] ${valColor}`} title={String(entry.value)}>
                              {entryType === 'string' ? `"${entry.value}"` : String(entry.value)}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zoom & Floating controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 font-mono">
        <button
          onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.15))}
          className="w-10 h-10 bg-[#1C1C1F] border border-[#2A2A2E] rounded-full flex items-center justify-center text-white hover:border-blue-500 transition-colors shadow-2xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom((prev) => Math.max(0.2, prev - 0.15))}
          className="w-10 h-10 bg-[#1C1C1F] border border-[#2A2A2E] rounded-full flex items-center justify-center text-white hover:border-blue-500 transition-colors shadow-2xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={fitGraphToScreen}
          className="w-10 h-10 bg-[#1C1C1F] border border-[#2A2A2E] rounded-full flex items-center justify-center text-white hover:border-blue-500 transition-colors shadow-2xl"
          title="Fit Graph to View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
