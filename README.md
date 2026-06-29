# Figure Modification - Complete Overview

## Project Essence

This is a research-focused web application designed to streamline the creation and refinement of publication-quality scientific figures. The tool addresses a recurring pain point in academic machine learning research: Python scripts generate charts with acceptable default styles, but adjusting colors, fonts, axis labels, figure dimensions, or adding statistical annotations requires repeated manual edits to source code. Figure Modification eliminates this cycle by providing a browser-based parameter editor that regenerates figures in real time via a Python backend, producing output in the exact format and dimensions expected by academic journals.

The project is planned as one component of a larger academic toolchain alongside [LaTeX Table Composer](https://github.com/Axe0320/latex-table-composer), [LaTeX Figure Composer](https://github.com/Axe0320/latex-figure-composer), and [Citation BibTeX Converter](https://github.com/Axe0320/citation-bibtex-converter), with future integration under a single pnpm workspace.

---

## Supported Figure Types

The application covers 13 figure types organized around common research workflows.

**Data representation** — Confusion matrix and heatmap both support custom colormaps, per-cell value annotations, and cm-unit sizing to match journal column widths. Confusion matrix includes optional normalization; heatmap supports correlation mode with optional upper-triangle masking.

**Standard charts** — Bar chart, line plot, scatter plot, and histogram cover the majority of experimental result presentation. Bar chart includes grouped/stacked layouts, per-bar color overrides, threshold lines, and a bin-merge feature for "other" categories. Line plot and scatter plot support multiple series with independent color and marker control.

**Machine learning evaluation** — ROC curve, Precision-Recall curve, learning curve, and feature importance provide publication-ready ML evaluation figures. ROC and PR curves display AUC/AP values in the legend; learning curve supports dual Y-axes for simultaneous loss and accuracy tracking. Feature importance includes Top-N filtering and sort toggling.

**Statistical comparison** — Box plot, violin plot, and error bar chart all support statistical significance brackets rendered directly on the figure. Violin plot adds inner representation control (box, stick, or none) and edge color adjustment. Error bar chart supports both vertical and horizontal orientations.

---

## Key Features

**Parameter editing**: Every figure type exposes its complete parameter set through a sidebar editor — title, axis labels, font sizes, figure dimensions (in centimeters), DPI, grid style, legend position, axis ranges, and tick step intervals. Changes trigger instant regeneration with debounced API calls.

**Output formats**: Figures can be downloaded as PNG, SVG, PDF, or EPS. PNG uses the cached preview for zero-latency download; SVG, PDF, and EPS trigger a dedicated render pass that bypasses the preview cache to avoid format contamination.

**Color palette presets**: Four presets (Default, Academic, Pastel, Vivid) apply across all multi-series figure types through a shared component, allowing consistent styling across an entire paper with a single click.

**CSV import**: All figure types accept CSV file uploads. Each input component includes format-aware parsing — heatmap auto-detects whether the first row and column are labels, learning curve uses the header row as series names, and error bar parses paired mean/error columns. This covers all 13 figure types.

**Multi-figure composition**: The Compose mode arranges multiple figures in a grid or free-placement layout. The combined output can be exported as a single image, suitable for multi-panel figures in papers. Figure order can be rearranged via drag-and-drop. State is persisted to IndexedDB across browser sessions.

**OCR import pipeline**: The "図を読み込む" button opens a modal that accepts an uploaded chart image and extracts its data via Claude, GPT-4o, or Gemini Vision APIs. API keys are stored exclusively in the browser's localStorage and never sent to the application server. Extracted JSON is presented in an editable text area before being applied, allowing corrections before creating the new figure. For line plots and scatter plots, a canvas-based manual digitizer (WebPlotDigitizer-style four-point axis calibration) is provided as an alternative to Vision API extraction.

**Sklearn paste**: Confusion matrix and related types accept raw Python dict output from scikit-learn, converting pasted `print()` output directly into figure data without manual reformatting.

**Statistical significance testing**: Box plot, violin plot, and error bar chart integrate with a backend `/api/stat_test` endpoint for automated bracket placement with Welch's t-test, Mann-Whitney U test, and other methods.

---

## Technical Architecture

**Stack**

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript 5 + Vite 6 |
| Styling | Tailwind CSS 4 |
| State management | Zustand 5 |
| Persistence | IndexedDB via idb |
| Backend | Vercel Functions (Python 3.12) |
| Figure rendering | matplotlib 3.8 + seaborn 0.13 + numpy 1.26 |
| Vision AI | Anthropic SDK ≥ 0.40 (Claude Vision) |
| Error monitoring | Sentry (React + Python) |
| Deployment | Vercel |

**Data flow**

The browser sends figure data and parameters as JSON to `/api/render`. The Python handler dispatches to a type-specific renderer module under `api/_lib/`, which constructs a matplotlib figure, applies all parameters, and returns the result as a base64-encoded image. The frontend caches the last rendered preview per figure ID in IndexedDB. Download requests for non-PNG formats call a separate `renderForDownload` path that bypasses this cache.

**API endpoints**

`POST /api/render` accepts `{ type, data, params, output: { format } }` and returns `{ image: "<base64>" }`. `POST /api/compose` accepts an array of figures with a layout specification and returns a single composited image. `POST /api/ocr` accepts a base64 image, figure type, provider identifier, and API key, runs optional Pillow preprocessing when available, and returns `{ extracted: <type-specific JSON> }`. `POST /api/stat_test` performs pairwise statistical tests and returns bracket data for rendering.

**Frontend structure**

Components are organized into four directories: `input/` for per-type data entry UIs, `editor/` for parameter panels, `compose/` for the multi-figure layout view, and `import/` for the OCR pipeline (ImportModal, OcrSettings, OcrConfirm, PointDigitizer). Shared utilities live in `common/`. A single Zustand store in `store/figureStore.ts` manages the figure array, selection state, and compose layout, all hydrated from IndexedDB on startup.

---

## Current Limitations

The OCR import pipeline requires a third-party Vision API key (Anthropic, OpenAI, or Google). Accuracy depends on chart clarity and annotation density; extracted data should always be reviewed in the confirmation editor before applying. The preprocessing step (Pillow resize and contrast enhancement) is skipped in the current Vercel deployment due to Python 3.14 wheel availability for Pillow — API keys are the primary input path.

Figure rendering is performed server-side on Vercel Functions, which may experience cold start latency of up to three seconds on initial load. Subsequent requests within the same session are substantially faster.

The statistical bracket feature currently supports only unpaired two-group comparisons. Multi-group correction (Bonferroni, Holm) and paired tests are not yet implemented.

Multi-figure composition exports are PNG-only. SVG and PDF export for composed layouts are planned.

---

## Deployment & Access

The application is deployed on Vercel at: **https://figure-modification.vercel.app/**

```bash
# Local development
npm install
npm run dev          # starts Vite dev server at localhost:5173
                     # Vercel Functions must be run with: vercel dev
```

**License:** MIT

---

## Project Context

Created as part of the academic toolchain development at Chiba Institute of Technology, this project was built with AI assistance from Claude Code and is distributed as open source. It represents a practical approach to reducing the friction between Python-based data analysis and publication-ready figure production, targeting researchers who need precise control over figure appearance without modifying analysis scripts.
