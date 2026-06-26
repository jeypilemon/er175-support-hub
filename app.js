let currentTab = "aftermarket";
let currentCategory = "All";
let aftermarketParts = [];
let oemParts = [];

const products = document.getElementById("products");

/* ---------------------------
LOAD AFTERMARKET SHEET
----------------------------*/
function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(res) {
            aftermarketParts = res.data;
            renderChips();
            render();
        }
    });
}

/* ---------------------------
LOAD OEM SHEET
----------------------------*/
function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(res) {
            oemParts = res.data;
            renderChips();
            render();
        }
    });
}

/* ---------------------------
RENDER FUNCTION
----------------------------*/
function render() {

    let data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const keyword = document.getElementById("search").value.toLowerCase();

    let filtered = data.filter(p => {

        const matchSearch =
            (p["Parts Name"] || "").toLowerCase().includes(keyword) ||
            (p["Parts Category"] || "").toLowerCase().includes(keyword);

        const matchCategory =
            currentCategory === "All" ||
            p["Parts Category"] === currentCategory;

        return matchSearch && matchCategory;
    });

    products.innerHTML = "";

if (filtered.length === 0) {
    products.innerHTML = `
        <div class="empty-state">
            ❌ No results found
            <p>Try different keywords or category</p>
        </div>
    `;
    return;
}

    filtered.forEach(part => {

        let extra = "";

        if (currentTab === "aftermarket") {
            extra = `
                <div class="meta">
                    <span>🏷 Brand: ${part["Brand"] || "-"}</span>
                    <span>🔧 Compatibility: ${part["Compatibility"] || "-"}</span>
                    <span>📏 Specs/Size: ${part["Spec Size"] || "-"}</span>
                </div>
            `;
        }

        if (currentTab === "oem") {
            extra = `
                <div class="meta">
                    <span>🎨 Color: ${part["Color"] || "-"}</span>
                </div>
            `;
        }

        products.innerHTML += `
        <div class="card">

            <img src="${part["Preview"] || ''}" loading="lazy">

            <h3>${part["Parts Name"]}</h3>

            <p><b>Category:</b> ${part["Parts Category"]}</p>

            ${extra}

            <a class="button" href="${part["Shopee"]}" target="_blank">
                Buy on Shopee
            </a>

        </div>
        `;
    });
}

/* tab logic */
function updateTabUI() {

    document.getElementById("tab-aftermarket")
        .classList.remove("active");

    document.getElementById("tab-oem")
        .classList.remove("active");

    if (currentTab === "aftermarket") {
        document.getElementById("tab-aftermarket")
            .classList.add("active");
    }

    if (currentTab === "oem") {
        document.getElementById("tab-oem")
            .classList.add("active");
    }
}

/* ---------------------------
TAB SWITCH
----------------------------*/
function switchTab(tab) {
    currentTab = tab;
    currentCategory = "All";

    updateTabUI();   // 🔥 highlight tabs
    renderChips();
    render();
}

/* ---------------------------
SEARCH
----------------------------*/
document.addEventListener("input", (e) => {
    if (e.target.id === "search") {
        render();
    }
});


//category logic    
function setCategory(cat) {
    currentCategory = cat;
    renderChips();   // 🔥 IMPORTANT: refresh chips UI
    render();
}


//Category filter
function getCategories(data) {

    const cats = data
        .map(p => p["Parts Category"])
        .filter(Boolean);

    return ["All", ...new Set(cats)];
}

//Render category chips
function renderChips() {

    const chips = document.getElementById("chips");

    let data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const categories = getCategories(data);

    chips.innerHTML = "";

    categories.forEach(cat => {

        chips.innerHTML += `
        <button class="chip ${currentCategory === cat ? 'active' : ''}"
        onclick="setCategory('${cat}')">
            ${cat}
        </button>
        `;
    });
}


window.addEventListener("load", () => {
    renderChips();
});


/* ---------------------------
INIT
----------------------------*/
loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");


updateTabUI();