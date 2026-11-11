/** Escape text before inserting spreadsheet/user-provided values into HTML. */
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

/** Accept only HTTP(S) URLs before using spreadsheet values for navigation or media. */
function getSafeHttpUrl(value, base = window.location.href) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    try {
        const parsed = new URL(raw, base);
        return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch {
        return "";
    }
}

/** Normalize text consistently while retaining accented and non-Latin letters. */
function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Cache normalized spreadsheet fields between renders. The original value is
 * checked on every access, so editing a record invalidates its cached value.
 * WeakMap avoids keeping removed spreadsheet rows alive in memory.
 */
const normalizedFieldCache = new WeakMap();

function getNormalizedField(record, field) {
    if (!record || typeof record !== "object") {
        return normalizeText(record);
    }

    const rawValue = record[field] ?? "";
    let fields = normalizedFieldCache.get(record);

    if (!fields) {
        fields = new Map();
        normalizedFieldCache.set(record, fields);
    }

    const cached = fields.get(field);
    if (cached && cached.rawValue === rawValue) {
        return cached.normalizedValue;
    }

    const normalizedValue = normalizeText(rawValue);
    fields.set(field, { rawValue, normalizedValue });
    return normalizedValue;
}

/** Return escaped text with only the matching query wrapped in <mark>. */
function safeHighlight(value) {
    const text = String(value ?? "");
    const safeText = escapeHTML(text);
    const query = normalizeText(searchQuery);
    if (!query) return safeText;

    // Search normalization can remove punctuation; match the normalized text
    // as a whole when direct highlighting would produce misleading offsets.
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escapedQuery, "gi");
    if (!expression.test(normalizeText(text))) return safeText;

    // Highlighting is intentionally conservative for Unicode/punctuation-heavy
    // text: it avoids injecting markup into untrusted source content.
    const rawQuery = String(searchQuery ?? "").trim();
    if (!rawQuery) return safeText;
    const rawExpression = new RegExp(rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return safeText.replace(rawExpression, match => `<mark>${match}</mark>`);
}

function matchWords(text, query){

    if(!query) return true;

    const normalizedText = normalizeText(text);

    const words = normalizeText(query).split(" ");

    return words.every(word =>
        normalizedText.includes(word)
    );

}

function getAllSearchTerms(){

    let data = [];


    if(currentTab === "aftermarket"){

        data = aftermarketParts;

    }

    else if(currentTab === "oem"){

        data = oemParts;

    }

    else if(currentTab === "diagnostics"){

        data = efiData;

    }



    let terms = [];


    data.forEach(item=>{


        let fields = [];


        if(currentTab==="aftermarket" || currentTab==="oem"){

            fields = [

    item["Parts Name"],
    item["Parts Category"],
    item["Brand"],
    item["Compatibility"],

            ];

        }



        if(currentTab==="diagnostics"){

            fields = [

                item["Error / Symptom"],
                item["Component / System"]

            ];

        }



        fields.forEach(value=>{


            if(value){

                terms.push(value.trim());

            }


        });



    });



    return [...new Set(terms)];

}

function levenshtein(a,b){

    const matrix=[];


    for(let i=0;i<=b.length;i++){

        matrix[i]=[i];

    }


    for(let j=0;j<=a.length;j++){

        matrix[0][j]=j;

    }



    for(let i=1;i<=b.length;i++){

        for(let j=1;j<=a.length;j++){


            if(b[i-1]===a[j-1]){

                matrix[i][j]=matrix[i-1][j-1];

            }

            else{

                matrix[i][j]=Math.min(
                    matrix[i-1][j-1]+1,
                    matrix[i][j-1]+1,
                    matrix[i-1][j]+1
                );

            }

        }

    }


    return matrix[b.length][a.length];

}


function findAutoSuggestion(query){

    const q = normalizeText(query);

    const terms = getAllSearchTerms();


    for(let term of terms){

        const clean = normalizeText(term);


        if(clean.includes(q)){

            return term;

        }

    }


    return null;

}


function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}


const SEARCH_RECENTS_KEY = "er175-search-recents-v1";
const SEARCH_RECENTS_LIMIT = 6;

function getSearchablePartRows() {
    if (currentTab === "oem") return Array.isArray(oemParts) ? oemParts : [];
    if (currentTab === "aftermarket") return Array.isArray(aftermarketParts) ? aftermarketParts : [];
    return [];
}

function getRecentSearches() {
    try {
        const value = JSON.parse(localStorage.getItem(SEARCH_RECENTS_KEY) || "[]");
        return Array.isArray(value) ? value.filter(item => typeof item === "string").slice(0, SEARCH_RECENTS_LIMIT) : [];
    } catch (_) {
        return [];
    }
}

