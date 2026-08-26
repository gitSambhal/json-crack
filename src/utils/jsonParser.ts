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
 * Parses CSV/TSV format into JSON objects (e.g. NetflixViewingHistory.csv)
 */
export function parseCsvToJson(csvText: string): any[] | null {
  const clean = csvText.replace(/^\uFEFF/, '').trim();
  if (!clean) return null;
  const lines = clean.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return null;

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
    delimiter = ';';
  }

  const parseRow = (rowStr: string): string[] => {
    const res: string[] = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"' || char === "'") {
        if (inQuotes && rowStr[i + 1] === char) {
          curr += char;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        res.push(curr.trim());
        curr = '';
      } else {
        curr += char;
      }
    }
    res.push(curr.trim());
    return res;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  if (headers.length === 0 || headers.every((h) => !h)) return null;

  const results: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]).map((v) => v.replace(/^["']|["']$/g, '').trim());
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const item: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const key = h || `field_${idx + 1}`;
      const val = values[idx] !== undefined ? values[idx] : '';
      if (val.toLowerCase() === 'true') item[key] = true;
      else if (val.toLowerCase() === 'false') item[key] = false;
      else if (val !== '' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/')) {
        item[key] = Number(val);
      } else {
        item[key] = val;
      }
    });
    results.push(item);
  }

  return results.length > 0 ? results : null;
}

/**
 * Parses relaxed JSON formats (trailing commas, single quotes, comments, JSONP callbacks)
 */
export function parseRelaxedJson(raw: string): any {
  let cleaned = raw.replace(/^\uFEFF/, '').trim();

  // Strip JSONP wrapper (e.g. netflixCallback({...}) or callback({...}))
  const jsonpMatch = cleaned.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(\s*([\s\S]*)\s*\)\s*;?$/);
  if (jsonpMatch && jsonpMatch[1]) {
    cleaned = jsonpMatch[1].trim();
  }

  // Strip comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\r\n]*/g, '$1');

  // Try standard parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    let transformed = cleaned
      .replace(/:\s*True\b/g, ': true')
      .replace(/:\s*False\b/g, ': false')
      .replace(/:\s*None\b/g, ': null')
      .replace(/,\s*([\]}])/g, '$1');

    try {
      return JSON.parse(transformed);
    } catch (e2) {
      try {
        const fn = new Function(`"use strict"; return (${transformed});`);
        const res = fn();
        if (res !== undefined) return res;
      } catch (e3) {
        throw e1;
      }
    }
  }
}

/**
 * Omnivorous parser for JSON, CSV, JSONP, or lenient JSON
 */
export function parseAnyInputToJson(
  raw: string,
  filename?: string
): { data: any; format: 'json' | 'csv' | 'relaxed-json'; error?: string } {
  const isCsvFile = filename && (filename.toLowerCase().endsWith('.csv') || filename.toLowerCase().endsWith('.tsv'));

  if (isCsvFile) {
    const csvData = parseCsvToJson(raw);
    if (csvData) {
      return { data: csvData, format: 'csv' };
    }
  }

  // Try standard / relaxed JSON first
  try {
    const jsonData = parseRelaxedJson(raw);
    return { data: jsonData, format: 'json' };
  } catch (jsonErr: any) {
    // Check if input is CSV format
    const csvData = parseCsvToJson(raw);
    if (csvData && csvData.length > 0) {
      return { data: csvData, format: 'csv' };
    }
    return { data: null, format: 'json', error: jsonErr.message || 'Invalid JSON format' };
  }
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
  const MAX_ARRAY_ENTRIES_SHOWN = 30;
  const MAX_TOTAL_GRAPH_NODES = 250;

  // Track Y position at each level column to stack nodes cleanly
  const levelYMap: { [level: number]: number } = {};

  function buildGraphNode(
    val: any,
    path: string,
    label: string,
    level: number,
    parentPath?: string
  ): string {
    if (nodes.length >= MAX_TOTAL_GRAPH_NODES) {
      return path;
    }

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
      const slice = val.slice(0, MAX_ARRAY_ENTRIES_SHOWN);
      slice.forEach((item, idx) => {
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

      if (val.length > MAX_ARRAY_ENTRIES_SHOWN) {
        entries.push({
          key: `... +${val.length - MAX_ARRAY_ENTRIES_SHOWN} more items`,
          value: 'Switch to Grid View for all records',
          type: 'string',
          isExpandable: false,
        });
      }
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
    if (!isCollapsed && nodes.length < MAX_TOTAL_GRAPH_NODES) {
      entries.forEach((entry, idx) => {
        if (entry.isExpandable && entry.targetNodeId && nodes.length < MAX_TOTAL_GRAPH_NODES) {
          const childId = buildGraphNode(
            entry.value,
            entry.targetNodeId,
            entry.key,
            level + 1,
            nodeId
          );

          // Find source connection y coordinate
          const sourceY = y + headerHeight + idx * entryHeight + entryHeight / 2;
          const targetY = (levelYMap[level + 1] || 40) - height / 2;

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
