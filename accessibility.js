/*
 * ER175 Hub accessibility helpers.
 * Intentionally additive: does not replace existing modal, tab, or navigation logic.
 */
(function () {
    "use strict";

    const modalSelectors = ["#linkModal", "#imageModal", "#componentModal", "#efiDiagnosisModal"];
    const modalState = new Map();
    const focusableSelector = [
        'a[href]', 'button:not([disabled])', 'input:not([disabled])',
        'select:not([disabled])', 'textarea:not([disabled])',
        'iframe', '[tabindex]:not([tabindex="-1"])'
    ].join(",");

    function isVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" &&
            (element.classList.contains("show") || element.getAttribute("aria-hidden") === "false");
    }

    function visibleModals() {
        return modalSelectors.map(selector => document.querySelector(selector)).filter(isVisible);
    }

    function focusables(modal) {
        return Array.from(modal.querySelectorAll(focusableSelector)).filter(el =>
            el.getClientRects().length && !el.hasAttribute("hidden")
        );
    }

    function syncModal(modal) {
        if (!modal) return;
        const open = modal.classList.contains("show");
        const previous = modalState.get(modal) || false;
        modal.setAttribute("aria-hidden", open ? "false" : "true");
        if (open && !previous) {
            modalState.set(modal, true);
            const active = document.activeElement;
            modal.dataset.returnFocusId = active && active.id ? active.id : "";
            window.setTimeout(() => {
                const target = modal.querySelector("button:not([disabled]), iframe, [tabindex='0']");
                if (target && modal.classList.contains("show")) {
                    if (target.tagName === "IFRAME") {
                        const close = modal.querySelector("button");
                        if (close) close.focus();
                    } else target.focus();
                }
            }, 0);
        } else if (!open && previous) {
            modalState.set(modal, false);
            const id = modal.dataset.returnFocusId;
            const returnTarget = id ? document.getElementById(id) : null;
            if (returnTarget && returnTarget.isConnected) returnTarget.focus();
        } else {
            modalState.set(modal, open);
        }
    }

    function syncAll() {
        modalSelectors.forEach(selector => syncModal(document.querySelector(selector)));
    }

    document.addEventListener("keydown", event => {
        const modals = visibleModals();
        const modal = modals[modals.length - 1];
        if (!modal) return;

        if (event.key === "Escape") {
            const closeButton = modal.querySelector("button[aria-label*='Close'], button.close-modal, button.image-close, button.component-close, button.efi-modal-close");
            if (closeButton) {
                event.preventDefault();
                closeButton.click();
            }
            return;
        }

        if (event.key === "Tab") {
            const items = focusables(modal);
            if (!items.length) {
                event.preventDefault();
                modal.setAttribute("tabindex", "-1");
                modal.focus();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        }
    });

    // Observe existing class-based modal behavior without changing its open/close functions.
    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "attributes" && record.attributeName === "class") syncModal(record.target);
        }
    });

    function initialize() {
        modalSelectors.forEach(selector => {
            const modal = document.querySelector(selector);
            if (modal) {
                modal.setAttribute("aria-hidden", modal.classList.contains("show") ? "false" : "true");
                modalState.set(modal, modal.classList.contains("show"));
                observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
            }
        });

        const search = document.getElementById("search");
        if (search && !search.getAttribute("aria-label")) {
            search.setAttribute("aria-label", "Search parts, guides and technical information");
        }

        // Keep selected navigation state available to assistive technology.
        document.querySelectorAll(".seg[data-tab]").forEach(button => {
            button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
        });

        const tabObserver = new MutationObserver(() => {
            document.querySelectorAll(".seg[data-tab]").forEach(button => {
                button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
            });
        });
        const tabContainer = document.querySelector(".segmented");
        if (tabContainer) tabObserver.observe(tabContainer, { subtree: true, attributes: true, attributeFilter: ["class"] });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
    else initialize();
})();
