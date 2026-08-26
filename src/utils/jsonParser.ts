/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import {
  NodeType,
  JsonStats,
  SearchResult,
  SearchFilterState,
  GraphNode,
  GraphEdge,
  GraphEntry
} from '../types/json';

export function getNodeType(val: any): NodeType {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  const t = typeof val;
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  if (t === 'object') return 'object';
  return 'null';
}

export function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateStats(data: any, byteSize: number): JsonStats {
  const stats: JsonStats = {
    byteSize,
    formattedSize: formatByteSize(byteSize),
    totalNodes: 0,
    maxDepth: 0,
    objectCount: 0,
    arrayCount: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
  };

  function traverse(node: any, currentDepth: number) {
    stats.totalNodes++;
    if (currentDepth > stats.maxDepth) {
      stats.maxDepth = currentDepth;
    }

    const type = getNodeType(node);
    if (type === 'object') {
      stats.objectCount++;
      if (node) {
        Object.values(node).forEach((val) => traverse(val, currentDepth + 1));
      }
    } else if (type === 'array') {
      stats.arrayCount++;
      if (Array.isArray(node)) {
        node.forEach((val) => traverse(val, currentDepth + 1));
      }
    } else if (type === 'string') {
      stats.stringCount++;
    } else if (type === 'number') {
      stats.numberCount++;
    } else if (type === 'boolean') {
      stats.booleanCount++;
    } else if (type === 'null') {
      stats.nullCount++;
    }
  }

  traverse(data, 1);
  return stats;
}

export function searchJson(data: any, filter: SearchFilterState): SearchResult[] {
  if (!filter.query || filter.query.trim() === '') return [];

  const results: SearchResult[] = [];
  const query = filter.caseSensitive ? filter.query.trim() : filter.query.trim().toLowerCase();

  let regex: RegExp | null = null;
  if (filter.useRegex) {
    try {
      regex = new RegExp(filter.query.trim(), filter.caseSensitive ? '' : 'i');
    } catch {
      regex = null;
    }
  }

  function matchesText(text: string): boolean {
    if (regex) {
      return regex.test(text);
    }
    const target = filter.caseSensitive ? text : text.toLowerCase();
    return target.includes(query);
  }

  function traverse(current: any, currentPath: string, keyName: string) {
    const type = getNodeType(current);

    // Check Type Filter
    if (filter.typeFilter !== 'all' && type !== filter.typeFilter) {
      // Continue searching children even if parent doesn't match type
    } else {
      let isMatch = false;
      let matchType: 'key' | 'value' | 'path' = 'value';

      // Path check
      if ((filter.searchTarget === 'all' || filter.searchTarget === 'paths') && matchesText(currentPath)) {
        isMatch = true;
        matchType = 'path';
      }
      // Key check
      else if ((filter.searchTarget === 'all' || filter.searchTarget === 'keys') && keyName && matchesText(keyName)) {
        isMatch = true;
        matchType = 'key';
      }
      // Value check
      else if (filter.searchTarget === 'all' || filter.searchTarget === 'values') {
        if (type === 'string' && matchesText(String(current))) {
          isMatch = true;
          matchType = 'value';
        } else if ((type === 'number' || type === 'boolean') && matchesText(String(current))) {
          isMatch = true;
          matchType = 'value';
        }
      }

      if (isMatch) {
        results.push({
          id: `${currentPath}-${results.length}`,
          path: currentPath,
          key: keyName || 'root',
          value: current,
          type,
          matchType,
        });
      }
    }

    // Traverse children
    if (type === 'object' && current) {
      Object.entries(current).forEach(([k, val]) => {
        const nextPath = currentPath === '$' ? `$.${k}` : `${currentPath}.${k}`;
        traverse(val, nextPath, k);
      });
    } else if (type === 'array' && Array.isArray(current)) {
      current.forEach((val, index) => {
        const nextPath = `${currentPath}[${index}]`;
        traverse(val, nextPath, `[${index}]`);
      });
    }
  }

  traverse(data, '$', '');
  return results.slice(0, 500); // cap search results to 500 for high UI performance
}

