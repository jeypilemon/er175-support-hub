let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

let manualData = [];
let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];

const ownersManualPDF =
"https://drive.google.com/file/d/1xJyf7sNn1Nlo7X4r0a3X6W_R5pUabHbQ/view";

const products = document.getElementById("products");

/* =========================
GLOBAL STATE (PUT HERE)
========================= */

const state = {
    tab: "aftermarket",
    category: "All",
    keyword: "",
    data: {
        aftermarket: [],
        oem: [],
        troubleshoot: [],
        manual: []
    }
};

/* =========================
LOAD DATA
========================= */

function loadManual(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            manualData = res.data.filter(x => x["Category"]);
            renderChips();
            render();
        }
    });
}

function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            oemParts = res.data.filter(p => p["Parts Name"]);
            renderChips();
            render();
        }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            troubleshootData = res.data.filter(p => p["Known Issue"]);
            renderChips();
            render();
        }
    });
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

function highlight(text) {
    if (!globalKeyword) return text || "";
    const reg = new RegExp(globalKeyword, "ig");
    return (text || "").replace(reg, m => `<mark>${m}</mark>`);
}

/* =========================
LINKIFY (FIXED BUTTONS)
========================= */

function linkifySolution(text) {
    if (!text) return "";

    let formatted = text.replace(/\n/g, "<br>");

    // YouTube
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?youtube\.com\/[^\s<]+)/g,
        (url) => `
            <div style="margin:6px 0;">
                <span></span>
                <a class="inline-link youtube" href="${url}" target="_blank">
                    ▶ Watch YouTube
                </a>
            </div>
        `
    );

    // TikTok
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?tiktok\.com\/[^\s<]+)/g,
        (url) => `
            <div style="margin:6px 0;">
                <a class="inline-link tiktok" href="${url}" target="_blank">
                    🎵 Watch TikTok
                </a>
            </div>
        `
    );

    // Facebook
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?facebook\.com\/[^\s<]+)/g,
        (url) => `
            <div style="margin:6px 0;">
                <a class="inline-link facebook" href="${url}" target="_blank">
                    📘 View Facebook
                </a>
            </div>
        `
    );

    return formatted;
}

/* =========================
TOGGLE TROUBLESHOOT CARDS
========================= */

function toggleCard(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const isOpen = el.classList.contains("open");

    document.querySelectorAll(".help-body.open")
        .forEach(x => x.classList.remove("open"));

    if (!isOpen) {
        el.classList.add("open");
    }
}


function updateTabUI() {
    document.querySelectorAll(".tabs button")
        .forEach(btn => btn.classList.remove("active"));

    const activeBtn = document.querySelector(
        `.tabs button[data-tab="${currentTab}"]`
    );

    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}



/* =========================
RENDER MAIN
========================= */

function render() {
    const container = document.getElementById("products");
    container.classList.remove("manual-mode", "grid-layout");

    container.innerHTML = "";

if (currentTab === "aftermarket" || currentTab === "oem") {
    container.classList.add("grid-layout");
} else {
    container.classList.remove("grid-layout");
}    

    if (currentTab === "manual") {
        renderManual();
        return;
    }

    if (currentTab === "troubleshoot") {
        renderTroubleshoot();
        return;
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

    container.innerHTML = filtered.map(part => {

        let meta = "";

        if (currentTab === "aftermarket") {
            meta = `
                <div class="meta">
                    ${part["Brand"] ? `<div><b>Brand:</b> ${part["Brand"]}</div>` : ""}
                    ${part["Compatibility"] ? `<div><b>Fit:</b> ${part["Compatibility"]}</div>` : ""}
                    ${part["Spec Size"] ? `<div><b>Size:</b> ${part["Spec Size"]}</div>` : ""}
                </div>
            `;
        }

        return `
        <div class="card">
            <img src="${part["Preview"] || ""}">
            <h3>${part["Parts Name"]}</h3>
            <p>${part["Parts Category"]}</p>
            ${meta}
            <a class="button" href="${part["Shopee"]}" target="_blank">
                Buy on Shopee
            </a>
        </div>
        `;
    }).join("");

    syncUI();
}

/* =========================
TROUBLESHOOT (FIXED)
========================= */

function renderTroubleshoot() {
    const container = document.getElementById("products");

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"]);
        const sol = normalizeText(item["Possible Solution"]);
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(globalKeyword) || sol.includes(globalKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    container.innerHTML = filtered.map((item, i) => {

        const id = `card-${i}`;

        return `
        <div class="help-card">

            <div class="help-header" onclick="toggleCard('${id}')">
                ⚠️ ${item["Known Issue"]}
            </div>

            <div class="help-body" id="${id}">
                <div class="help-solution">
                    ${linkifySolution(item["Possible Solution"])}
                </div>
            </div>

        </div>
        `;
    }).join("");

}

/* =========================
MANUAL (FIXED)
========================= */

function renderManual() {
    const container = document.getElementById("products");

    const filtered = (manualData || []).filter(item =>
        normalizeText(item["Category"]).includes(globalKeyword) ||
        normalizeText(item["Specification"]).includes(globalKeyword) ||
        normalizeText(item["Value"]).includes(globalKeyword)
    );

    const grouped = {};

    filtered.forEach(i => {
        const c = i["Category"] || "Other";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(i);
    });

    let html = `
    <div class="manual-download">
        <a class="manual-download-btn" href="${ownersManualPDF}" target="_blank">
            📄 Download ER175A Fi Owner's Manual (Official)
        </a>
    </div>
    `;

    Object.keys(grouped).forEach(cat => {

        html += `
        <details class="manual-section">
            <summary>${cat}</summary>
            <div class="manual-card">
        `;

        grouped[cat].forEach(i => {
            html += `
            <div class="manual-row">
                <div class="manual-spec">${highlight(i["Specification"])}</div>
                <div class="manual-value">${highlight(i["Value"])}</div>
            </div>
            `;
        });

        html += `</div></details>`;
    });

    container.innerHTML = html;
    
    syncUI();
}

/* =========================
CHIPS + TABS
========================= */

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
    syncUI();
}

function renderChips() {
    const chips = document.getElementById("chips");

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

    chips.innerHTML = cats.map(c =>
        `<button class="${c === currentCategory ? "active" : ""}" onclick="setCategory('${c}')">${c}</button>`
    ).join("");
}


/*Clean sync*/
function syncUI() {
    updateTabUI();
}

/* =========================
SEARCH
========================= */

document.getElementById("search").addEventListener("input", e => {
    globalKeyword = normalizeText(e.target.value);
    render();
});

/* =========================
INIT LOAD
========================= */

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");