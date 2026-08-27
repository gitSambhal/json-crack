/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import { NodeType } from '../types/json';
import { getNodeType } from './jsonParser';

export interface PropertyInfo {
  name: string;
  count: number;
  types: Set<NodeType>;
  sampleValue?: any;
  paths: string[];
}

export interface PropertyFilterConfig {
  hiddenKeys: Set<string>;
  hideNulls: boolean;
  hideEmpty: boolean;
  customHiddenPaths?: Set<string>;
}

export const DEFAULT_PROPERTY_FILTER: PropertyFilterConfig = {
  hiddenKeys: new Set<string>(),
  hideNulls: false,
  hideEmpty: false,
};

/**
 * Counts total active filter rules
 */
export function countActiveFilterRules(config?: PropertyFilterConfig): number {
  if (!config) return 0;
  let count = config.hiddenKeys?.size || 0;
  if (config.hideNulls) count += 1;
  if (config.hideEmpty) count += 1;
  if (config.customHiddenPaths) count += config.customHiddenPaths.size;
  return count;
}

const COMMON_NOISE_KEYS = new Set([
  '_id',
  'id',
  '__v',
  'uuid',
  'guid',
  'etag',
  'hash',
  'token',
  'timestamp',
  'created_at',
  'updated_at',
  'createdAt',
  'updatedAt',
  'deleted_at',
  'deletedAt',
  'checksum',
  '__typename',
]);

/**
 * Checks if a key name is considered a typical metadata/system noise property
 */
export function isCommonNoiseKey(keyName: string): boolean {
  const lower = keyName.toLowerCase();
  if (COMMON_NOISE_KEYS.has(keyName) || COMMON_NOISE_KEYS.has(lower)) return true;
  if (lower.startsWith('__') || lower.endsWith('_id') || lower.endsWith('id') && keyName.length <= 6) return true;
  if (lower.includes('timestamp') || lower.includes('createdat') || lower.includes('updatedat')) return true;
  return false;
}

/**
 * Traverses any JSON data and aggregates all unique property keys
 */
export function extractAllProperties(data: any): PropertyInfo[] {
  const propMap = new Map<string, PropertyInfo>();
  const visited = new Set<any>();

  function traverse(val: any, currentPath: string) {
    if (!val || typeof val !== 'object') return;
    if (visited.has(val)) return;
    visited.add(val);

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else {
      Object.entries(val).forEach(([key, childVal]) => {
        const childPath = currentPath === 'root' ? `root.${key}` : `${currentPath}.${key}`;
        const valType = getNodeType(childVal);

        if (!propMap.has(key)) {
          propMap.set(key, {
            name: key,
            count: 0,
            types: new Set<NodeType>(),
            sampleValue: childVal,
            paths: [],
          });
        }

        const info = propMap.get(key)!;
        info.count += 1;
        info.types.add(valType);
        if (info.paths.length < 50) {
          info.paths.push(childPath);
        }
        if (info.sampleValue === undefined && childVal !== undefined) {
          info.sampleValue = childVal;
        }

        traverse(childVal, childPath);
      });
    }
  }

  traverse(data, 'root');

  return Array.from(propMap.values()).sort((a, b) => {
    // Sort by count descending, then alphabetically
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Recursively filters JSON data based on hidden property keys, nulls, and empty values
 */
export function filterJsonByProperties(
  data: any,
  config?: PropertyFilterConfig
): any {
  if (!config) return data;
  const hiddenKeys = config.hiddenKeys || new Set<string>();
  const hideNulls = Boolean(config.hideNulls);
  const hideEmpty = Boolean(config.hideEmpty);
  const customHiddenPaths = config.customHiddenPaths;

  if (hiddenKeys.size === 0 && !hideNulls && !hideEmpty && (!customHiddenPaths || customHiddenPaths.size === 0)) {
    return data;
  }

  function traverse(val: any, path: string): any {
    if (val === null || val === undefined) {
      return val;
    }

    if (Array.isArray(val)) {
      const filteredArray: any[] = [];
      val.forEach((item, idx) => {
        const itemPath = `${path}[${idx}]`;
        if (customHiddenPaths && customHiddenPaths.has(itemPath)) {
          return;
        }
        const filteredItem = traverse(item, itemPath);

        if (hideNulls && (filteredItem === null || filteredItem === undefined)) {
          return;
        }

        if (hideEmpty) {
          if (filteredItem === '') return;
          if (Array.isArray(filteredItem) && filteredItem.length === 0) return;
          if (typeof filteredItem === 'object' && filteredItem !== null && Object.keys(filteredItem).length === 0) return;
        }

        filteredArray.push(filteredItem);
      });
      return filteredArray;
    }

    if (typeof val === 'object') {
      const filteredObj: Record<string, any> = {};

      Object.entries(val).forEach(([key, childVal]) => {
        // Check if key is hidden
        if (hiddenKeys.has(key)) {
          return;
        }

        const childPath = path === 'root' ? `root.${key}` : `${path}.${key}`;
        if (customHiddenPaths && customHiddenPaths.has(childPath)) {
          return;
        }

        if (hideNulls && (childVal === null || childVal === undefined)) {
          return;
        }

        const filteredChild = traverse(childVal, childPath);

        if (hideNulls && (filteredChild === null || filteredChild === undefined)) {
          return;
        }

        if (hideEmpty) {
          if (filteredChild === '') return;
          if (Array.isArray(filteredChild) && filteredChild.length === 0) return;
          if (typeof filteredChild === 'object' && filteredChild !== null && Object.keys(filteredChild).length === 0) return;
        }

        filteredObj[key] = filteredChild;
      });

      return filteredObj;
    }

    return val;
  }

  return traverse(data, 'root');
}
