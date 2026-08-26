/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffItem {
  path: string;
  key: string;
  type: DiffType;
  oldValue?: any;
  newValue?: any;
  children?: DiffItem[];
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  diffs: DiffItem[];
}

export function compareJson(obj1: any, obj2: any, currentPath: string = '$'): DiffSummary {
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;
  const diffs: DiffItem[] = [];

  function isObject(val: any): boolean {
    return val !== null && typeof val === 'object';
  }

  function compareRecursive(val1: any, val2: any, path: string, keyName: string): DiffItem {
    if (val1 === undefined && val2 !== undefined) {
      added++;
      return { path, key: keyName, type: 'added', newValue: val2 };
    }
    if (val1 !== undefined && val2 === undefined) {
      removed++;
      return { path, key: keyName, type: 'removed', oldValue: val1 };
    }

    if (val1 === val2) {
      unchanged++;
      return { path, key: keyName, type: 'unchanged', oldValue: val1, newValue: val2 };
    }

    if (isObject(val1) && isObject(val2)) {
      const keys1 = Object.keys(val1);
      const keys2 = Object.keys(val2);
      const allKeys = Array.from(new Set([...keys1, ...keys2])).sort();

      const children: DiffItem[] = [];
      let childHasDiff = false;

      allKeys.forEach((k) => {
        const childPath = `${path}.${k}`;
        const childDiff = compareRecursive(val1[k], val2[k], childPath, k);
        if (childDiff.type !== 'unchanged') childHasDiff = true;
        children.push(childDiff);
      });

      const parentType: DiffType = childHasDiff ? 'modified' : 'unchanged';
      if (childHasDiff) modified++;
      else unchanged++;

      return {
        path,
        key: keyName,
        type: parentType,
        oldValue: val1,
        newValue: val2,
        children,
      };
    }

    modified++;
    return { path, key: keyName, type: 'modified', oldValue: val1, newValue: val2 };
  }

  if (isObject(obj1) && isObject(obj2)) {
    const rootDiff = compareRecursive(obj1, obj2, currentPath, 'root');
    return {
      added,
      removed,
      modified,
      unchanged,
      diffs: rootDiff.children || [rootDiff],
    };
  } else {
    const rootDiff = compareRecursive(obj1, obj2, currentPath, 'root');
    return {
      added,
      removed,
      modified,
      unchanged,
      diffs: [rootDiff],
    };
  }
}
