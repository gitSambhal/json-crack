/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

export function jsonToTypeScript(data: any, rootName: string = 'RootObject'): string {
  const interfaces: Map<string, string> = new Map();

  function getType(val: any, parentKey: string): string {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const itemTypes = Array.from(new Set(val.map((item) => getType(item, parentKey + 'Item'))));
      if (itemTypes.length === 1) return `${itemTypes[0]}[]`;
      return `(${itemTypes.join(' | ')})[]`;
    }
    if (typeof val === 'object') {
      const interfaceName = capitalize(parentKey);
      generateInterface(val, interfaceName);
      return interfaceName;
    }
    return typeof val;
  }

  function capitalize(str: string): string {
    if (!str) return 'Object';
    const clean = str.replace(/[^a-zA-Z0-9]/g, '');
    return clean.charAt(0).toUpperCase() + clean.slice(1) || 'Object';
  }

  function generateInterface(obj: Record<string, any>, name: string): void {
    if (interfaces.has(name)) return;

    let code = `export interface ${name} {\n`;
    for (const [key, val] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const propType = getType(val, key);
      code += `  ${safeKey}: ${propType};\n`;
    }
    code += `}\n`;
    interfaces.set(name, code);
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    generateInterface(data, rootName);
  } else if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      generateInterface(data[0], rootName + 'Item');
      return `export type ${rootName} = ${rootName}Item[];\n\n` + Array.from(interfaces.values()).join('\n');
    }
    return `export type ${rootName} = ${getType(data, 'root')};\n`;
  } else {
    return `export type ${rootName} = ${typeof data};\n`;
  }

  return Array.from(interfaces.values()).join('\n');
}

export function jsonToJsonSchema(data: any, title: string = 'Schema'): any {
  function parseSchema(val: any): any {
    if (val === null) return { type: 'null' };
    if (Array.isArray(val)) {
      const itemsSchema = val.length > 0 ? parseSchema(val[0]) : {};
      return {
        type: 'array',
        items: itemsSchema,
      };
    }
    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [k, v] of Object.entries(val)) {
        properties[k] = parseSchema(v);
        required.push(k);
      }

      return {
        type: 'object',
        properties,
        required,
      };
    }
    return { type: typeof val };
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title,
    ...parseSchema(data),
  };
}

export interface ValidationError {
  path: string;
  message: string;
}

export function validateJsonWithSchema(data: any, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  function validate(val: any, sch: any, path: string) {
    if (!sch || typeof sch !== 'object') return;

    if (sch.type) {
      const expectedType = sch.type;
      const actualType = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val;

      if (expectedType === 'integer' && typeof val === 'number' && Number.isInteger(val)) {
        // valid integer
      } else if (actualType !== expectedType) {
        errors.push({
          path,
          message: `Expected type '${expectedType}', got '${actualType}'`,
        });
        return;
      }
    }

    if (sch.type === 'object' && typeof val === 'object' && val !== null) {
      if (sch.required && Array.isArray(sch.required)) {
        sch.required.forEach((reqKey: string) => {
          if (!(reqKey in val)) {
            errors.push({
              path: `${path}.${reqKey}`,
              message: `Missing required property '${reqKey}'`,
            });
          }
        });
      }

      if (sch.properties && typeof sch.properties === 'object') {
        for (const [propKey, propSch] of Object.entries(sch.properties)) {
          if (propKey in val) {
            validate(val[propKey], propSch, `${path}.${propKey}`);
          }
        }
      }
    }

    if (sch.type === 'array' && Array.isArray(val) && sch.items) {
      val.forEach((item, index) => {
        validate(item, sch.items, `${path}[${index}]`);
      });
    }
  }

  validate(data, schema, '$');
  return errors;
}