/**
 * Calculates graph node layout for JSON Crack style view
 */
export function generateGraphLayout(
  data: any,
  collapsedPaths: Set<string>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const NODE_WIDTH = 260;
  const LEVEL_SPACING = 340;
  const NODE_GAP_Y = 24;

  let nodeCounter = 0;
  // Track Y position at each level column to stack nodes cleanly
  const levelYMap: { [level: number]: number } = {};

  function buildGraphNode(
    val: any,
    path: string,
    label: string,
    level: number,
    parentPath?: string
  ): string {
    const type = getNodeType(val);
    const nodeId = path;

    if (!levelYMap[level]) levelYMap[level] = 40;

    const entries: GraphEntry[] = [];

    if (type === 'object' && val) {
      Object.entries(val).forEach(([k, v]) => {
        const vType = getNodeType(v);
        const childPath = path === 'root' ? `root.${k}` : `${path}.${k}`;
        const isExpandable = vType === 'object' || vType === 'array';
        entries.push({
          key: k,
          value: v,
          type: vType,
          targetNodeId: isExpandable ? childPath : undefined,
          isExpandable,
        });
      });
    } else if (type === 'array' && Array.isArray(val)) {
      val.forEach((item, idx) => {
        const iType = getNodeType(item);
        const childPath = `${path}[${idx}]`;
        const isExpandable = iType === 'object' || iType === 'array';
        entries.push({
          key: `[${idx}]`,
          value: item,
          type: iType,
          targetNodeId: isExpandable ? childPath : undefined,
          isExpandable,
        });
      });
    } else {
      entries.push({
        key: 'value',
        value: val,
        type,
        isExpandable: false,
      });
    }

    const headerHeight = 44;
    const entryHeight = 28;
    const height = Math.max(70, headerHeight + entries.length * entryHeight + 12);

    const x = level * LEVEL_SPACING + 40;
    const y = levelYMap[level];

    levelYMap[level] += height + NODE_GAP_Y;

    const isCollapsed = collapsedPaths.has(path);

    const graphNode: GraphNode = {
      id: nodeId,
      path,
      label,
      type,
      entries,
      collapsed: isCollapsed,
      x,
      y,
      width: NODE_WIDTH,
      height,
      level,
      parentPath,
    };

    nodes.push(graphNode);

    // If not collapsed, recurse into children
    if (!isCollapsed) {
      entries.forEach((entry, idx) => {
        if (entry.isExpandable && entry.targetNodeId) {
          const childId = buildGraphNode(
            entry.value,
            entry.targetNodeId,
            entry.key,
            level + 1,
            nodeId
          );

          // Find source connection y coordinate
          const sourceY = y + headerHeight + idx * entryHeight + entryHeight / 2;
          const targetY = (levelYMap[level + 1] || 40) - height / 2; // rough target

          edges.push({
            id: `e-${nodeId}-${idx}-${childId}`,
            sourceId: nodeId,
            targetId: childId,
            sourceKey: entry.key,
            sourcePoint: { x: x + NODE_WIDTH, y: sourceY },
            targetPoint: { x: (level + 1) * LEVEL_SPACING + 40, y: targetY },
          });
        }
      });
    }

    return nodeId;
  }

  buildGraphNode(data, 'root', 'JSON Root', 0);

  // Re-adjust edge target y positions to match exact calculated child node centers
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  edges.forEach((edge) => {
    const targetNode = nodeMap.get(edge.targetId);
    if (targetNode) {
      edge.targetPoint = {
        x: targetNode.x,
        y: targetNode.y + 22, // target node header center
      };
    }
  });

  return { nodes, edges };
}

export type SortMode =
  | 'asc'
  | 'desc'
  | 'key-length-asc'
  | 'key-length-desc'
  | 'type'
  | 'reverse';

