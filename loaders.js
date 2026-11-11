/**
 * Shared diagnostics and CSV loading primitives for published Google Sheets.
 * Dataset-specific functions below intentionally remain as small adapters so
 * app.js and any feature modules can keep calling their existing public names.
 */
function reportSheetLoadError(datasetName, error) {
    const detail = error && error.message
        ? error.message
        : String(error || "Unknown network or parsing error");

    console.error(`[ER175 Hub] ${datasetName} dataset failed to load:`, error);
    showError(`Unable to load ${datasetName} data. Check your connection and try again.`);
    return detail;
}

/**
 * Parse one published CSV and run its dataset-specific transformation.
 *
 * Keep side effects explicit in the options: some secondary datasets do not
 * participate in the app-ready gate, and a few require a post-load renderer.
 */
function parseSheetDataset({
    url,
    datasetName,
    transform,
    onLoaded,
    onAfterLoad,
    onError,
    readyKey,
    checkApplicationReady = false,
    updateStats = true
}) {
    if (!url) {
        console.warn(`[ER175 Hub] Missing spreadsheet URL for ${datasetName}.`);
        return;
    }

    Papa.parse(url, {
        download: true,
        header: true,
        complete: response => {
            const rows = Array.isArray(response.data) ? response.data : [];
            const transformedData = transform(rows);

            if (typeof onLoaded === "function") {
                onLoaded(transformedData);
            }

            if (readyKey) {
                loaded[readyKey] = true;
            }

            if (checkApplicationReady) {
                checkReady();
            }

            if (updateStats) {
                updateSiteStats();
            }

            if (typeof onAfterLoad === "function") {
                onAfterLoad(transformedData);
            }
            if (response && Array.isArray(response.errors) && response.errors.length) {
                console.warn(`[ER175 Hub] ${datasetName} CSV parse warnings:`, response.errors);
            }
        },
        error: error => {
            reportSheetLoadError(datasetName, error);
            if (typeof onError === "function") onError(error);
        }
    });
}

// Primary datasets: these participate in the application's ready gate.
function loadAftermarket(url) {
    parseSheetDataset({
        url,
        datasetName: "aftermarket parts",
        transform: rows => rows.filter(row => row["Parts Name"]),
        onLoaded: data => { aftermarketParts = data; },
        readyKey: "aftermarket",
        checkApplicationReady: true
    });
}

function loadTroubleshoot(url) {
    parseSheetDataset({
        url,
        datasetName: "troubleshooting",
        transform: rows => rows.filter(row => row["Known Issue"]),
        onLoaded: data => { troubleshootData = data; },
        readyKey: "troubleshoot",
        checkApplicationReady: true
    });
}

function loadManual(url) {
    parseSheetDataset({
        url,
        datasetName: "manual",
        transform: rows => rows.filter(row => row["Category"]),
        onLoaded: data => { manualData = data; },
        readyKey: "manual",
        checkApplicationReady: true
    });
}

function loadManualComponents(url) {
    parseSheetDataset({
        url,
        datasetName: "manual components",
        transform: rows => rows
            .filter(row => row["Component"])
            .sort((a, b) => Number(a.ID) - Number(b.ID)),
        onLoaded: data => { manualComponents = data; },
        readyKey: "components",
        checkApplicationReady: true
    });
}

// Secondary manual datasets: these update their data and stats but do not
// block the initial application-ready gate.
function loadManualDashboard(url) {
    parseSheetDataset({
        url,
        datasetName: "manual dashboard",
        transform: rows => rows.filter(row => row["Component"]),
        onLoaded: data => { manualDashboard = data; }
    });
}

function loadManualMaintenance(url) {
    parseSheetDataset({
        url,
        datasetName: "maintenance",
        transform: rows => rows.filter(row => row["Item"]),
        onLoaded: data => { manualMaintenance = data; }
    });
}

