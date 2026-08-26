# Changelog - JSON Reader & Node Graph Visualizer

All notable changes to this project will be documented in this file.
Developed by **Suhail Akhtar** ([suhail.top](https://suhail.top)).

## [v1.1.0] - 2026-08-26

### Added
- **Netlify Deployment Configuration**: Added `netlify.toml`, `_redirects` SPA rewrite rules, and `.nvmrc` Node.js 20 environment specification to ensure static builds render properly on Netlify.
- **Full-Screen Focus Mode**: Added header toggle and `Ctrl/Cmd + Shift + F` / `Esc` keyboard shortcuts to expand visualization workspace.
- **Resilient Service Worker**: Added network-first navigation caching and background stale-while-revalidate asset caching in `sw.js`.
- **Expanded Presets**: Added Netflix catalog and viewing history datasets with relaxed parser support.

## [v1.0.0] - 2026-08-26

### Added
- **Geometric Balance Aesthetic**: Sleek monospace typography, high-contrast dark palette (`#0A0A0B` / `#111114`), and customizable themes.
- **JSON Crack Node Graph View**: Interactive pan/zoom visual graph rendering object and array nodes with smooth bezier curves, search term highlighting, path tracing, and node expansion.
- **Collapsible Tree View**: High-performance JSON syntax tree with color formatting, collapsible depth guides, quick copy path/value, and level expand controls.
- **Search & Filter Engine**: Fast path/key/value filter supporting regular expressions, case sensitivity, type filtering, and step-by-step match navigation.
- **Formatted Raw Editor**: Live JSON syntax viewer & editor with line numbers, quick format/minify, trailing comma fixing, and key sorting.
- **Tabular Data View**: Interactive grid view for arrays of objects with search, sorting, and CSV export.
- **Node Inspector & Stats Panel**: Full JSON path calculations (Dot notation, Bracket notation, JSONPath), live value editing, key insertion/deletion, and node counts/depth breakdown.
- **Sample Dataset Suite**: Built-in JSON presets (`production.json`, `schema_v2.json`, `api_response.json`, `geo_data.json`, `locales_en.json`).
- **Export & Share Capabilities**: Export formatted JSON, minified JSON, CSV, SVG graph capture, and raw copy options.
- **Developer Attribution & PWA**: Complete `<meta>` author attribution for Suhail Akhtar, offline PWA service worker support, and release changelog.
