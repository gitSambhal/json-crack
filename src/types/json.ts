/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue; }
export type JsonArray = JsonValue[];

export type NodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface ParsedFile {
  id: string;
  name: string;
  sizeFormatted: string;
  byteSize: number;
  content: string;
  data: any;
  isValid: boolean;
  error: string | null;
  lastModified: number;
  isPreset?: boolean;
}

export interface SearchResult {
  id: string;
  path: string; // e.g., $.metadata.auth_provider.type
  key: string;
  value: any;
  type: NodeType;
  matchType: 'key' | 'value' | 'path';
  line?: number;
}

export interface SearchFilterState {
  query: string;
  caseSensitive: boolean;
  useRegex: boolean;
  typeFilter: NodeType | 'all';
  searchTarget: 'all' | 'keys' | 'values' | 'paths';
}

export interface GraphEntry {
  key: string;
  value: any;
  type: NodeType;
  targetNodeId?: string;
  isExpandable: boolean;
}

export interface GraphNode {
  id: string;
  path: string; // e.g., root.metadata
  label: string;
  type: NodeType;
  entries: GraphEntry[];
  collapsed: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  parentPath?: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceKey: string;
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
}

export interface JsonStats {
  byteSize: number;
  formattedSize: string;
  totalNodes: number;
  maxDepth: number;
  objectCount: number;
  arrayCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

export type ViewMode = 'graph' | 'tree' | 'code' | 'table';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export type ThemeMode = 'geometric-dark' | 'cyber-neon' | 'clean-light' | 'blueprint';
