"""Stdlib-only scraping helpers for UFC Intelligence Hub."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import os
import re
from typing import Any
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

REQUEST_TIMEOUT = 12
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)


def _get(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=REQUEST_TIMEOUT) as response:  # noqa: S310
        return response.read().decode("utf-8", errors="ignore")


def _strip_html(value: str) -> str:
    no_tags = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\s+", " ", no_tags).strip()


def fetch_ufc_news(limit: int = 8) -> list[dict[str, Any]]:
    html = _get("https://www.ufc.com/news")
    pattern = re.compile(
        r'<a[^>]+href="(?P<href>/news/[^"]+)"[^>]*>(?P<body>.*?)</a>',
        re.IGNORECASE | re.DOTALL,
    )
    seen: set[str] = set()
    news: list[dict[str, Any]] = []

    for match in pattern.finditer(html):
        href = f"https://www.ufc.com{match.group('href')}"
        if href in seen:
            continue
        title = _strip_html(match.group("body"))
        if len(title) < 12:
            continue
        seen.add(href)
        news.append({"title": title, "url": href, "published": "", "source": "UFC.com"})
        if len(news) >= limit:
            break
    return news


def fetch_ufc_events(limit: int = 6) -> list[dict[str, Any]]:
    html = _get("https://www.ufc.com/events")
    event_pattern = re.compile(r'<a[^>]+href="(?P<href>/event/[^"]+)"[^>]*>(?P<body>.*?)</a>', re.I | re.S)
    date_pattern = re.compile(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}")

    seen: set[str] = set()
    events: list[dict[str, Any]] = []
    for match in event_pattern.finditer(html):
        href = f"https://www.ufc.com{match.group('href')}"
        if href in seen:
            continue
        text = _strip_html(match.group("body"))
        if "UFC" not in text:
            continue
        date_match = date_pattern.search(text)
        events.append(
            {
                "event": text[:100],
                "date": date_match.group(0) if date_match else "TBA",
                "location": "See event page",
                "url": href,
            }
        )
        seen.add(href)
        if len(events) >= limit:
            break
    return events


def fetch_ufc_rankings(limit_per_division: int = 5) -> list[dict[str, Any]]:
    html = _get("https://www.ufc.com/rankings")
    section_pattern = re.compile(
        r'<h4[^>]*>(?P<division>[^<]+)</h4>(?P<body>.*?)(?=<h4|$)',
        re.IGNORECASE | re.DOTALL,
    )
    fighter_pattern = re.compile(r'<a[^>]+href="/athlete/[^"]+"[^>]*>(?P<name>.*?)</a>', re.I | re.S)

    rankings: list[dict[str, Any]] = []
    for section in section_pattern.finditer(html):
        division = _strip_html(section.group("division"))
        if not division:
            continue
        names = []
        for fighter in fighter_pattern.finditer(section.group("body")):
            name = _strip_html(fighter.group("name"))
            if name and name not in names:
                names.append(name)
            if len(names) >= limit_per_division:
                break
        if names:
            rankings.append({"division": division, "fighters": names})
    return rankings[:10]


def fetch_fan_buzz(limit: int = 6) -> list[dict[str, Any]]:
    feeds = {
        "r/MMA": "https://www.reddit.com/r/MMA/.rss",
        "r/UFC": "https://www.reddit.com/r/ufc/.rss",
    }
    posts: list[dict[str, Any]] = []

    for source, url in feeds.items():
        xml_content = _get(url)
        root = ET.fromstring(xml_content)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall("atom:entry", ns)[:4]:
            title = entry.findtext("atom:title", default="", namespaces=ns)
            link_el = entry.find("atom:link", ns)
            link = link_el.attrib.get("href", "") if link_el is not None else ""
            updated = entry.findtext("atom:updated", default="", namespaces=ns)
            posts.append({"title": title, "url": link, "published": updated, "source": source})

    posts.sort(key=lambda item: item["published"], reverse=True)
    return posts[:limit]


def fetch_betting_odds(limit: int = 6) -> dict[str, Any]:
    api_key = os.getenv("ODDS_API_KEY")
    if not api_key:
        return {
            "status": "unavailable",
            "message": "Set ODDS_API_KEY for live odds integration.",
            "markets": [],
        }

    params = urlencode(
        {
            "apiKey": api_key,
            "regions": "us,eu",
            "markets": "h2h",
            "oddsFormat": "american",
        }
    )
    url = f"https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?{params}"
    raw = _get(url)
    data = json.loads(raw)

    markets = []
    for event in data[:limit]:
        bookmaker = (event.get("bookmakers") or [{}])[0]
        outcomes = []
        if bookmaker.get("markets"):
            outcomes = bookmaker["markets"][0].get("outcomes", [])
        markets.append(
            {
                "matchup": f"{event.get('home_team', 'TBD')} vs {event.get('away_team', 'TBD')}",
                "bookmaker": bookmaker.get("title", "N/A"),
                "updated": event.get("commence_time", ""),
                "outcomes": outcomes,
            }
        )
    return {"status": "ok", "message": "", "markets": markets}


def build_dashboard_payload() -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    payload: dict[str, Any] = {
        "generated_at": now,
        "sources": [
            "https://www.ufc.com/news",
            "https://www.ufc.com/events",
            "https://www.ufc.com/rankings",
            "https://www.reddit.com/r/MMA/.rss",
            "https://www.reddit.com/r/ufc/.rss",
        ],
        "warnings": [],
    }

    tasks = {
        "breaking_news": fetch_ufc_news,
        "fight_announcements": fetch_ufc_events,
        "rankings": fetch_ufc_rankings,
        "fan_buzz": fetch_fan_buzz,
    }

    for key, func in tasks.items():
        try:
            payload[key] = func()
        except (URLError, ET.ParseError, json.JSONDecodeError, ValueError) as exc:
            payload[key] = []
            payload["warnings"].append(f"{key}: {exc}")

    try:
        payload["betting_odds"] = fetch_betting_odds()
    except Exception as exc:  # noqa: BLE001
        payload["betting_odds"] = {
            "status": "error",
            "message": f"Odds provider error: {exc}",
            "markets": [],
        }

    return payload
