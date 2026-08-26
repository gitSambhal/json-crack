/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { ParsedFile } from '../types/json';

export const PRESET_FILES: ParsedFile[] = [
  {
    id: 'preset-production',
    name: 'production.json',
    byteSize: 1450,
    sizeFormatted: '1.45 KB',
    isPreset: true,
    isValid: true,
    error: null,
    lastModified: Date.now(),
    content: JSON.stringify(
      {
        project_id: "PRJ-99021",
        version: "v2.4.0",
        environment: "production",
        is_deployed: true,
        metadata: {
          auth_provider: {
            type: "OAuth2",
            endpoint: "https://api.auth.internal/v1",
            is_active: true,
            retry_count: 3,
            scopes: ["read:users", "write:logs", "admin:all"]
          },
          analytics_meta: {
            enabled: true,
            sample_rate: 0.05,
            providers: ["mixpanel", "datadog"]
          }
        },
        user_list: [
          {
            id: 101,
            name: "Suhail Akhtar",
            role: "lead_engineer",
            verified: true,
            permissions: ["create", "edit", "delete", "deploy"],
            settings: { theme: "dark", notifications: true }
          },
          {
            id: 102,
            name: "Elena Rostova",
            role: "ui_designer",
            verified: true,
            permissions: ["create", "edit"],
            settings: { theme: "light", notifications: false }
          },
          {
            id: 103,
            name: "Marcus Vance",
            role: "devops_architect",
            verified: true,
            permissions: ["admin", "infra"],
            settings: { theme: "system", notifications: true }
          }
        ],
        infrastructure: {
          cluster: "us-central1-gcp",
          nodes: 12,
          load_balancer: {
            type: "nginx",
            ssl_enabled: true,
            port: 3000
          }
        }
      },
      null,
      2
    ),
    data: {
      project_id: "PRJ-99021",
      version: "v2.4.0",
      environment: "production",
      is_deployed: true,
      metadata: {
        auth_provider: {
          type: "OAuth2",
          endpoint: "https://api.auth.internal/v1",
          is_active: true,
          retry_count: 3,
          scopes: ["read:users", "write:logs", "admin:all"]
        },
        analytics_meta: {
          enabled: true,
          sample_rate: 0.05,
          providers: ["mixpanel", "datadog"]
        }
      },
      user_list: [
        {
          id: 101,
          name: "Suhail Akhtar",
          role: "lead_engineer",
          verified: true,
          permissions: ["create", "edit", "delete", "deploy"],
          settings: { theme: "dark", notifications: true }
        },
        {
          id: 102,
          name: "Elena Rostova",
          role: "ui_designer",
          verified: true,
          permissions: ["create", "edit"],
          settings: { theme: "light", notifications: false }
        },
        {
          id: 103,
          name: "Marcus Vance",
          role: "devops_architect",
          verified: true,
          permissions: ["admin", "infra"],
          settings: { theme: "system", notifications: true }
        }
      ],
      infrastructure: {
        cluster: "us-central1-gcp",
        nodes: 12,
        load_balancer: {
          type: "nginx",
          ssl_enabled: true,
          port: 3000
        }
      }
    }
  },
  {
    id: 'preset-schema',
    name: 'schema_v2.json',
    byteSize: 980,
    sizeFormatted: '980 B',
    isPreset: true,
    isValid: true,
    error: null,
    lastModified: Date.now() - 3600000,
    content: JSON.stringify(
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "UserProfile",
        type: "object",
        required: ["id", "username", "email", "created_at"],
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string", minLength: 3, maxLength: 30 },
          email: { type: "string", format: "email" },
          age: { type: "integer", minimum: 18, maximum: 120 },
          is_active: { type: "boolean", default: true },
          tags: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true
          },
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
              country: { type: "string" },
              postal_code: { type: "string" }
            }
          }
        }
      },
      null,
      2
    ),
    data: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "UserProfile",
      type: "object",
      required: ["id", "username", "email", "created_at"],
      properties: {
        id: { type: "string", format: "uuid" },
        username: { type: "string", minLength: 3, maxLength: 30 },
        email: { type: "string", format: "email" },
        age: { type: "integer", minimum: 18, maximum: 120 },
        is_active: { type: "boolean", default: true },
        tags: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true
        },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            country: { type: "string" },
            postal_code: { type: "string" }
          }
        }
      }
    }
  },
  {
    id: 'preset-locales',
    name: 'locales_en.json',
    byteSize: 620,
    sizeFormatted: '620 B',
    isPreset: true,
    isValid: true,
    error: null,
    lastModified: Date.now() - 7200000,
    content: JSON.stringify(
      {
        common: {
          welcome: "Welcome to JSON Visualizer",
          search_placeholder: "Search keys or values...",
          actions: {
            import: "Import File",
            export: "Export Data",
            copy: "Copy to Clipboard",
            expand_all: "Expand All Nodes",
            collapse_all: "Collapse All Nodes"
          }
        },
        errors: {
          invalid_json: "Syntax error in JSON string",
          file_too_large: "File size exceeds 50MB memory limit",
          not_found: "Requested path does not exist"
        },
        footer: {
          author: "Suhail Akhtar",
          website: "https://suhail.top",
          version: "v1.0.0"
        }
      },
      null,
      2
    ),
    data: {
      common: {
        welcome: "Welcome to JSON Visualizer",
        search_placeholder: "Search keys or values...",
        actions: {
          import: "Import File",
          export: "Export Data",
          copy: "Copy to Clipboard",
          expand_all: "Expand All Nodes",
          collapse_all: "Collapse All Nodes"
        }
      },
      errors: {
        invalid_json: "Syntax error in JSON string",
        file_too_large: "File size exceeds 50MB memory limit",
        not_found: "Requested path does not exist"
      },
      footer: {
        author: "Suhail Akhtar",
        website: "https://suhail.top",
        version: "v1.0.0"
      }
    }
  }
];
