/* Shared search analytics. Disabled safely until APP_CONFIG.analytics.endpoint is configured. */
const SEARCH_ANALYTICS_ENDPOINT = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.analytics)
    ? String(APP_CONFIG.analytics.endpoint || '').trim() : '';
let popularSearchesCache = [];
let popularSearchesLoaded = false;
let popularSearchesLastFetchedAt = 0;
let popularSearchesRequest = null;
let searchTrackTimer = null;
let mostSearchedProductsCache = [];
let mostSearchedProductsRendered = false;

const POPULAR_SEARCHES_LIMIT = 10;
const POPULAR_SEARCHES_REFRESH_MS = 60 * 1000;

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

async function loadPopularSearches(forceRefresh = false) {
    if (!SEARCH_ANALYTICS_ENDPOINT) return popularSearchesCache;

    const cacheIsFresh = Date.now() - popularSearchesLastFetchedAt < POPULAR_SEARCHES_REFRESH_MS;
    if (!forceRefresh && popularSearchesLoaded && cacheIsFresh) return popularSearchesCache;
    if (popularSearchesRequest) return popularSearchesRequest;

    popularSearchesRequest = (async () => {
        try {
            const response = await fetch(SEARCH_ANALYTICS_ENDPOINT, {
                method: 'GET',
                cache: 'no-store'
            });
            if (!response.ok) throw new Error('Analytics unavailable');

            const data = await response.json();
            if (!data || data.ok === false || !Array.isArray(data.popular)) {
                throw new Error('Invalid analytics response');
            }

            popularSearchesCache = data.popular
                .filter(item => item && String(item.query || '').trim())
                .slice(0, POPULAR_SEARCHES_LIMIT);
            popularSearchesLoaded = true;
            popularSearchesLastFetchedAt = Date.now();
        } catch (_) {
            // Keep the last successful ranking visible if a refresh temporarily fails.
            if (!popularSearchesLoaded) popularSearchesCache = [];
        } finally {
            popularSearchesRequest = null;
        }
        return popularSearchesCache;
    })();

    return popularSearchesRequest;
}

async function renderPopularSearches(forceRefresh = false) {
    const box = document.getElementById('popularSearches');
    if (!box) return;

    // Trending Parts belongs only to the Parts section, not DIY Guides or other tabs.
    if (currentTab !== 'aftermarket' && currentTab !== 'oem') {
        box.hidden = true;
        return;
    }
    if (!SEARCH_ANALYTICS_ENDPOINT) {
        box.hidden = true;
        return;
    }

    const rows = await loadPopularSearches(forceRefresh);
    if (!rows.length || searchQuery.trim().length >= 2) {
        box.hidden = true;
        return;
    }

    box.innerHTML = `
        <div class="trending-heading"><span class="search-suggestion-heading">Trending Parts</span></div>
        <div class="trending-rail">
            <div class="search-suggestion-list trending-list" id="trendingList">
                ${rows.map((item, index) => `
                    <button type="button" class="search-suggestion-item trending-chip trending-rank-${index + 1}" data-search-value="${escapeHTML(item.query)}" aria-label="Search ${escapeHTML(item.query)}, rank ${index + 1}">
                        <span class="search-suggestion-icon">${index + 1}</span>
                        <span class="search-suggestion-copy"><strong>${escapeHTML(item.query)}</strong></span>
                    </button>
                `).join('')}
            </div>
            <button type="button" class="trending-next" aria-label="Scroll trending parts" onclick="scrollTrendingParts()">›</button>
        </div>`;
    box.hidden = false;
    const trendingList = document.getElementById('trendingList');
    trendingList?.addEventListener('scroll', updateTrendingArrow, { passive: true });
    updateTrendingArrow();
}

function updateTrendingArrow() {
    const list = document.getElementById('trendingList');
    const arrow = document.querySelector('#popularSearches .trending-next');
    if (!list || !arrow) return;
    const canScroll = list.scrollWidth > list.clientWidth + 4;
    arrow.hidden = !canScroll;
    arrow.disabled = !canScroll || list.scrollLeft + list.clientWidth >= list.scrollWidth - 4;
}

function scrollTrendingParts() {
    const list = document.getElementById('trendingList');
    if (!list) return;
    list.scrollBy({ left: Math.max(160, Math.round(list.clientWidth * 0.72)), behavior: 'smooth' });
    window.setTimeout(updateTrendingArrow, 350);
}

// Refresh the shared ranking periodically and when the visitor returns to this tab.
function startPopularSearchesRefresh() {
    if (window.__er175TrendingRefreshStarted) return;
    window.__er175TrendingRefreshStarted = true;
    window.setInterval(() => {
        if (document.visibilityState === 'visible') renderPopularSearches(true);
    }, POPULAR_SEARCHES_REFRESH_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') renderPopularSearches(true);
    });
    window.addEventListener('resize', updateTrendingArrow);
}

startPopularSearchesRefresh();