export function sortJsonData(
  data: any,
  mode: SortMode = 'asc',
  arraySortKey?: string
): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    let sortedArray = data.map((item) => sortJsonData(item, mode, arraySortKey));

    if (mode === 'reverse') {
      return sortedArray.slice().reverse();
    }

    if (mode === 'asc' || mode === 'desc') {
      const isAsc = mode === 'asc';
      sortedArray = sortedArray.slice().sort((a, b) => {
        if (
          arraySortKey &&
          typeof a === 'object' &&
          a !== null &&
          typeof b === 'object' &&
          b !== null
        ) {
          const valA = a[arraySortKey];
          const valB = b[arraySortKey];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          return isAsc
            ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
            : String(valB).localeCompare(String(valA), undefined, { numeric: true });
        }
        if (typeof a !== 'object' && typeof b !== 'object') {
          if (typeof a === 'number' && typeof b === 'number') {
            return isAsc ? a - b : b - a;
          }
          return isAsc
            ? String(a).localeCompare(String(b), undefined, { numeric: true })
            : String(b).localeCompare(String(a), undefined, { numeric: true });
        }
        return 0;
      });
    }

    return sortedArray;
  }

  let keys = Object.keys(data);

  if (mode === 'asc') {
    keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } else if (mode === 'desc') {
    keys.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } else if (mode === 'key-length-asc') {
    keys.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (mode === 'key-length-desc') {
    keys.sort((a, b) => b.length - a.length || a.localeCompare(b));
  } else if (mode === 'type') {
    const getTypeOrder = (val: any) => {
      if (val === null || typeof val !== 'object') return 1;
      if (Array.isArray(val)) return 2;
      return 3;
    };
    keys.sort((a, b) => {
      const typeA = getTypeOrder(data[a]);
      const typeB = getTypeOrder(data[b]);
      if (typeA !== typeB) return typeA - typeB;
      return a.localeCompare(b);
    });
  } else if (mode === 'reverse') {
    keys.reverse();
  }

  const result: Record<string, any> = {};
  keys.forEach((key) => {
    result[key] = sortJsonData(data[key], mode, arraySortKey);
  });

  return result;
}

export function getPathValue(data: any, path: string): any {
  if (path === '$' || path === 'root' || !path) return data;
  let cleanPath = path;
  if (cleanPath.startsWith('$.')) cleanPath = cleanPath.slice(2);
  else if (cleanPath.startsWith('root.')) cleanPath = cleanPath.slice(5);
  else if (cleanPath.startsWith('$')) cleanPath = cleanPath.slice(1);
  else if (cleanPath.startsWith('root')) cleanPath = cleanPath.slice(4);

  const parts = cleanPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let curr = data;
  for (const p of parts) {
    if (curr === undefined || curr === null) return undefined;
    curr = curr[p];
  }
  return curr;
}

export function updatePathValue(data: any, path: string, newValue: any): any {
  if (path === '$' || path === 'root' || !path) return newValue;

  const copy = JSON.parse(JSON.stringify(data));
  let cleanPath = path;
  if (cleanPath.startsWith('$.')) cleanPath = cleanPath.slice(2);
  else if (cleanPath.startsWith('root.')) cleanPath = cleanPath.slice(5);

  const parts = cleanPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let curr = copy;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in curr)) curr[p] = {};
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = newValue;
  return copy;
}

export function deletePathKey(data: any, path: string): any {
  if (path === '$' || path === 'root' || !path) return null;

  const copy = JSON.parse(JSON.stringify(data));
  let cleanPath = path;
  if (cleanPath.startsWith('$.')) cleanPath = cleanPath.slice(2);
  else if (cleanPath.startsWith('root.')) cleanPath = cleanPath.slice(5);

  const parts = cleanPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let curr = copy;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in curr)) return copy;
    curr = curr[p];
  }
  const lastPart = parts[parts.length - 1];
  if (Array.isArray(curr)) {
    curr.splice(Number(lastPart), 1);
  } else if (typeof curr === 'object' && curr !== null) {
    delete curr[lastPart];
  }
  return copy;
}