function loadEFI(url) {
    parseSheetDataset({
        url,
        datasetName: "EFI diagnostics",
        transform: rows => rows.filter(row => row.ID),
        onLoaded: data => {
            efiData = data;
            window.efiData = data;
        },
        onAfterLoad: () => {
            if (typeof renderEFI === "function") {
                renderEFI();
            }
        },
        readyKey: "efi",
        checkApplicationReady: true
    });
}

function loadWiring(url) {
    parseSheetDataset({
        url,
        datasetName: "wiring",
        transform: rows => rows.filter(row => row.ID),
        onLoaded: data => { window.manualWiring = data; },
        readyKey: "wiring",
        checkApplicationReady: true
    });
}

function loadPrecautions(url) {
    parseSheetDataset({
        url,
        datasetName: "precautions",
        // Keep every non-empty row. The sheet has evolved over time and may
        // use alternate column labels; the renderer resolves those labels.
        transform: rows => rows.filter(row => row && Object.values(row).some(value => String(value || "").trim())),
        onLoaded: data => {
            manualPrecautions = data;
            window.manualPrecautions = data;
            window.manualPrecautionsLoadState = data.length ? "loaded" : "empty";
        },
        onAfterLoad: () => { if (currentTab === "manual" && currentManualSection === "precautions") renderPrecautions(); },
        onError: () => {
            window.manualPrecautionsLoadState = "error";
            if (currentTab === "manual" && currentManualSection === "precautions") renderPrecautions();
        }
    });
}

function loadMistakes(url) {
    parseSheetDataset({
        url,
        datasetName: "common mistakes",
        transform: rows => rows.filter(row => row.ID),
        onLoaded: data => { manualMistakes = data; },
        onAfterLoad: () => { if (currentTab === "manual" && currentManualSection === "mistakes") renderMistakes(); }
    });
}

function loadManualSearchIndex(url) {
    parseSheetDataset({
        url,
        datasetName: "manual search index",
        transform: rows => rows.filter(row => row.ID),
        onLoaded: data => { manualSearchIndex = data; },
        updateStats: false
    });
}

function loadCVT(url) {
    // Preserve the existing render fallback when called without a URL.
    if (!url) {
        if (Array.isArray(cvtData) && cvtData.length) {
            renderCVT();
            return;
        }
        console.warn("CVT dataset URL is missing; check APP_CONFIG and app.js.");
        return;
    }

    parseSheetDataset({
        url,
        datasetName: "CVT presets",
        transform: rows => rows.filter(row => row.ID),
        onLoaded: data => { cvtData = data; }
    });
}

function checkReady() {
    if (appStarted) return;

    if (
        loaded.aftermarket &&
        loaded.troubleshoot &&
        loaded.manual &&
        loaded.components &&
        loaded.efi
    ) {
        appStarted = true;
        isLoading = false;
        currentTab = "aftermarket";
        currentCategory = "All";
        updateSiteStats();
        switchTab("aftermarket");
        if (typeof renderPopularSearches === "function") renderPopularSearches();
    }
}

/**
 * Report a data-loading problem without replacing the application UI.
 * A failed secondary sheet must not erase sections that already loaded.
 */
function showError(message) {
    const safeMessage = String(message || "A data source could not be loaded.");
    console.error(`[ER175 Hub] ${safeMessage}`);

    if (typeof showToast === "function") {
        showToast(safeMessage);
        return;
    }

    // Fallback for errors that occur before the toast UI is initialized.
    let notice = document.getElementById("app-error-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "app-error-notice";
        notice.setAttribute("role", "alert");
        notice.style.cssText = "position:fixed;left:12px;right:12px;bottom:16px;z-index:99999;padding:12px 16px;background:#7f1d1d;color:#fff;border-radius:8px;font:14px/1.4 system-ui,sans-serif;";
        document.body.appendChild(notice);
    }
    notice.textContent = safeMessage;
}