function saveRecentSearch(value) {
    const clean = String(value || "").trim();
    if (clean.length < 2) return;
    try {
        const normalized = normalizeText(clean);
        const next = [clean, ...getRecentSearches().filter(item => normalizeText(item) !== normalized)]
            .slice(0, SEARCH_RECENTS_LIMIT);
        localStorage.setItem(SEARCH_RECENTS_KEY, JSON.stringify(next));
    } catch (_) {
        // Search remains fully usable when storage is unavailable.
    }
}

function renderSuggestion() {
    const box = document.getElementById("suggestions");
    if (!box) return;

    const query = normalizeText(searchQuery);
    const rows = getSearchablePartRows();

    if (query.length < 2) {
        if (typeof renderPopularSearches === "function") renderPopularSearches();
        const recent = getRecentSearches();
        box.innerHTML = recent.length ? `
            <div class="search-suggestion-panel">
                <div class="search-suggestion-heading">Recent searches</div>
                <div class="search-suggestion-list">
                    ${recent.map(item => `<button type="button" class="search-suggestion-item search-recent-item" data-search-value="${escapeHTML(item)}"><span class="search-suggestion-icon">↻</span><span>${escapeHTML(item)}</span></button>`).join("")}
                </div>
            </div>` : "";
        box.classList.toggle("is-open", recent.length > 0);
        return;
    }

    const correction = getSuggestion(query) || findAutoSuggestion(query);
    const products = rows.filter(item => {
        const name = getNormalizedField(item, "Parts Name");
        const category = getNormalizedField(item, "Parts Category");
        const brand = getNormalizedField(item, "Brand");
        const compatibility = getNormalizedField(item, "Compatibility");
        return name.includes(query) || category.includes(query) || brand.includes(query) || compatibility.includes(query);
    }).slice(0, 5);

    const categories = [...new Set(rows
        .map(item => String(item["Parts Category"] || "").trim())
        .filter(Boolean)
        .filter(category => normalizeText(category).includes(query)))].slice(0, 3);

    if (!correction && !products.length && !categories.length) {
        box.innerHTML = "";
        box.classList.remove("is-open");
        return;
    }

    box.innerHTML = `
        <div class="search-suggestion-panel">
            ${correction && normalizeText(correction) !== query ? `
                <div class="search-suggestion-correction">
                    <span>💡 Did you mean</span>
                    <button type="button" data-search-value="${escapeHTML(correction)}">${escapeHTML(correction)}</button>
                </div>` : ""}
            ${products.length ? `
                <div class="search-suggestion-heading">Matching products</div>
                <div class="search-suggestion-list">
                    ${products.map(item => `
                        <button type="button" class="search-suggestion-item" data-search-value="${escapeHTML(item["Parts Name"] || "")}">
                            <span class="search-suggestion-icon">⌕</span>
                            <span class="search-suggestion-copy"><strong>${escapeHTML(item["Parts Name"] || "Unnamed part")}</strong><small>${escapeHTML(item["Parts Category"] || "Product")}${item["Brand"] ? ` · ${escapeHTML(item["Brand"])}` : ""}</small></span>
                            <span class="search-suggestion-arrow">↗</span>
                        </button>`).join("")}
                </div>` : ""}
            ${categories.length ? `
                <div class="search-suggestion-heading">Categories</div>
                <div class="search-suggestion-categories">
                    ${categories.map(category => `<button type="button" class="search-suggestion-category" data-category-value="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("")}
                </div>` : ""}
        </div>`;
    box.classList.add("is-open");
}

function closeSearchSuggestions() {
    const box = document.getElementById("suggestions");
    if (box) box.classList.remove("is-open");
}

function selectSearchSuggestion(value) {
    const clean = String(value || "").trim();
    if (!clean) return;
    const input = document.getElementById("search");
    if (input) input.value = clean;
    searchQuery = normalizeText(clean);
    saveRecentSearch(clean);
    if (typeof trackSharedSearch === "function") trackSharedSearch(clean);
    render();
    closeSearchSuggestions();
}

function selectSearchCategory(category) {
    currentCategory = category;
    searchQuery = "";
    const input = document.getElementById("search");
    if (input) input.value = "";
    renderChips();
    render();
    closeSearchSuggestions();
}

function applySuggestion(text) {
    selectSearchSuggestion(text);
}

/*fuzzy suggestion*/

function getEmptyStateMessage() {
    if (searchQuery) {
        return `No results found for "<b>${searchQuery}</b>"`;
    }
    return "No items available";
}


/* Dictionary*/

const suggestionMap = {
    breakpads: "brake pads",
    brakepad: "brake pads",
    oilfilter: "oil filter",
    sparkpluggs: "spark plug",
    clutchshoe: "clutch shoe"
};

/*Toast and copylink*/

async function copyAffiliateLink(link){

    try{

        await navigator.clipboard.writeText(link);

        showToast("Link Copied!");

    }catch(error){

        // Older browsers fallback

        const input = document.createElement("input");

        input.value = link;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        document.body.removeChild(input);

        showToast("Link Copied!");

    }

}