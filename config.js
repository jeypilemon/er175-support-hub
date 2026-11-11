/**
 * ER175 Hub — centralized application configuration
 *
 * Safe-to-edit area: update spreadsheet GIDs or defaults here.
 * Keep loader function names in sync with loaders.js.
 * Do not put private credentials in this client-side file.
 */
const APP_CONFIG = Object.freeze({
    appName: "ER175 Hub",

    // Publicly published Google Sheets CSV endpoint.
    spreadsheet: {
        publishedBaseUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub",
        output: "csv",
        sheets: {
            aftermarketParts: "0",
            troubleshooting: "557855511",
            manual: "56637698",
            manualComponents: "1017192042",
            manualDashboard: "81321961",
            maintenance: "1981058519",
            efiDiagnostics: "980811144",
            wiring: "1373439743",
            precautions: "2052007273",
            commonMistakes: "1708336835",
            manualSearchIndex: "260309207",
            cvtPresets: "489241229",
        }
    },

    // Shared search analytics endpoint. Leave blank until the Apps Script Web App is deployed.
    analytics: { endpoint: "https://script.google.com/macros/s/AKfycbzNNLZQNI04B6Gyug_065ZPd37VaoWXNqyIDuKT6tsAVZNH7SOfZatowcZbfFUEJsFuiw/exec" },

    // Defaults used by the interface. Change these without editing feature logic.
    defaults: {
        initialTab: "aftermarket",
        initialCategory: "All",
        initialRiderWeightKg: 80,
        initialRidingStyle: "Daily",
        initialCVT: {
            roller: "14g",
            center: "1500 RPM",
            clutch: "1200 RPM"
        }
    }
});

/** Build a published CSV URL from its configured sheet GID. */
function getSheetCsvUrl(sheetKey) {
    const gid = APP_CONFIG.spreadsheet.sheets[sheetKey];
    if (!gid) {
        throw new Error(`Unknown spreadsheet key: ${sheetKey}`);
    }

    const params = new URLSearchParams({
        gid,
        single: "true",
        output: APP_CONFIG.spreadsheet.output
    });

    return `${APP_CONFIG.spreadsheet.publishedBaseUrl}?${params.toString()}`;
}
