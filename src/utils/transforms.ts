/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

// Simple JSON to YAML Converter
export function jsonToYaml(obj: any, indent: number = 0): string {
  const spacing = ' '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes('"') || obj.includes("'") || obj.includes(':')) {
      return JSON.stringify(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const formatted = jsonToYaml(item, indent + 2).trimStart();
          return `${spacing}- ${formatted}`;
        }
        return `${spacing}- ${jsonToYaml(item, indent + 2)}`;
      })
      .join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return (
      (indent > 0 ? '\n' : '') +
      keys
        .map((key) => {
          const val = obj[key];
          const valStr = jsonToYaml(val, indent + 2);
          if (typeof val === 'object' && val !== null) {
            return `${spacing}${key}:${valStr}`;
          }
          return `${spacing}${key}: ${valStr}`;
        })
        .join('\n')
    );
  }

  return String(obj);
}

// Simple JSON to XML Converter
export function jsonToXml(obj: any, rootTag: string = 'root'): string {
  function toXml(val: any, tag: string): string {
    if (val === null) return `<${tag}/>`;
    if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
      const escaped = String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<${tag}>${escaped}</${tag}>`;
    }
    if (Array.isArray(val)) {
      return val.map((item) => toXml(item, tag.endsWith('s') ? tag.slice(0, -1) : 'item')).join('\n');
    }
    if (typeof val === 'object') {
      const children = Object.entries(val)
        .map(([k, v]) => toXml(v, k))
        .join('\n');
      return `<${tag}>\n${children}\n</${tag}>`;
    }
    return `<${tag}>${val}</${tag}>`;
  }

  return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(obj, rootTag);
}

// Simple JSON to TOML Converter
export function jsonToToml(obj: any, section: string = ''): string {
  if (typeof obj !== 'object' || obj === null) return '';

  let toml = '';
  const primitives: Record<string, any> = {};
  const tables: Record<string, any> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      tables[key] = val;
    } else {
      primitives[key] = val;
    }
  }

  if (section) {
    toml += `[${section}]\n`;
  }

  for (const [k, v] of Object.entries(primitives)) {
    if (typeof v === 'string') toml += `${k} = "${v.replace(/"/g, '\\"')}"\n`;
    else if (typeof v === 'boolean' || typeof v === 'number') toml += `${k} = ${v}\n`;
    else if (Array.isArray(v)) toml += `${k} = ${JSON.stringify(v)}\n`;
    else if (v === null) toml += `${k} = null\n`;
  }

  for (const [k, v] of Object.entries(tables)) {
    toml += '\n' + jsonToToml(v, section ? `${section}.${k}` : k);
  }

  return toml.trim();
}

// JSON to SQL INSERT statements
export function jsonToSqlInsert(data: any, tableName: string = 'my_table'): string {
  let rows: any[] = [];
  if (Array.isArray(data)) rows = data;
  else if (typeof data === 'object' && data !== null) rows = [data];

  if (rows.length === 0) return `-- No data available for SQL INSERT`;

  const keys = Array.from(
    new Set(rows.flatMap((r) => (typeof r === 'object' && r !== null ? Object.keys(r) : [])))
  );

  if (keys.length === 0) return `-- No object keys found for SQL INSERT`;

  const columnsStr = keys.map((k) => `\`${k}\``).join(', ');

  const valuesLines = rows
    .map((row) => {
      const vals = keys.map((k) => {
        const v = row[k];
        if (v === undefined || v === null) return 'NULL';
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    })
    .join(',\n');

  return `INSERT INTO \`${tableName}\` (${columnsStr}) VALUES\n${valuesLines};`;
}

// Convert object key casings
export type CaseMode = 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase';

export function convertKeyCases(data: any, mode: CaseMode): any {
  if (data === null || typeof data !== 'object') return data;

  function transformKey(key: string): string {
    const words = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .trim()
      .split(/\s+/);

    if (mode === 'camelCase') {
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    if (mode === 'snake_case') {
      return words.map((w) => w.toLowerCase()).join('_');
    }
    if (mode === 'kebab-case') {
      return words.map((w) => w.toLowerCase()).join('-');
    }
    if (mode === 'PascalCase') {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    return key;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertKeyCases(item, mode));
  }

  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    const newKey = transformKey(k);
    result[newKey] = convertKeyCases(v, mode);
  }
  return result;
}

// Obfuscate / Anonymize sensitive fields
export function anonymizeSensitiveData(data: any): any {
  if (data === null || typeof data !== 'object') return data;

  const sensitiveKeysRegex = /email|password|token|secret|auth|ssn|credit|card|phone|mobile|address|name|key/i;

  function maskValue(key: string, value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean' || typeof value === 'number') {
      return typeof value === 'number' ? Math.floor(Math.random() * 9000) + 1000 : value;
    }
    if (typeof value === 'string') {
      if (/email/i.test(key)) return `user_${Math.random().toString(36).substring(2, 7)}@anonymized.com`;
      if (/password|secret|token|auth|key/i.test(key)) return `[REDACTED_HASH_${Math.random().toString(36).substring(2, 8)}]`;
      if (/phone|mobile/i.test(key)) return `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      if (/name/i.test(key)) return `User_${Math.random().toString(36).substring(2, 6)}`;
      return `[ANONYMIZED_${value.length}_CHARS]`;
    }
    return value;
  }

  if (Array.isArray(data)) {
    return data.map((item) => anonymizeSensitiveData(item));
  }

  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeysRegex.test(k) && (typeof v !== 'object' || v === null)) {
      result[k] = maskValue(k, v);
    } else {
      result[k] = anonymizeSensitiveData(v);
    }
  }
  return result;
}
