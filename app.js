/**
 * Application bootstrap.
 * Keep feature logic in its own module; keep editable data-source settings in config.js.
 */
window.addEventListener("unhandledrejection", function (event) {
    console.error("Unhandled promise rejection:", event.reason);
});

function startApplication() {
    // Fail early with a useful message if a required local dependency is missing.
    if (typeof Papa === "undefined" || typeof Papa.parse !== "function") {
        showError("The CSV parser did not load. Check assets/vendor/papaparse.min.js.");
        return;
    }
    if (typeof getSheetCsvUrl !== "function") {
        showError("Application configuration is unavailable. Check config.js.");
        return;
    }

    renderSkeleton();

    // DATASET REGISTRY
    // Each entry maps one config.js sheet key to its existing loader function.
    // Keep keys aligned with APP_CONFIG.spreadsheet.sheets. This registry is
    // intentionally explicit so a maintainer can audit every startup request.
    // To add/remove a dataset, edit config.js and this list only.
    const dataSources = [
        ["aftermarketParts", loadAftermarket],
        ["troubleshooting", loadTroubleshoot],
        ["manual", loadManual],
        ["manualComponents", loadManualComponents],
        ["manualDashboard", loadManualDashboard],
        ["maintenance", loadManualMaintenance],
        ["efiDiagnostics", loadEFI],
        ["wiring", loadWiring],
        ["precautions", loadPrecautions],
        ["commonMistakes", loadMistakes],
        ["manualSearchIndex", loadManualSearchIndex],
        ["cvtPresets", loadCVT],
    ];

    dataSources.forEach(([sheetKey, loader]) => {
        try {
            if (typeof loader !== "function") {
                throw new Error(`Loader function is missing for ${sheetKey}`);
            }
            console.info(`[ER175 Hub] Loading dataset: ${sheetKey}`);
            loader(getSheetCsvUrl(sheetKey));
        } catch (error) {
            console.error(`Failed to start dataset loader: ${sheetKey}`, error);
            showError(`Unable to initialize ${sheetKey} data.`);
        }
    });
}

startApplication();
