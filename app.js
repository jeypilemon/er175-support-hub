let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";
let manualSearch = "";

let manualData = [];
let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];

let isLoading = true;

/* =========================
DOM
========================= */
const container = document.getElementById("products");
const chips = document.getElementById("chips");

/* =========================
STATE TRACKER
========================= */
const loaded = {
    aftermarket: false,
    oem: false,
    troubleshoot: false,
    manual: false
};

function closeModal() {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    frame.src = "";
    modal.classList.remove("show");
}



/* =========================
SKELETON
========================= */
function renderSkeleton(count = 6) {
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="card skeleton-card">
            <div class="skeleton image"></div>
            <div class="skeleton text short"></div>
            <div class="skeleton text"></div>
            <div class="skeleton text"></div>
        </div>
    `).join("");
}

/* =========================
READY CHECK
========================= */
function checkReady() {
    if (loaded.aftermarket && loaded.oem && loaded.troubleshoot && loaded.manual) {
        isLoading = false;
        render();
        renderChips();
    }
}

/* Global Functions*/

/* =========================
GLOBAL FUNCTIONS
========================= */

function getYouTubeId(url) {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
    );
    return match ? match[1] : null;
}

function openModal(url) {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    const ytId = getYouTubeId(url);

    frame.src = "";

    // YouTube → in-app
    if (ytId) {
        frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        modal.classList.add("show");
        return;
    }

    // TikTok → force app intent (best effort)
    if (url.includes("tiktok.com")) {
        window.location.href = url; // mobile opens app if installed
        return;
    }

    // Facebook → force app / browser fallback
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
        window.location.href = url;
        return;
    }

    window.open(url, "_blank");
}


/* =========================
UTILS
========================= */
function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

function safeHighlight(text) {
    if (!globalKeyword) return text || "";

    const escaped = globalKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const reg = new RegExp(`\\b${escaped}\\b`, "gi");

    return (text || "").replace(reg, m => `<mark>${m}</mark>`);
}

/* =========================
LOADERS
========================= */
function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            loaded.aftermarket = true;
            checkReady();
        }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            oemParts = res.data.filter(p => p["Parts Name"]);
            loaded.oem = true;
            checkReady();
        }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            troubleshootData = res.data.filter(p => p["Known Issue"]);
            loaded.troubleshoot = true;
            checkReady();
        }
    });
}

function loadManual(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            manualData = res.data.filter(x => x["Category"]);
            loaded.manual = true;
            checkReady();
        }
    });
}

/* =========================
TAB UI
========================= */
function updateTabUI() {
    document.querySelectorAll(".seg").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-tab="${currentTab}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

/* =========================
TOGGLE TROUBLESHOOT
========================= */
function toggleCard(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.toggle("open");
}

/* =========================
CHIPS
========================= */
function renderChips() {
    let cats = [];

    if (currentTab === "aftermarket") {
        cats = [...new Set(aftermarketParts.map(p => p["Parts Category"]))];
    } else if (currentTab === "oem") {
        cats = [...new Set(oemParts.map(p => p["Parts Category"]))];
    } else if (currentTab === "troubleshoot") {
        cats = [...new Set(troubleshootData.flatMap(p => (p["Tags"] || "").split(",")))];
    } else {
        chips.innerHTML = "";
        return;
    }

    cats = ["All", ...cats.filter(Boolean)];

    chips.innerHTML = cats.map(c => `
        <button class="${c === currentCategory ? "active" : ""}"
        onclick="setCategory('${c}')">${c}</button>
    `).join("");
}

/* =========================
MAIN RENDER
========================= */
function render() {

    if (isLoading) {
        renderSkeleton();
        return;
    }

    container.classList.remove("manual-mode", "grid-layout");

    if (currentTab === "aftermarket" || currentTab === "oem") {
        container.classList.add("grid-layout");
    }

    if (currentTab === "manual") {
        container.classList.add("manual-mode");
        return renderManual();
    }

    if (currentTab === "troubleshoot") {
        return renderTroubleshoot();
    }

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"]);
        const cat = normalizeText(p["Parts Category"]);

        return (
            (name.includes(globalKeyword) || cat.includes(globalKeyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">${getEmptyStateMessage()}</div>`;
        return;
    }

    container.innerHTML = filtered.map(part => `
    <div class="card">
        <img src="${part["Preview"] || ""}" onerror="this.style.display='none'">

        <div class="card-content">
            <h3>${part["Parts Name"]}</h3>
            <p>${part["Parts Category"]}</p>
        </div>

        <a class="button" href="${part["Shopee"]}" target="_blank">
            Buy in Shopee
        </a>
    </div>
`).join("");

    updateTabUI();
}

