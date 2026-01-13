const storageKey = "ufcAnalyzerData";

const defaultData = {
  fighters: [],
  fights: []
};

const elements = {
  fighterForm: document.getElementById("fighterForm"),
  fightForm: document.getElementById("fightForm"),
  compareForm: document.getElementById("compareForm"),
  fighterList: document.getElementById("fighterList"),
  fightList: document.getElementById("fightList"),
  compareResult: document.getElementById("comparisonResult"),
  fightFighter: document.getElementById("fightFighter"),
  fightOpponent: document.getElementById("fightOpponent"),
  compareFighterA: document.getElementById("compareFighterA"),
  compareFighterB: document.getElementById("compareFighterB"),
  exportData: document.getElementById("exportData"),
  importData: document.getElementById("importData"),
  resetData: document.getElementById("resetData")
};

const skillKeys = [
  "boxing",
  "kickboxing",
  "wrestling",
  "clinch",
  "grappling",
  "submissions",
  "ground_striking",
  "footwork"
];

const state = loadData();

function loadData() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return structuredClone(defaultData);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored data", error);
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

function resetForms() {
  elements.fighterForm.reset();
  elements.fightForm.reset();
}

function renderFighters() {
  elements.fighterList.innerHTML = "";
  if (state.fighters.length === 0) {
    elements.fighterList.innerHTML = "<p>No fighters added yet.</p>";
    return;
  }
  state.fighters.forEach((fighter) => {
    const card = document.createElement("div");
    card.className = "list-item";
    card.innerHTML = `
      <h4>${fighter.name}</h4>
      <div class="badge-row">
        <span class="badge">${fighter.weight_class}</span>
        <span class="badge">${fighter.stance}</span>
        <span class="badge">${fighter.primary_style}</span>
      </div>
      <p>${fighter.notes || "No notes yet."}</p>
      <div class="compare-row">
        <span>Height: ${fighter.height_in || "-"} in</span>
        <span>Reach: ${fighter.reach_in || "-"} in</span>
      </div>
    `;
    elements.fighterList.appendChild(card);
  });
}

function renderFightRecords() {
  elements.fightList.innerHTML = "";
  if (state.fights.length === 0) {
    elements.fightList.innerHTML = "<p>No fights recorded yet.</p>";
    return;
  }

  state.fights
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((fight) => {
      const fighter = state.fighters.find((f) => f.id === fight.fighter_id);
      const opponent = state.fighters.find((f) => f.id === fight.opponent_id);
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `
        <h4>${fighter?.name ?? "Unknown"} vs ${opponent?.name ?? "Unknown"}</h4>
        <div class="badge-row">
          <span class="badge">${fight.result}</span>
          <span class="badge">${fight.method}</span>
          <span class="badge">${fight.weight_class}</span>
        </div>
        <p>${fight.event} • ${fight.date}</p>
        <p><strong>Performance:</strong> ${fight.performance.score}</p>
        <p>${fight.notes || "No fight notes."}</p>
      `;
      elements.fightList.appendChild(card);
    });
}

function updateDropdowns() {
  const options = state.fighters.map(
    (fighter) => `<option value="${fighter.id}">${fighter.name}</option>`
  );

  [elements.fightFighter, elements.fightOpponent, elements.compareFighterA, elements.compareFighterB].forEach(
    (select) => {
      select.innerHTML = `<option value="">Select fighter</option>${options.join("")}`;
    }
  );
}

function parseNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function handleFighterSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.fighterForm);
  const fighter = {
    id: generateId("ftr"),
    name: formData.get("name").trim(),
    nickname: formData.get("nickname").trim(),
    height_in: parseNumber(formData.get("height_in")),
    reach_in: parseNumber(formData.get("reach_in")),
    weight_class: formData.get("weight_class").trim(),
    stance: formData.get("stance"),
    primary_style: formData.get("primary_style").trim(),
    team: formData.get("team").trim(),
    notes: formData.get("notes").trim()
  };

  state.fighters.push(fighter);
  saveData();
  resetForms();
  renderAll();
}

function handleFightSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.fightForm);
  const fight = {
    id: generateId("fgt"),
    fighter_id: formData.get("fighter_id"),
    opponent_id: formData.get("opponent_id"),
    event: formData.get("event").trim(),
    date: formData.get("date"),
    weight_class: formData.get("weight_class").trim(),
    result: formData.get("result"),
    method: formData.get("method").trim(),
    rounds_scheduled: parseNumber(formData.get("rounds_scheduled")),
    rounds_completed: parseNumber(formData.get("rounds_completed")),
    performance: {
      score: parseNumber(formData.get("performance_score")),
      confidence: parseNumber(formData.get("performance_confidence")),
      highlights: formData.get("performance_highlights").trim()
    },
    skill_implementation: {
      boxing: parseNumber(formData.get("skill_boxing")),
      kickboxing: parseNumber(formData.get("skill_kickboxing")),
      wrestling: parseNumber(formData.get("skill_wrestling")),
      clinch: parseNumber(formData.get("skill_clinch")),
      grappling: parseNumber(formData.get("skill_grappling")),
      submissions: parseNumber(formData.get("skill_submissions")),
      ground_striking: parseNumber(formData.get("skill_ground_striking")),
      footwork: parseNumber(formData.get("skill_footwork")),
      notes: formData.get("skill_notes").trim()
    },
    notes: formData.get("notes").trim()
  };

  state.fights.push(fight);
  saveData();
  elements.fightForm.reset();
  renderAll();
}

function getFightsForFighter(fighterId) {
  return state.fights.filter((fight) => fight.fighter_id === fighterId);
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function buildComparisonCard(title, fighter, fights) {
  if (!fighter) {
    return `
      <div class="compare-card">
        <h3>${title}</h3>
        <p>No fighter selected.</p>
      </div>
    `;
  }

  const performanceAvg = average(fights.map((fight) => fight.performance.score));
  const skillAverages = skillKeys.reduce((acc, key) => {
    acc[key] = average(fights.map((fight) => fight.skill_implementation[key]));
    return acc;
  }, {});

  const skillRows = skillKeys
    .map(
      (key) => `
        <div class="compare-row">
          <span>${key.replace("_", " ")}</span>
          <strong>${skillAverages[key]}</strong>
        </div>
      `
    )
    .join("");

  return `
    <div class="compare-card">
      <h3>${title}: ${fighter.name}</h3>
      <div class="compare-grid">
        <div class="compare-row">
          <span>Avg Performance</span>
          <strong>${performanceAvg}</strong>
        </div>
        ${skillRows}
        <div class="compare-row">
          <span>Fight Count</span>
          <strong>${fights.length}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderComparison({ fighterAId, fighterBId }) {
  const fighterA = state.fighters.find((fighter) => fighter.id === fighterAId);
  const fighterB = state.fighters.find((fighter) => fighter.id === fighterBId);
  const fightsA = getFightsForFighter(fighterAId);
  const fightsB = getFightsForFighter(fighterBId);

  const headToHead = state.fights.filter(
    (fight) =>
      (fight.fighter_id === fighterAId && fight.opponent_id === fighterBId) ||
      (fight.fighter_id === fighterBId && fight.opponent_id === fighterAId)
  );

  elements.compareResult.innerHTML = `
    ${buildComparisonCard("Fighter A", fighterA, fightsA)}
    ${buildComparisonCard("Fighter B", fighterB, fightsB)}
    <div class="compare-card">
      <h3>Head-to-Head Notes</h3>
      ${
        headToHead.length
          ? headToHead
              .map(
                (fight) => `
                  <div class="compare-row">
                    <span>${fight.event} (${fight.date})</span>
                    <strong>${fight.result}</strong>
                  </div>
                `
              )
              .join("")
          : "<p>No direct fights recorded yet.</p>"
      }
    </div>
  `;
}

function renderAll() {
  updateDropdowns();
  renderFighters();
  renderFightRecords();
}

function handleCompare(event) {
  event.preventDefault();
  renderComparison({
    fighterAId: elements.compareFighterA.value,
    fighterBId: elements.compareFighterB.value
  });
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ufc-analyzer-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.fighters = Array.isArray(parsed.fighters) ? parsed.fighters : [];
      state.fights = Array.isArray(parsed.fights) ? parsed.fights : [];
      saveData();
      renderAll();
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function handleReset() {
  if (!confirm("Reset all data? This clears local storage.")) {
    return;
  }
  state.fighters = [];
  state.fights = [];
  saveData();
  renderAll();
  elements.compareResult.innerHTML = "";
}

elements.fighterForm.addEventListener("submit", handleFighterSubmit);
elements.fightForm.addEventListener("submit", handleFightSubmit);
elements.compareForm.addEventListener("submit", handleCompare);
elements.exportData.addEventListener("click", handleExport);
elements.importData.addEventListener("change", handleImport);
elements.resetData.addEventListener("click", handleReset);

renderAll();
