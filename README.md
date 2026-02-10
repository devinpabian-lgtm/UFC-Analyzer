# UFC Intelligence Hub

A live UFC knowledge website that aggregates public information from UFC media pages, community channels, and optional betting providers into one dashboard.

## What this version includes

- **Breaking news ingestion** from UFC.com news.
- **Fight announcement tracker** from UFC.com events.
- **Rankings tracker** from UFC.com rankings.
- **Betting markets module** (integrated with The Odds API when `ODDS_API_KEY` is set).
- **Fan interaction feed** via Reddit MMA/UFC RSS.
- **Frontend hub UI** for quick monitoring and refresh.

## Architecture

- `backend/app.py`: stdlib HTTP server that exposes `/api/dashboard` and serves the UI.
- `backend/scrapers.py`: source adapters and payload builder.
- `app/index.html`, `app/styles.css`, `app/script.js`: dashboard UI.

## Run locally

```bash
./runapp
```

Then open:

- `http://127.0.0.1:8000`

## Optional live odds

Set your API key before starting:

```bash
export ODDS_API_KEY="your_key_here"
./runapp
```

## Notes on scraping

- This project pulls from publicly accessible pages/endpoints and uses a desktop browser User-Agent.
- Always verify and comply with each source's terms of use and robots/rate limits before production deployment.
- Website markup changes can break scrapers; selectors are intentionally defensive and should be monitored.