/*Linkyfy Text*/
function linkifySolution(text) {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

    return text
        .replace(/\n/g, "<br>")
        .replace(urlRegex, (url) => {

            const href = url.startsWith("www.") ? "https://" + url : url;

            let label = "🔗 Open Link";

            // 👇 PUT THE CODE HERE
            let className = "inline-link";

            if (/youtu\.?be|youtube\.com/.test(href)) {
                className += " youtube";
                label = "▶ Watch in YouTube";
            }
            else if (/tiktok\.com/.test(href)) {
                className += " tiktok";
                label = "🎵 Watch in TikTok";
            }
            else if (/facebook\.com|fb\.watch/.test(href)) {
                className += " facebook";
                label = "📘 View in Facebook";
            }

            return `
                <div style="margin:6px 0;">
                    <a class="${className}" href="javascript:void(0)" onclick="openModal('${href}')">
                        ${label}
                    </a>
                </div>
            `;
        });
}
/* =========================
TROUBLESHOOT
========================= */
function renderTroubleshoot() {

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"]);
        const sol = normalizeText(item["Possible Solution"]);
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(globalKeyword) || sol.includes(globalKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">No results found</div>`;
        return;
    }

    container.innerHTML = filtered.map((item, i) => `
        <div class="help-card">
            <div class="help-header" onclick="toggleCard('card-${i}')">
                ⚠️ ${item["Known Issue"]}
            </div>
            <div class="help-body" id="card-${i}">
                <div class="help-solution">
                 ${linkifySolution(item["Possible Solution"])}
                </div>
            </div>
        </div>
    `).join("");

    updateTabUI();
}

/* =========================
MANUAL (FIXED + CSS SUPPORT)
========================= */
function renderManual() {

    const filtered = manualData.filter(item => {

        const spec = normalizeText(item["Specification"]);
        const val = normalizeText(item["Value"]);
        const cat = normalizeText(item["Category"]);

        const q = globalKeyword;

        return (
            !q ||
            spec.includes(q) ||
            val.includes(q) ||
            cat.includes(q)
        );
    });

    const grouped = {};

    filtered.forEach(i => {
        const c = i["Category"] || "Other";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(i);
    });

    if (Object.keys(grouped).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No manual data found
            </div>
        `;
        return;
    }

    let html = `
        <div class="manual-download">
            <a class="manual-download-btn" href="#" target="_blank">
                📄 Download Owner's Manual PDF
            </a>
        </div>
    `;

    Object.keys(grouped).forEach(cat => {

        const open = globalKeyword ? "open" : "";

        html += `
        <details class="manual-section" ${open}>
            <summary>${cat}</summary>
            <div class="manual-card">
        `;

        grouped[cat].forEach(i => {
            html += `
            <div class="manual-row">
                <div class="manual-spec">${safeHighlight(i["Specification"])}</div>
                <div class="manual-value">${safeHighlight(i["Value"])}</div>
            </div>
            `;
        });

        html += `</div></details>`;
    });

    container.innerHTML = html;
    updateTabUI();
}


function openManualMatch(query) {

    if (!query) return; // 🚫 DO NOT OPEN ALL

    const q = normalizeText(query);

    const sections = document.querySelectorAll(".manual-section");

    sections.forEach(section => {

        const text = normalizeText(section.innerText);

        if (text.includes(q)) {
            section.open = true;
        } else {
            section.open = false; // optional: collapse others
        }
    });
}

/* Dictionary*/

const suggestionMap = {
    breakpads: "brake pads",
    brakepad: "brake pads",
    oilfilter: "oil filter",
    sparkpluggs: "spark plug",
    clutchshoe: "clutch shoe"
};

/*fuzzy suggestion*/

function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}

/*suggestion UI*/

function renderSuggestion() {
    const suggestionBox = document.getElementById("suggestions");

    const suggestion = getSuggestion(globalKeyword);

    if (!globalKeyword || !suggestion) {
        suggestionBox.innerHTML = "";
        return;
    }

    suggestionBox.innerHTML = `
        <div class="suggestion-item" onclick="applySuggestion('${suggestion}')">
            💡 Do you mean: <b>${suggestion}</b>?
        </div>
    `;
}

/*Apply suggestion*/

function applySuggestion(text) {
    document.getElementById("search").value = text;
    globalKeyword = normalizeText(text);
    render();
    renderSuggestion();
}

/* =========================
ACTIONS
========================= */


function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove symbols
        .replace(/\s+/g, " ")
        .trim();
}

function matchWords(text, query) {
    if (!query) return true;

    const words = text.split(" ");
    const q = query.trim();

    return words.includes(q);
}

function getEmptyStateMessage() {
    if (globalKeyword) {
        return `No results found for "<b>${globalKeyword}</b>"`;
    }
    return "No items available";
}

function resetFilters() {
    globalKeyword = "";
    manualSearch = "";

    document.getElementById("search").value = "";

    renderChips();
    render();
}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";
    renderChips();
    render();
    updateSearchPlaceholder();
}

/* =========================
SEARCH
========================= */

function openManualMatch(query) {
    const q = normalizeText(query);

    const sections = document.querySelectorAll(".manual-section");

    sections.forEach(section => {
        const text = section.innerText.toLowerCase();

        if (text.includes(q)) {
            section.open = true; // auto expand
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

function updateSearchPlaceholder() {
    const search = document.getElementById("search");

    if (currentTab === "manual") {
        search.placeholder = "What do you want? (e.g. oil capacity, torque spec)";
    } else if (currentTab === "troubleshoot") {
        search.placeholder = "Search issues (e.g. no power, check engine light on, vibration)";
    } else {
        search.placeholder = "Search parts (e.g. bearing, seat cover, brake pads)";
    }
}

document.getElementById("search").addEventListener("input", e => {
    globalKeyword = normalizeText(e.target.value);

    render();

});



window.closeModal = closeModal;
window.openModal = openModal;

/* =========================
INIT
========================= */
renderSkeleton();

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");
