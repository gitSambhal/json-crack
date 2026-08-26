/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

export interface JsonQueryResult {
  path: string;
  value: any;
}

export function queryJsonPath(data: any, query: string): JsonQueryResult[] {
  if (!query || !query.trim()) return [];

  let trimmed = query.trim();
  if (!trimmed.startsWith('$')) {
    trimmed = '$' + (trimmed.startsWith('.') || trimmed.startsWith('[') ? '' : '.') + trimmed;
  }

  const results: JsonQueryResult[] = [];

  try {
    // Check for filter expression like $[?(@.price < 10)] or $.items[?(@.status == 'active')]
    const filterMatch = trimmed.match(/^(.*?)\[\?\s*\(\s*@\.([a-zA-Z0-9_]+)\s*(==|!=|>|<|>=|<=)\s*(['"]?)(.*?)\4\s*\)\s*\]$/);

    if (filterMatch) {
      const parentPath = filterMatch[1] || '$';
      const fieldKey = filterMatch[2];
      const operator = filterMatch[3];
      const targetValRaw = filterMatch[5];

      let targetVal: any = targetValRaw;
      if (!isNaN(Number(targetValRaw))) targetVal = Number(targetValRaw);
      if (targetValRaw === 'true') targetVal = true;
      if (targetValRaw === 'false') targetVal = false;

      const parentNodes = evaluatePath(data, parentPath);

      parentNodes.forEach(({ path, value }) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item && typeof item === 'object') {
              const itemVal = item[fieldKey];
              let match = false;
              if (operator === '==') match = itemVal == targetVal;
              else if (operator === '!=') match = itemVal != targetVal;
              else if (operator === '>') match = Number(itemVal) > Number(targetVal);
              else if (operator === '<') match = Number(itemVal) < Number(targetVal);
              else if (operator === '>=') match = Number(itemVal) >= Number(targetVal);
              else if (operator === '<=') match = Number(itemVal) <= Number(targetVal);

              if (match) {
                results.push({ path: `${path}[${index}]`, value: item });
              }
            }
          });
        }
      });

      return results;
    }

    // Check for recursive descent `$..key`
    if (trimmed.includes('..')) {
      const searchKey = trimmed.split('..')[1].replace(/[*[\]]/g, '');
      recursiveFind(data, '$', searchKey, results);
      return results;
    }

    // Standard evaluation
    return evaluatePath(data, trimmed);
  } catch (err) {
    console.error('JSONPath evaluation error:', err);
    return [];
  }
}

function recursiveFind(current: any, currentPath: string, targetKey: string, results: JsonQueryResult[]) {
  if (current === null || typeof current !== 'object') return;

  if (Array.isArray(current)) {
    current.forEach((item, index) => {
      recursiveFind(item, `${currentPath}[${index}]`, targetKey, results);
    });
  } else {
    for (const [key, value] of Object.entries(current)) {
      const p = `${currentPath}.${key}`;
      if (!targetKey || key === targetKey) {
        results.push({ path: p, value });
      }
      recursiveFind(value, p, targetKey, results);
    }
  }
}

function evaluatePath(data: any, pathStr: string): JsonQueryResult[] {
  let segments = pathStr.replace(/^\$\.?,?/, '').split(/\.|\b(?=\[)/).filter(Boolean);
  if (pathStr === '$' || pathStr === '') {
    return [{ path: '$', value: data }];
  }

  let currentQueue: Array<{ path: string; value: any }> = [{ path: '$', value: data }];

  for (const seg of segments) {
    const nextQueue: Array<{ path: string; value: any }> = [];

    const isWildcardArray = seg === '[*]' || seg === '*';
    const indexMatch = seg.match(/^\[(\d+)\]$/);

    for (const item of currentQueue) {
      if (item.value === null || typeof item.value !== 'object') continue;

      if (isWildcardArray) {
        if (Array.isArray(item.value)) {
          item.value.forEach((v, idx) => {
            nextQueue.push({ path: `${item.path}[${idx}]`, value: v });
          });
        } else {
          Object.entries(item.value).forEach(([k, v]) => {
            nextQueue.push({ path: `${item.path}.${k}`, value: v });
          });
        }
      } else if (indexMatch) {
        const idx = parseInt(indexMatch[1], 10);
        if (Array.isArray(item.value) && idx < item.value.length) {
          nextQueue.push({ path: `${item.path}[${idx}]`, value: item.value[idx] });
        }
      } else {
        const cleanKey = seg.replace(/^\[['"]?/, '').replace(/['"]?\]$/, '');
        if (cleanKey in item.value) {
          nextQueue.push({
            path: `${item.path}.${cleanKey}`,
            value: item.value[cleanKey],
          });
        }
      }
    }

    currentQueue = nextQueue;
  }

  return currentQueue;
}
