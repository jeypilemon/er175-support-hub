function openGCashSupport(options = {}) {
    const modal = document.getElementById('gcashSupportModal');
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    // Only the automatic invitation counts as the timed prompt being seen.
    // Opening the support panel manually must not cancel the one-minute invite.
    if (options.automatic) {
        try { sessionStorage.setItem('er175SupportPromptSeen', '1'); } catch (_) {}
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

// Show the support invitation once 60 seconds after page initialization.
// If another modal is open at the 60-second mark, show it immediately after
// that modal closes rather than restarting the timer or silently skipping it.
(function scheduleSupportInvitation() {
    const delayMs = 60 * 1000;
    let elapsed = false;
    let intervalId = null;

    const tryShow = () => {
        let alreadySeen = false;
        try { alreadySeen = sessionStorage.getItem('er175SupportPromptSeen') === '1'; } catch (_) {}
        if (alreadySeen) {
            if (intervalId) window.clearInterval(intervalId);
            return true;
        }

        const modal = document.getElementById('gcashSupportModal');
        if (!modal || modal.classList.contains('show')) return false;

        const blockers = [
            document.getElementById('explainerModal'),
            document.getElementById('whatsNewModal'),
            document.getElementById('linkModal'),
            document.getElementById('imageModal')
        ].filter(Boolean);
        const anotherDialogOpen = blockers.some(el =>
            el.classList.contains('is-open') || el.classList.contains('show')
        );
        if (document.visibilityState !== 'visible' || anotherDialogOpen) return false;

        openGCashSupport({ automatic: true });
        if (intervalId) window.clearInterval(intervalId);
        return true;
    };

    window.setTimeout(() => {
        elapsed = true;
        if (!tryShow()) intervalId = window.setInterval(tryShow, 500);
    }, delayMs);

    // If the visitor returns to the tab after the minute has elapsed, check
    // immediately instead of waiting for another interval tick.
    document.addEventListener('visibilitychange', () => {
        if (elapsed && document.visibilityState === 'visible') tryShow();
    });
})();
