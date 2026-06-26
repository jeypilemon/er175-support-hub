let currentTab = "aftermarket";
let currentCategory = "All";

let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];
let troubleshootKeyword = "";

const products = document.getElementById("products");

/* =========================
LOAD SHEETS
========================= */

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
MAIN RENDER
========================= */

function render() {
    const container = document.getElementById("products");
    container.innerHTML = "";

    if (currentTab === "troubleshoot") {
        renderTroubleshoot();
        return;
    }

    const data = currentTab === "aftermarket" ? aftermarketParts : oemParts;

    const keyword = normalizeText(document.getElementById("search")?.value || "");

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"] || "");
        const category = normalizeText(p["Parts Category"] || "");

        return (
            (name.includes(keyword) || category.includes(keyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">No results</div>`;
        return;
    }

    filtered.forEach(part => {
        container.innerHTML += `
        <div class="card">
            <img src="${part["Preview"] || ""}">
            <h3>${part["Parts Name"]}</h3>
            <p>${part["Parts Category"]}</p>

            <a class="button" href="${part["Shopee"]}" target="_blank">
                Buy on Shopee
            </a>
        </div>`;
    });
}

/* =========================
TROUBLESHOOT RENDER (FIXED)
========================= */

function renderTroubleshoot() {
    const container = document.getElementById("products");
    container.innerHTML = "";

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"] || "");
        const solution = normalizeText(item["Possible Solution"] || "");
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(troubleshootKeyword) || solution.includes(troubleshootKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    filtered.forEach((item, index) => {

        const issue = item["Known Issue"] || "";
        const solutionRaw = item["Possible Solution"] || "";

        const youtubeLinks = extractLinks(solutionRaw, "youtube.com");
        const tiktokLinks = extractLinks(solutionRaw, "tiktok.com");
        const fbLinks = extractLinks(solutionRaw, "facebook.com");

        const cleanText = linkifySolution(solutionRaw);

        container.innerHTML += `
        <div class="help-card">

            <div class="help-header" onclick="toggleCard(${index})">
                ⚠️ ${issue}
            </div>

            <div class="help-body" id="card-${index}">

                <div class="help-solution">
                    ${cleanText}
                </div>

                ${renderButtons(youtubeLinks, "youtube")}
                ${renderButtons(tiktokLinks, "tiktok")}
                ${renderButtons(fbLinks, "facebook")}

            </div>
        </div>`;
    });
}

/*safe renderButtons function to avoid errors if no links are found*/
function renderButtons() {
    return "";
}

/* =========================
LINK EXTRACTOR
========================= */

function extractLinks(text, keyword) {
    if (!text) return [];
    return (text.match(/https?:\/\/[^\s]+/g) || [])
        .filter(link => link.includes(keyword));
}

/* =========================
UI HELPERS
========================= */

function linkifySolution(text) {
    if (!text) return "";

    let formatted = text.replace(/\n/g, "<br>");

    // YouTube
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?youtube\.com\/[^\s<]+)/g,
        `<a class="inline-link youtube" href="$1" target="_blank" rel="noopener noreferrer">
            ▶ Watch YouTube
        </a>`
    );

    // TikTok
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?tiktok\.com\/[^\s<]+)/g,
        `<a class="inline-link tiktok" href="$1" target="_blank" rel="noopener noreferrer">
            🎵 Watch TikTok
        </a>`
    );

    // Facebook
    formatted = formatted.replace(
        /(https?:\/\/(www\.)?facebook\.com\/[^\s<]+)/g,
        `<a class="inline-link facebook" href="$1" target="_blank" rel="noopener noreferrer">
            📘 View in Facebook
        </a>`
    );

    return formatted;
}

function toggleCard(index) {
    const el = document.getElementById(`card-${index}`);
    if (el) el.classList.toggle("open");
}

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

/* =========================
TABS
========================= */

function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";
    renderChips();
    render();
}

/* =========================
CATEGORIES (FIXED - NO DUPLICATES)
========================= */

function getCategories(data) {
    return ["All", ...new Set(data.map(p => p["Parts Category"]).filter(Boolean))];
}

function getTroubleCategories(data) {
    const tags = data.flatMap(item =>
        (item["Tags"] || "").split(",").map(t => t.trim())
    );
    return ["All", ...new Set(tags.filter(Boolean))];
}

function renderChips() {
    const chips = document.getElementById("chips");

    let categories = [];

    if (currentTab === "troubleshoot") {
        categories = getTroubleCategories(troubleshootData);
    } else if (currentTab === "aftermarket") {
        categories = getCategories(aftermarketParts);
    } else {
        categories = getCategories(oemParts);
    }

    chips.innerHTML = categories.map(cat => `
        <button class="${currentCategory === cat ? 'active' : ''}"
            onclick="setCategory('${cat}')">
            ${cat}
        </button>
    `).join("");
}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

/* =========================
INIT
========================= */

window.addEventListener("load", () => {
    render();
});


/* =========================
DATA URLS (PUT YOUR SHEETS HERE)
========================= */

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");
