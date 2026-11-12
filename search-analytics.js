/* Shared search analytics. Disabled safely until APP_CONFIG.analytics.endpoint is configured. */
const SEARCH_ANALYTICS_ENDPOINT = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.analytics)
    ? String(APP_CONFIG.analytics.endpoint || '').trim() : '';
let popularSearchesCache = [];
let popularSearchesLoaded = false;
let searchTrackTimer = null;
let mostSearchedProductsCache = [];
let mostSearchedProductsRendered = false;

function trackSharedSearch(value) {
    const query = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (!SEARCH_ANALYTICS_ENDPOINT || query.length < 2) return;
    clearTimeout(searchTrackTimer);
    searchTrackTimer = setTimeout(() => {
        try {
            fetch(SEARCH_ANALYTICS_ENDPOINT, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'track', query })
            }).catch(() => {});
        } catch (_) { /* Analytics must never block search. */ }
    }, 250);
}

async function loadPopularSearches() {
    if (!SEARCH_ANALYTICS_ENDPOINT || popularSearchesLoaded) return popularSearchesCache;
    try {
        const response = await fetch(SEARCH_ANALYTICS_ENDPOINT, { method: 'GET', cache: 'no-store' });
        if (!response.ok) throw new Error('Analytics unavailable');
        const data = await response.json();
        popularSearchesCache = Array.isArray(data.popular) ? data.popular.slice(0, 5) : [];
        popularSearchesLoaded = true;
    } catch (_) { popularSearchesCache = []; }
    return popularSearchesCache;
}

async function renderPopularSearches() {
    const box = document.getElementById('popularSearches');
    if (!box || !SEARCH_ANALYTICS_ENDPOINT) return;
    const rows = await loadPopularSearches();
    if (!rows.length || searchQuery.trim().length >= 2) { box.hidden = true; return; }
    box.innerHTML = `<div class="search-suggestion-heading">Trending</div><div class="search-suggestion-list">${rows.map((item, index) => `<button type="button" class="search-suggestion-item" data-search-value="${escapeHTML(item.query)}"><span class="search-suggestion-icon">${index + 1}</span><span class="search-suggestion-copy"><strong>${escapeHTML(item.query)}</strong></span></button>`).join('')}</div>`;
    box.hidden = false;
}
