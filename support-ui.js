function openGCashSupport(options = {}) {
    const modal = document.getElementById('gcashSupportModal');
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    if (options.automatic) {
        try { localStorage.setItem('er175SupportPromptNextAt', String(Date.now() + 7 * 24 * 60 * 60 * 1000)); } catch (_) {}
    }
}

function closeGCashSupport() {
    const modal = document.getElementById('gcashSupportModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGCashSupport();
});

// Invite support only after 90 seconds of visible browsing and meaningful product engagement.
// Engagement means viewing at least two product cards or clicking an affiliate purchase link.
(function scheduleSupportInvitation() {
    const MIN_VISIBLE_MS = 90 * 1000;
    const REQUIRED_PRODUCT_VIEWS = 2;
    let visibleMs = 0;
    let lastTick = Date.now();
    let productViews = new Set();
    let affiliateClicked = false;
    let shown = false;
    let intervalId = null;
    let observer = null;

    const nextAllowedAt = () => {
        try { return Number(localStorage.getItem('er175SupportPromptNextAt') || 0); } catch (_) { return 0; }
    };

    const blockersOpen = () => {
        const blockers = [
            document.getElementById('explainerModal'),
            document.getElementById('whatsNewModal'),
            document.getElementById('linkModal'),
            document.getElementById('imageModal'),
            document.getElementById('componentModal'),
            document.getElementById('efiDiagnosisModal')
        ].filter(Boolean);
        return blockers.some(el => el.classList.contains('is-open') || el.classList.contains('show'));
    };

    const engagementReached = () => affiliateClicked || productViews.size >= REQUIRED_PRODUCT_VIEWS;

    const tryShow = () => {
        if (shown) return true;
        if (Date.now() < nextAllowedAt()) {
            if (intervalId) window.clearInterval(intervalId);
            return true;
        }
        if (visibleMs < MIN_VISIBLE_MS || !engagementReached()) return false;
        const modal = document.getElementById('gcashSupportModal');
        if (!modal || modal.classList.contains('show')) return false;
        if (document.visibilityState !== 'visible' || blockersOpen()) return false;

        shown = true;
        openGCashSupport({ automatic: true });
        if (intervalId) window.clearInterval(intervalId);
        if (observer) observer.disconnect();
        return true;
    };

    const observeCards = () => {
        if (!('IntersectionObserver' in window)) return;
        if (!observer) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const card = entry.target;
                        if (card.dataset.supportCounted !== '1') {
                            card.dataset.supportCounted = '1';
                            productViews.add(card);
                        }
                    }
                });
                tryShow();
            }, { threshold: [0.5] });
        }
        document.querySelectorAll('#products .card:not([data-support-observed])').forEach(card => {
            card.dataset.supportObserved = '1';
            observer.observe(card);
        });
    };

    const start = () => {
        if (Date.now() < nextAllowedAt()) return;
        observeCards();
        const products = document.getElementById('products');
        if (products && 'MutationObserver' in window) {
            const mutations = new MutationObserver(observeCards);
            mutations.observe(products, { childList: true, subtree: true });
        }

        document.addEventListener('click', event => {
            const link = event.target.closest('.card-actions a.button-shopee, .card-actions a.button-lazada, .card-actions a.button-tiktok');
            if (link) {
                affiliateClicked = true;
                tryShow();
            }
        });

        intervalId = window.setInterval(() => {
            const now = Date.now();
            if (document.visibilityState === 'visible') visibleMs += Math.min(now - lastTick, 1500);
            lastTick = now;
            tryShow();
        }, 1000);

        document.addEventListener('visibilitychange', () => {
            lastTick = Date.now();
            if (document.visibilityState === 'visible') {
                observeCards();
                tryShow();
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
