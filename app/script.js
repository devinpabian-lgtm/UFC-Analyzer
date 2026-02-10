async function loadDashboard() {
  const timestamp = document.getElementById("timestamp");
  timestamp.textContent = "Loading...";

  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();

    renderList(
      "news",
      data.breaking_news,
      (item) => `<a href="${item.url}" target="_blank">${item.title}</a> <small>${item.published}</small>`
    );

    renderList(
      "announcements",
      data.fight_announcements,
      (item) => `<a href="${item.url}" target="_blank">${item.event}</a> <small>${item.date} · ${item.location}</small>`
    );

    const rankingsEl = document.getElementById("rankings");
    rankingsEl.innerHTML = (data.rankings || [])
      .map(
        (division) =>
          `<div class="rank-block"><strong>${division.division}</strong><br/>${division.fighters
            .map((name, i) => `${i + 1}. ${name}`)
            .join(" · ")}</div>`
      )
      .join("");

    const oddsStatus = document.getElementById("oddsStatus");
    oddsStatus.textContent = data.betting_odds?.message || "";
    renderList(
      "odds",
      data.betting_odds?.markets || [],
      (market) =>
        `<strong>${market.matchup}</strong> <small>${market.bookmaker}</small><br/>${(market.outcomes || [])
          .map((o) => `${o.name}: ${o.price}`)
          .join(" | ")}`
    );

    renderList(
      "buzz",
      data.fan_buzz,
      (item) => `<a href="${item.url}" target="_blank">${item.title}</a> <small>${item.source}</small>`
    );

    timestamp.textContent = `Updated: ${new Date(data.generated_at).toLocaleString()}`;
  } catch (err) {
    timestamp.textContent = `Failed to load live feed: ${err}`;
  }
}

function renderList(id, items, formatter) {
  const el = document.getElementById(id);
  el.innerHTML = (items || []).length
    ? items.map((item) => `<li>${formatter(item)}</li>`).join("")
    : "<li>No data available.</li>";
}

document.getElementById("refresh").addEventListener("click", loadDashboard);
loadDashboard();
