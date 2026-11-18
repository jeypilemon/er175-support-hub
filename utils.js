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

/** Damerau-Levenshtein distance: adjacent letter swaps count as one typo. */
function levenshtein(a, b) {
    a = String(a || "");
    b = String(b || "");
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
            }
        }
    }
    return matrix[a.length][b.length];
}


function compactSearchText(value) {
    return normalizeText(value).replace(/\\s+/g, "");
}

function scoreSearchText(value, query) {
    const text = normalizeText(value);
    const q = normalizeText(query);
    if (!q || !text) return 0;
    if (text.includes(q)) return 100;

    const compactText = compactSearchText(text);
    const compactQuery = compactSearchText(q);
    if (compactQuery.length >= 3 && compactText.includes(compactQuery)) return 96;

    const queryWords = q.split(" ").filter(Boolean);
    const textWords = text.split(" ").filter(Boolean);
    let totalDistance = 0;
    let exactOrPrefix = 0;

    for (const queryWord of queryWords) {
        let best = Infinity;
        let exact = false;
        for (const textWord of textWords) {
            if (textWord === queryWord) { best = 0; exact = true; break; }
            if (textWord.startsWith(queryWord) || queryWord.startsWith(textWord)) {
                const gap = Math.abs(textWord.length - queryWord.length);
                if (gap < best) { best = gap; exact = true; }
                continue;
            }
            if (Math.min(queryWord.length, textWord.length) < 4) continue;
            const limit = Math.max(queryWord.length, textWord.length) >= 8 ? 2 : 1;
            if (Math.abs(queryWord.length - textWord.length) > limit) continue;
            const distance = levenshtein(queryWord, textWord);
            if (distance <= limit && distance < best) { best = distance; exact = false; }
        }
        if (!Number.isFinite(best)) return 0;
        totalDistance += best;
        if (exact) exactOrPrefix++;
    }
    const score = 70 + exactOrPrefix * 3 - totalDistance * 7 - Math.max(0, textWords.length - queryWords.length);
    return score >= 50 ? score : 0;
}

function getPartSearchScore(item, query) {
    if (!item || !normalizeText(query)) return 1;
    const fields = [
        [item["Parts Name"], 1],
        [item["Parts Category"], 0.96],
        [item["Brand"], 0.88],
        [item["Compatibility"], 0.82]
    ];
    const alias = typeof getSuggestion === "function" ? getSuggestion(query) : null;
    let best = 0;
    for (const [value, weight] of fields) {
        best = Math.max(best, scoreSearchText(value, query) * weight);
        if (alias) best = Math.max(best, scoreSearchText(value, alias) * weight * 0.94);
    }
    return best;
}

function findAutoSuggestion(query) {
    const q = normalizeText(query);
    if (q.length < 3) return null;
    const rows = typeof getSearchablePartRows === "function" ? getSearchablePartRows() : [];
    let bestItem = null, bestScore = 0;
    for (const item of rows) {
        const name = String(item["Parts Name"] || "").trim();
        const score = scoreSearchText(name, q);
        if (score > bestScore) { bestScore = score; bestItem = item; }
    }
    return bestItem && bestScore >= 50 && bestScore < 100
        ? String(bestItem["Parts Name"] || "").trim() : null;
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

    const rankedProducts = rows
        .map(item => ({ item, score: getPartSearchScore(item, query) }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);
    const correction = getSuggestion(query) || findAutoSuggestion(query);
    const products = rankedProducts.slice(0, 5).map(result => result.item);

    const categories = [...new Set(rows
        .map(item => String(item["Parts Category"] || "").trim())
        .filter(Boolean)
        .map(category => ({ category, score: scoreSearchText(category, query) }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(result => result.category))].slice(0, 3);

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
        const query = escapeHTML(searchQuery);
        const hasCategoryFilter = (currentTab === "aftermarket" || currentTab === "oem")
            && currentCategory !== "All";

        if (hasCategoryFilter) {
            return `
                <div class="empty-search-message">
                    <strong>No results found for "${query}"</strong>
                    <p>You're currently searching within the <b>${escapeHTML(currentCategory)}</b> category.</p>
                    <p>For a broader search across all parts, select <b>All</b> category.</p>
                    <button type="button" class="empty-search-reset" onclick="setCategory('All')">Show all categories</button>
                </div>
            `;
        }

        return `No results found for "<b>${query}</b>"`;
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