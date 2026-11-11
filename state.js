/**
 * Shared application state.
 * Keep this file limited to state declarations; put behavior in feature modules.
 * Script order matters: config.js must load before this file.
 */

// Active browsing context
let currentTab = APP_CONFIG.defaults.initialTab;
let currentCategory = APP_CONFIG.defaults.initialCategory;


let searchQuery = "";
let appStarted = false;

// Image/component viewer state
let currentViewerComponent = null;
let currentViewerIndex = 0;


let currentViewerMode = "";
let currentComponentIndex = 0;
let currentDashboardIndex = 0;

// CVT tuner state and selected rider/setup values
let cvtData = [];

let cvtUser = {

    weight: APP_CONFIG.defaults.initialRiderWeightKg,

    riding: APP_CONFIG.defaults.initialRidingStyle

};


let selectedCVT = {

    roller: APP_CONFIG.defaults.initialCVT.roller,

    center: APP_CONFIG.defaults.initialCVT.center,

    clutch: APP_CONFIG.defaults.initialCVT.clutch

};

// Manual and diagnostics state
let currentManualSection = "specs";

let currentEFIProblem = null;
let currentEFISteps = [];
let currentEFIStepIndex = 0;

let efiFilter = "All";

let manualSearchIndex = [];

// Data populated by the Google Sheets loaders
let manualData = [];
let manualComponents = [];
let manualDashboard = [];
let manualMaintenance = [];
let manualWiring = [];
let manualPrecautions = [];
let manualMistakes = [];
let efiData = [];

let aftermarketParts = [];
let troubleshootData = [];

let isLoading = true;

// Readiness flags used by the initial application render
const loaded = {
    aftermarket: false,
    troubleshoot: false,
    manual: false,
    components: false
};

const container = document.getElementById("products");
const chips = document.getElementById("chips");