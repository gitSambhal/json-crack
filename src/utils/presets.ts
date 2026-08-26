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
  },
  {
    id: 'preset-netflix-catalog',
    name: 'netflix_catalog.json',
    byteSize: 3420,
    sizeFormatted: '3.42 KB',
    isPreset: true,
    isValid: true,
    error: null,
    lastModified: Date.now() - 1800000,
    content: JSON.stringify(
      {
        platform: "Netflix",
        region: "Global",
        total_titles: 8,
        account: {
          plan: "Premium Ultra HD",
          max_streams: 4,
          audio_support: ["Dolby Atmos", "Spatial Audio", "5.1 Surround"]
        },
        catalog: [
          {
            show_id: "s80057281",
            title: "Stranger Things",
            type: "TV Show",
            director: "The Duffer Brothers",
            cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
            country: "United States",
            release_year: 2016,
            rating: "TV-14",
            duration: "4 Seasons",
            genres: ["Sci-Fi & Fantasy", "Horror", "Drama"],
            imdb_score: 8.7,
            netflix_original: true,
            synopsis: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            seasons_detail: [
              { season: 1, episodes: 8, release_date: "2016-07-15" },
              { season: 2, episodes: 9, release_date: "2017-10-27" },
              { season: 3, episodes: 8, release_date: "2019-07-04" },
              { season: 4, episodes: 9, release_date: "2022-05-27" }
            ]
          },
          {
            show_id: "s81040344",
            title: "Squid Game",
            type: "TV Show",
            director: "Hwang Dong-hyuk",
            cast: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-joon", "Jung Ho-yeon"],
            country: "South Korea",
            release_year: 2021,
            rating: "TV-MA",
            duration: "2 Seasons",
            genres: ["Thriller", "Drama", "Mystery"],
            imdb_score: 8.0,
            netflix_original: true,
            synopsis: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games with high stakes.",
            seasons_detail: [
              { season: 1, episodes: 9, release_date: "2021-09-17" },
              { season: 2, episodes: 7, release_date: "2024-12-26" }
            ]
          },
          {
            show_id: "s80234304",
            title: "The Queen's Gambit",
            type: "TV Show",
            director: "Scott Frank",
            cast: ["Anya Taylor-Joy", "Bill Camp", "Marielle Heller", "Thomas Brodie-Sangster"],
            country: "United States",
            release_year: 2020,
            rating: "TV-MA",
            duration: "1 Season (Miniseries)",
            genres: ["Drama"],
            imdb_score: 8.5,
            netflix_original: true,
            synopsis: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.",
            seasons_detail: [
              { season: 1, episodes: 7, release_date: "2020-10-23" }
            ]
          },
          {
            show_id: "s80077368",
            title: "Black Mirror",
            type: "TV Show",
            director: "Charlie Brooker",
            cast: ["Daniel Lapaine", "Hannah John-Kamen", "Michaela Coel"],
            country: "United Kingdom",
            release_year: 2011,
            rating: "TV-MA",
            duration: "6 Seasons",
            genres: ["Sci-Fi", "Dystopian", "Drama"],
            imdb_score: 8.7,
            netflix_original: true,
            synopsis: "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
            seasons_detail: [
              { season: 1, episodes: 3, release_date: "2011-12-04" },
              { season: 2, episodes: 3, release_date: "2013-02-11" },
              { season: 3, episodes: 6, release_date: "2016-10-21" },
              { season: 4, episodes: 6, release_date: "2017-12-29" },
              { season: 5, episodes: 3, release_date: "2019-06-05" },
              { season: 6, episodes: 5, release_date: "2023-06-15" }
            ]
          },
          {
            show_id: "s81231974",
            title: "Glass Onion: A Knives Out Mystery",
            type: "Movie",
            director: "Rian Johnson",
            cast: ["Daniel Craig", "Edward Norton", "Janelle Monáe", "Kathryn Hahn"],
            country: "United States",
            release_year: 2022,
            rating: "PG-13",
            duration: "139 min",
            genres: ["Comedy", "Crime", "Mystery"],
            imdb_score: 7.1,
            netflix_original: true,
            synopsis: "Tech billionaire Miles Bron invites his friends for a getaway on his private Greek island. When someone turns up dead, Detective Benoit Blanc is put on the case."
          },
          {
            show_id: "s80192098",
            title: "Money Heist",
            type: "TV Show",
            director: "Álex Pina",
            cast: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño", "Pedro Alonso"],
            country: "Spain",
            release_year: 2017,
            rating: "TV-MA",
            duration: "5 Parts",
            genres: ["Crime", "Action", "Suspense"],
            imdb_score: 8.2,
            netflix_original: true,
            synopsis: "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain."
          }
        ]
      },
      null,
      2
    ),
    data: {
      platform: "Netflix",
      region: "Global",
      total_titles: 8,
      account: {
        plan: "Premium Ultra HD",
        max_streams: 4,
        audio_support: ["Dolby Atmos", "Spatial Audio", "5.1 Surround"]
      },
      catalog: [
        {
          show_id: "s80057281",
          title: "Stranger Things",
          type: "TV Show",
          director: "The Duffer Brothers",
          cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
          country: "United States",
          release_year: 2016,
          rating: "TV-14",
          duration: "4 Seasons",
          genres: ["Sci-Fi & Fantasy", "Horror", "Drama"],
          imdb_score: 8.7,
          netflix_original: true,
          synopsis: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
          seasons_detail: [
            { season: 1, episodes: 8, release_date: "2016-07-15" },
            { season: 2, episodes: 9, release_date: "2017-10-27" },
            { season: 3, episodes: 8, release_date: "2019-07-04" },
            { season: 4, episodes: 9, release_date: "2022-05-27" }
          ]
        },
        {
          show_id: "s81040344",
          title: "Squid Game",
          type: "TV Show",
          director: "Hwang Dong-hyuk",
          cast: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-joon", "Jung Ho-yeon"],
          country: "South Korea",
          release_year: 2021,
          rating: "TV-MA",
          duration: "2 Seasons",
          genres: ["Thriller", "Drama", "Mystery"],
          imdb_score: 8.0,
          netflix_original: true,
          synopsis: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games with high stakes.",
          seasons_detail: [
            { season: 1, episodes: 9, release_date: "2021-09-17" },
            { season: 2, episodes: 7, release_date: "2024-12-26" }
          ]
        },
        {
          show_id: "s80234304",
          title: "The Queen's Gambit",
          type: "TV Show",
          director: "Scott Frank",
          cast: ["Anya Taylor-Joy", "Bill Camp", "Marielle Heller", "Thomas Brodie-Sangster"],
          country: "United States",
          release_year: 2020,
          rating: "TV-MA",
          duration: "1 Season (Miniseries)",
          genres: ["Drama"],
          imdb_score: 8.5,
          netflix_original: true,
          synopsis: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.",
          seasons_detail: [
            { season: 1, episodes: 7, release_date: "2020-10-23" }
          ]
        },
        {
          show_id: "s80077368",
          title: "Black Mirror",
          type: "TV Show",
          director: "Charlie Brooker",
          cast: ["Daniel Lapaine", "Hannah John-Kamen", "Michaela Coel"],
          country: "United Kingdom",
          release_year: 2011,
          rating: "TV-MA",
          duration: "6 Seasons",
          genres: ["Sci-Fi", "Dystopian", "Drama"],
          imdb_score: 8.7,
          netflix_original: true,
          synopsis: "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
          seasons_detail: [
            { season: 1, episodes: 3, release_date: "2011-12-04" },
            { season: 2, episodes: 3, release_date: "2013-02-11" },
            { season: 3, episodes: 6, release_date: "2016-10-21" },
            { season: 4, episodes: 6, release_date: "2017-12-29" },
            { season: 5, episodes: 3, release_date: "2019-06-05" },
            { season: 6, episodes: 5, release_date: "2023-06-15" }
          ]
        },
        {
          show_id: "s81231974",
          title: "Glass Onion: A Knives Out Mystery",
          type: "Movie",
          director: "Rian Johnson",
          cast: ["Daniel Craig", "Edward Norton", "Janelle Monáe", "Kathryn Hahn"],
          country: "United States",
          release_year: 2022,
          rating: "PG-13",
          duration: "139 min",
          genres: ["Comedy", "Crime", "Mystery"],
          imdb_score: 7.1,
          netflix_original: true,
          synopsis: "Tech billionaire Miles Bron invites his friends for a getaway on his private Greek island. When someone turns up dead, Detective Benoit Blanc is put on the case."
        },
        {
          show_id: "s80192098",
          title: "Money Heist",
          type: "TV Show",
          director: "Álex Pina",
          cast: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño", "Pedro Alonso"],
          country: "Spain",
          release_year: 2017,
          rating: "TV-MA",
          duration: "5 Parts",
          genres: ["Crime", "Action", "Suspense"],
          imdb_score: 8.2,
          netflix_original: true,
          synopsis: "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain."
        }
      ]
    }
  },
  {
    id: 'preset-netflix-history',
    name: 'netflix_viewing_history.json',
    byteSize: 1820,
    sizeFormatted: '1.82 KB',
    isPreset: true,
    isValid: true,
    error: null,
    lastModified: Date.now() - 900000,
    content: JSON.stringify(
      {
        account_email: "user@netflix.com",
        profile: "Suhail",
        download_date: "2026-08-26",
        viewing_history: [
          {
            title: "Stranger Things: Season 4: Chapter Nine: The Piggyback",
            date: "2026-08-25",
            duration_minutes: 139,
            completed: true,
            device: "LG OLED 4K Smart TV",
            country: "US"
          },
          {
            title: "Squid Game: Season 2: Red Light, Green Light 2.0",
            date: "2026-08-24",
            duration_minutes: 58,
            completed: true,
            device: "Apple iPad Pro",
            country: "US"
          },
          {
            title: "Black Mirror: Season 6: Joan Is Awful",
            date: "2026-08-23",
            duration_minutes: 58,
            completed: true,
            device: "MacBook Pro",
            country: "US"
          },
          {
            title: "Glass Onion: A Knives Out Mystery",
            date: "2026-08-20",
            duration_minutes: 139,
            completed: true,
            device: "Apple TV 4K",
            country: "US"
          },
          {
            title: "The Queen's Gambit: End Game",
            date: "2026-08-18",
            duration_minutes: 67,
            completed: true,
            device: "iPhone 15 Pro",
            country: "US"
          }
        ]
      },
      null,
      2
    ),
    data: {
      account_email: "user@netflix.com",
      profile: "Suhail",
      download_date: "2026-08-26",
      viewing_history: [
        {
          title: "Stranger Things: Season 4: Chapter Nine: The Piggyback",
          date: "2026-08-25",
          duration_minutes: 139,
          completed: true,
          device: "LG OLED 4K Smart TV",
          country: "US"
        },
        {
          title: "Squid Game: Season 2: Red Light, Green Light 2.0",
          date: "2026-08-24",
          duration_minutes: 58,
          completed: true,
          device: "Apple iPad Pro",
          country: "US"
        },
        {
          title: "Black Mirror: Season 6: Joan Is Awful",
          date: "2026-08-23",
          duration_minutes: 58,
          completed: true,
          device: "MacBook Pro",
          country: "US"
        },
        {
          title: "Glass Onion: A Knives Out Mystery",
          date: "2026-08-20",
          duration_minutes: 139,
          completed: true,
          device: "Apple TV 4K",
          country: "US"
        },
        {
          title: "The Queen's Gambit: End Game",
          date: "2026-08-18",
          duration_minutes: 67,
          completed: true,
          device: "iPhone 15 Pro",
          country: "US"
        }
      ]
    }
  }
];
