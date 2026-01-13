# UFC Analyzer

A lightweight UFC fight analyzer you can use in the browser. The goal is to capture:

- **Fighter profile data** (name, physical attributes, style, etc.).
- **Fight-by-fight performance scores** (subjective ratings you assign).
- **Skill implementation intent** (how often the fighter tried to use certain tools).
- **Head-to-head comparisons** based on your stored data.

This repo includes a local web app, a data model, and JSON schemas for validating exports.

## Quick Start

### Option A: One-command launcher (recommended)

```bash
./run-app.sh
```

Then open: `http://127.0.0.1:8000/index.html`

> You can change the port by setting `PORT=9000 ./run-app.sh`.

### Option B: Open the file directly

Open `app/index.html` in your browser.

### Option C: Run your own local server

```bash
python -m http.server 8000 --directory app
```

Then open: `http://127.0.0.1:8000/index.html`

## Using the App

1. Add fighters in the **Add Fighter** form.
2. Record fights in **Add Fight Record**.
3. Use **Compare Fighters** to analyze matchup tendencies.
4. Export JSON for backups or share with other devices.

> Data is stored locally in your browser (localStorage).

## Core Concepts

### 1) Fighter Profile
Each fighter has a single profile that includes static details (name, height, reach, stance) and optional notes.

### 2) Fight Record
A fight record links two fighters, the event metadata (date, opponent, result), and two "buckets":

- **Performance Per Fight**: subjective rating (0–10) of how well the fighter performed.
- **Skill Implementation**: a 0–10 rating for how often the fighter *attempted* to use a given skill
  (box, kickbox, wrestle, clinch, grapple, etc.).

### 3) Ratings Scale
All ratings use a 0–10 scale.

- **0** = did not show at all
- **5** = average/neutral
- **10** = dominant/constant

You can also add text notes per fight for nuance.

## Files

- `app/` contains the local browser app (HTML/CSS/JS).
- `schemas/` contains JSON schemas for validating data.
- `docs/data-model.md` explains the data structure and relationships.

## Next Steps (Optional)

- Add charts for skill trends over time.
- Add round-by-round scoring notes.
- Build a backend for multi-user access.
