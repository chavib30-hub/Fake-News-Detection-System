const API = "http://127.0.0.1:8000";

// HTML Elements
const titleInput = document.getElementById("ttl");
const subjectInput = document.getElementById("sub");
const textInput = document.getElementById("txt");
const checkButton = document.getElementById("go");
const errorBox = document.getElementById("err");

let history = [];
let lastResult = null;

// Character counter
if (textInput) {
    textInput.addEventListener("input", () => {
        document.getElementById("count").textContent = `${textInput.value.length} / 8000`;
    });
}

// Clear inputs
document.getElementById("clear")?.addEventListener("click", () => {
    titleInput.value = "";
    subjectInput.value = "";
    textInput.value = "";
    document.getElementById("count").textContent = "0 / 8000";
    if (errorBox) errorBox.textContent = "";
});

// Check news trigger
if (checkButton) {
    checkButton.addEventListener("click", checkNews);
}

async function checkNews() {
    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();
    const text = textInput.value.trim();

    if (!title || !subject || !text) {
        if (errorBox) errorBox.textContent = "Please enter the title, subject, and article text.";
        return;
    }

    if (errorBox) errorBox.textContent = "";
    checkButton.disabled = true;
    checkButton.textContent = "Checking...";

    try {
        const response = await fetch(`${API}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, subject, text })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        displayResult(data);

        if (document.getElementById("tSave")?.checked) {
            history.unshift({
                title,
                subject,
                text,
                prediction: Number(data.Prediction),
                confidence: Number(data.Confidence_Score),
                date: new Date().toISOString()
            });
            updateHistory();
        }

        const rawPre = document.getElementById("raw");
        if (rawPre) {
            rawPre.textContent = JSON.stringify(data, null, 2);
            rawPre.classList.toggle("hide", !document.getElementById("tRaw")?.checked);
        }

    } catch (error) {
        console.error(error);
        if (errorBox) errorBox.textContent = "Could not connect to FastAPI backend. Ensure uvicorn is running.";
    } finally {
        checkButton.disabled = false;
        checkButton.textContent = "Check it";
    }
}

// Display prediction result
function displayResult(data) {
    const prediction = Number(data.Prediction);
    const confidence = Number(data.Confidence_Score);

    if (![0, 1].includes(prediction) || !Number.isFinite(confidence)) {
        if (errorBox) errorBox.textContent = "The API returned an invalid result.";
        return;
    }

    lastResult = data;
    const isFake = prediction === 0;

    document.getElementById("pct").textContent = `${confidence.toFixed(2)}%`;
    
    const stampEl = document.getElementById("stamp");
    stampEl.textContent = isFake ? "FAKE" : "REAL";
    stampEl.className = `stamp ${isFake ? "fake fk" : "real rl"} slam`;

    document.getElementById("verdict").textContent = isFake
        ? "This article was classified as FAKE by the model. Exercise caution before sharing."
        : "This article was classified as REAL by the model. Always cross-verify news.";

    const barEl = document.getElementById("bar");
    barEl.style.width = `${Math.max(0, Math.min(100, confidence))}%`;
    barEl.className = isFake ? "fake" : "real";

    const resCard = document.getElementById("result");
    resCard.style.display = "grid";
    resCard.classList.add("show");
}

// Format values strictly to 2 decimal places (.2f)
function formatValue(val) {
    if (typeof val === "number") {
        return Number.isInteger(val) ? val : val.toFixed(2);
    }
    if (!isNaN(parseFloat(val)) && isFinite(val)) {
        const num = parseFloat(val);
        return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return val;
}

// Format Confusion Matrix with explicitly renamed Titles (Rows & Columns)
function formatConfusionMatrix(matrixData) {
    if (!Array.isArray(matrixData) || matrixData.length === 0) return matrixData;

    return matrixData.map((row, index) => {
        const newRow = {};
        
        // Define row actual class titles
        if (index === 0) {
            newRow["Actual Class"] = "Actual Fake (Fake False / Real False)";
        } else if (index === 1) {
            newRow["Actual Class"] = "Actual Real (Real True / Fake True)";
        } else {
            newRow["Actual Class"] = `Class ${index}`;
        }

        Object.keys(row).forEach(key => {
            let newKey = key;
            if (key === "0") newKey = "Predicted Fake (True Negative)";
            else if (key === "1") newKey = "Predicted Real (True Positive)";
            
            let val = row[key];
            newRow[newKey] = formatValue(val);
        });
        return newRow;
    });
}

// Format Comparison Table: Separate Model and Vectorizer + 2 Decimal Places
function formatComparisonTable(tableData) {
    if (!Array.isArray(tableData)) return tableData;

    return tableData.map(row => {
        const newRow = {};
        
        // Explicit model and vectorizer separation
        newRow["Model Classifier"] = row["Model"] || row["model"] || "Logistic Regression";
        newRow["Feature Extractor"] = row["Vectorizer"] || row["vectorizer"] || "Bag of Words (BoW)";

        Object.keys(row).forEach(k => {
            if (!["Model", "model", "Vectorizer", "vectorizer"].includes(k)) {
                newRow[k] = formatValue(row[k]);
            }
        });
        return newRow;
    });
}

// Render dynamic HTML tables
function renderTable(dataArray, extraClass = "") {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return `<p class="empty">No data available</p>`;
    }
    const keys = Object.keys(dataArray[0]);
    let html = `<div style="overflow-x:auto;"><table class="${extraClass}"><thead><tr>`;
    
    keys.forEach(k => {
        html += `<th>${k}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    dataArray.forEach(row => {
        html += `<tr>`;
        keys.forEach(k => {
            html += `<td>${row[k] !== undefined ? row[k] : ''}</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;
    return html;
}

// History UI in Tabular Format
function updateHistory() {
    const hbadge = document.getElementById("hbadge");
    if (hbadge) {
        hbadge.textContent = history.length;
        hbadge.classList.toggle("hide", history.length === 0);
    }

    const listContainer = document.getElementById("hlist");
    if (!listContainer) return;

    if (history.length === 0) {
        listContainer.innerHTML = `<p class="empty">No news checks recorded yet.</p>`;
        updateDashboard();
        return;
    }

    const tableData = history.map((item, index) => ({
        "Result": `<span class="${item.prediction === 0 ? 'fk' : 'rl'}" style="font-weight:bold">${item.prediction === 0 ? 'FAKE' : 'REAL'}</span>`,
        "Confidence": `${item.confidence.toFixed(2)}%`,
        "Title": `<div class="t" title="${item.title}">${item.title}</div>`,
        "Subject": item.subject,
        "Date": new Date(item.date).toLocaleDateString() + " " + new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        "Action": `<button class="ghost" onclick="loadHistoryItem(${index})" style="padding:4px 10px; font-size:12px;">Inspect</button>`
    }));

    listContainer.innerHTML = renderTable(tableData, "history-table");
    updateDashboard();
}

// Load clicked history entry back into input
window.loadHistoryItem = function(index) {
    const item = history[index];
    if (!item) return;

    titleInput.value = item.title;
    subjectInput.value = item.subject;
    textInput.value = item.text;
    document.getElementById("count").textContent = `${item.text.length} / 8000`;
    
    const predBtn = document.querySelector('[data-p="predict"]');
    if (predBtn) predBtn.click();
    
    checkNews();
};

// Search & Filter History
document.getElementById("q")?.addEventListener("input", filterHistory);
document.getElementById("hf")?.addEventListener("click", event => {
    const button = event.target.closest("[data-f]");
    if (!button) return;

    document.querySelectorAll("#hf button").forEach(btn => btn.classList.toggle("on", btn === button));
    filterHistory();
});

function filterHistory() {
    const query = document.getElementById("q").value.toLowerCase();
    const filter = document.querySelector("#hf button.on")?.dataset.f || "all";

    const rows = document.querySelectorAll("#hlist table tbody tr");
    rows.forEach((row, idx) => {
        const item = history[idx];
        if (!item) return;

        const matchesQuery = item.title.toLowerCase().includes(query) || 
                             item.subject.toLowerCase().includes(query) || 
                             item.text.toLowerCase().includes(query);
                             
        const isFake = item.prediction === 0;
        const matchesFilter = filter === "all" || 
                              (filter === "fake" && isFake) || 
                              (filter === "real" && !isFake);

        row.style.display = matchesQuery && matchesFilter ? "" : "none";
    });
}

// Clear history
document.getElementById("hclear")?.addEventListener("click", () => {
    history = [];
    updateHistory();
});

// Render SVG Charts in Dashboard
function renderDashboardCharts(total, fake, real) {
    // 1. Fake vs Real Pie/Donut Chart
    const c1 = document.getElementById("c1");
    if (c1) {
        if (total === 0) {
            c1.innerHTML = `<p class="empty">No checks recorded yet.</p>`;
        } else {
            const fakePct = ((fake / total) * 100).toFixed(1);
            const realPct = ((real / total) * 100).toFixed(1);
            c1.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-around; flex-wrap:wrap; gap:16px;">
                    <svg width="140" height="140" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--real)" stroke-width="3.8" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--fake)" stroke-width="3.8" stroke-dasharray="${fakePct}, 100" />
                    </svg>
                    <div class="legend" style="flex-direction:column; gap:8px;">
                        <div><i style="background:var(--fake)"></i> Fake: <b>${fake}</b> (${fakePct}%)</div>
                        <div><i style="background:var(--real)"></i> Real: <b>${real}</b> (${realPct}%)</div>
                    </div>
                </div>
            `;
        }
    }

    // 2. Volume Bar Chart
    const c2 = document.getElementById("c2");
    if (c2) {
        c2.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
                <div>
                    <div class="split"><span>Fake Articles</span><span>${fake}</span></div>
                    <div class="meter"><b class="fake" style="width:${total ? (fake/total)*100 : 0}%"></b></div>
                </div>
                <div>
                    <div class="split"><span>Real Articles</span><span>${real}</span></div>
                    <div class="meter"><b class="real" style="width:${total ? (real/total)*100 : 0}%"></b></div>
                </div>
            </div>
        `;
    }

    // 3. Confidence Spread Gauge
    const c3 = document.getElementById("c3");
    if (c3) {
        const avgConf = total ? (history.reduce((s, i) => s + i.confidence, 0) / total) : 0;
        c3.innerHTML = `
            <div style="text-align:center; padding:10px 0;">
                <div class="big" style="font-size:48px; color:var(--warn);">${avgConf.toFixed(2)}%</div>
                <div class="count">Average Prediction Confidence</div>
            </div>
        `;
    }
}

// Dashboard Statistics & Model Evaluation Loading
function updateDashboard() {
    const total = history.length;
    const fake = history.filter(item => item.prediction === 0).length;
    const real = total - fake;

    const kpisEl = document.getElementById("kpis");
    if (kpisEl) {
        kpisEl.innerHTML = `
            <div class="kpi"><h3>Total Checks</h3><b>${total}</b></div>
            <div class="kpi"><h3>Fake Flagged</h3><b class="fk">${fake}</b></div>
            <div class="kpi"><h3>Real Flagged</h3><b class="rl">${real}</b></div>
        `;
    }

    renderDashboardCharts(total, fake, real);
    renderModelData();
}

// Fetch and render backend evaluations
async function renderModelData() {
    try {
        const [matrixResponse, tableResponse] = await Promise.all([
            fetch(`${API}/confusion_matrix`),
            fetch(`${API}/confusion_table`)
        ]);

        if (!matrixResponse.ok || !tableResponse.ok) {
            throw new Error("Could not load model performance data.");
        }

        const rawMatrix = await matrixResponse.json();
        const rawTable = await tableResponse.json();

        // Format Confusion Matrix and Comparison Table
        const formattedMatrix = formatConfusionMatrix(rawMatrix);
        const formattedTable = formatComparisonTable(rawTable);

        // Render Dashboard Tables
        const cmEl = document.getElementById("cm");
        const ctEl = document.getElementById("ct");
        if (cmEl) cmEl.innerHTML = renderTable(formattedMatrix);
        if (ctEl) ctEl.innerHTML = renderTable(formattedTable);

        // Dataset Split Breakdown Table
        const datasetBreakdown = [
            { "Dataset Subset": "Training Dataset", "Percentage Split": "80%", "Description": "Used for feature extraction (Bag of Words) and training Logistic Regression" },
            { "Dataset Subset": "Testing Dataset", "Percentage Split": "20%", "Description": "Unseen data evaluation used to generate Confusion Matrix & Metrics" },
            { "Dataset Subset": "Total Combined Dataset", "Percentage Split": "100%", "Description": "Complete dataset corpus processed by the pipeline" }
        ];

        // Render Report Page
        const repEl = document.getElementById("rep");
        if (repEl) {
            repEl.innerHTML = `
                <div class="card">
                    <h3>Dataset Split & Training Overview</h3>
                    <p class="sub">Model evaluation setup using an 80/20 train-test split.</p>
                    ${renderTable(datasetBreakdown)}
                </div>
                <div class="card">
                    <h3>Model Comparison (Logistic Regression & Bag of Words)</h3>
                    ${renderTable(formattedTable)}
                </div>
                <div class="card">
                    <h3>Confusion Matrix (Real & Fake Evaluation)</h3>
                    ${renderTable(formattedMatrix)}
                </div>
            `;
        }

    } catch (error) {
        console.error("Dashboard API error:", error);
        if (document.getElementById("cm")) document.getElementById("cm").textContent = "Model performance data unavailable.";
        if (document.getElementById("ct")) document.getElementById("ct").textContent = "Model comparison data unavailable.";
        if (document.getElementById("rep")) document.getElementById("rep").textContent = "Could not load report data from the backend.";
    }
}

// Navigation Tab Switcher
document.getElementById("nav")?.addEventListener("click", event => {
    const button = event.target.closest("[data-p]");
    if (!button) return;

    document.querySelectorAll("#nav button").forEach(btn => btn.classList.toggle("on", btn === button));
    document.querySelectorAll(".page").forEach(page => page.classList.toggle("on", page.id === `p-${button.dataset.p}`));
});

// Dark/Light Theme Switcher
document.getElementById("tTheme")?.addEventListener("change", event => {
    document.documentElement.dataset.theme = event.target.checked ? "dark" : "light";
});

// Mobile Sidebar Toggle
document.getElementById("menuBtn")?.addEventListener("click", () => {
    document.getElementById("side")?.classList.toggle("open");
});

// Print & Export CSV Handlers
document.getElementById("print")?.addEventListener("click", () => window.print());

document.getElementById("csv")?.addEventListener("click", () => {
    if (history.length === 0) {
        alert("No history records to export.");
        return;
    }

    const escapeCSV = val => `"${String(val).replace(/"/g, '""')}"`;
    const rows = [
        ["Title", "Subject", "Prediction", "Confidence (%)", "Date"],
        ...history.map(item => [
            item.title,
            item.subject,
            item.prediction === 0 ? "Fake" : "Real",
            item.confidence.toFixed(2),
            item.date
        ])
    ];

    const csvContent = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "truth-check-history.csv";
    link.click();
    URL.revokeObjectURL(url);
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    const resEl = document.getElementById("result");
    if (resEl) resEl.style.display = "none";
    updateHistory();
});