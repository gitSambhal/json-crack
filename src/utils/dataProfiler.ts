/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

export interface FieldProfile {
  key: string;
  count: number;
  types: Record<string, number>;
  sampleValues: any[];
  nullCount: number;
  distinctCount: number;
  min?: number;
  max?: number;
  avgLength?: number;
}

export interface ProfileSummary {
  totalRecords: number;
  totalKeys: number;
  maxDepth: number;
  fields: FieldProfile[];
  typeCounts: {
    string: number;
    number: number;
    boolean: number;
    object: number;
    array: number;
    null: number;
  };
}

export function generateDataProfile(data: any): ProfileSummary {
  const typeCounts = {
    string: 0,
    number: 0,
    boolean: 0,
    object: 0,
    array: 0,
    null: 0,
  };

  let maxDepth = 0;
  const fieldMap: Map<string, {
    count: number;
    types: Record<string, number>;
    values: Set<any>;
    samples: any[];
    nullCount: number;
    numbers: number[];
    stringLengths: number[];
  }> = new Map();

  let totalRecords = 0;

  function traverse(val: any, currentDepth: number, currentPath: string) {
    if (currentDepth > maxDepth) maxDepth = currentDepth;

    if (val === null) {
      typeCounts.null++;
      return;
    }

    if (Array.isArray(val)) {
      typeCounts.array++;
      val.forEach((item, index) => traverse(item, currentDepth + 1, `${currentPath}[${index}]`));
      return;
    }

    const valType = typeof val;
    if (valType === 'string') {
      typeCounts.string++;
    } else if (valType === 'number') {
      typeCounts.number++;
    } else if (valType === 'boolean') {
      typeCounts.boolean++;
    } else if (valType === 'object') {
      typeCounts.object++;
      for (const [k, v] of Object.entries(val)) {
        const fieldKey = currentPath ? `${currentPath}.${k}` : k;

        if (!fieldMap.has(fieldKey)) {
          fieldMap.set(fieldKey, {
            count: 0,
            types: {},
            values: new Set(),
            samples: [],
            nullCount: 0,
            numbers: [],
            stringLengths: [],
          });
        }

        const info = fieldMap.get(fieldKey)!;
        info.count++;

        const childType = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
        info.types[childType] = (info.types[childType] || 0) + 1;

        if (v === null) info.nullCount++;
        else {
          info.values.add(v);
          if (info.samples.length < 5) info.samples.push(v);
          if (typeof v === 'number') info.numbers.push(v);
          if (typeof v === 'string') info.stringLengths.push(v.length);
        }

        traverse(v, currentDepth + 1, fieldKey);
      }
    }
  }

  if (Array.isArray(data)) {
    totalRecords = data.length;
    data.forEach((item, idx) => traverse(item, 1, ''));
  } else if (typeof data === 'object' && data !== null) {
    totalRecords = 1;
    traverse(data, 1, '');
  }

  const fields: FieldProfile[] = Array.from(fieldMap.entries()).map(([key, info]) => {
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;
    let avgLength: number | undefined = undefined;

    if (info.numbers.length > 0) {
      min = Math.min(...info.numbers);
      max = Math.max(...info.numbers);
    }
    if (info.stringLengths.length > 0) {
      avgLength = Math.round(
        info.stringLengths.reduce((a, b) => a + b, 0) / info.stringLengths.length
      );
    }

    return {
      key,
      count: info.count,
      types: info.types,
      sampleValues: info.samples,
      nullCount: info.nullCount,
      distinctCount: info.values.size,
      min,
      max,
      avgLength,
    };
  });

  return {
    totalRecords,
    totalKeys: fields.length,
    maxDepth,
    fields,
    typeCounts,
  };
}

export function extractTableData(data: any): { columns: string[]; rows: any[] } {
  if (!data) return { columns: [], rows: [] };

  let arr: any[] = [];
  if (Array.isArray(data)) {
    arr = data;
  } else if (typeof data === 'object') {
    // If object contains array property, use the first array property, otherwise wrap object
    const firstArrayProp = Object.values(data).find((val) => Array.isArray(val));
    if (firstArrayProp && Array.isArray(firstArrayProp)) {
      arr = firstArrayProp;
    } else {
      arr = [data];
    }
  }

  if (arr.length === 0) return { columns: [], rows: [] };

  const columnsSet = new Set<string>();

  arr.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((k) => columnsSet.add(k));
    }
  });

  const columns = Array.from(columnsSet);
  const rows = arr.map((item, idx) => {
    if (item && typeof item === 'object') {
      return { _id: idx, ...item };
    }
    return { _id: idx, value: item };
  });

  if (columns.length === 0) {
    return { columns: ['value'], rows };
  }

  return { columns, rows };
}
