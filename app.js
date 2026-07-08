let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

let currentComponentSide = "Right";
let currentViewerComponent = null;
let currentViewerIndex = 0;


let manualSearch = "";
let manualData = [];
let manualComponents = [];
let manualDashboard = [];
let manualMaintenance = [];
let manualEFI = [];
let manualWiring = [];
let manualPrecautions = [];
let manualMistakes = [];

let aftermarketParts = [];
let oemParts = [];
let troubleshootData = [];

let isLoading = true;

/* =========================
DOM
========================= */
const container = document.getElementById("products");
const chips = document.getElementById("chips");

/* =========================
STATE TRACKER
========================= */
const loaded = {
    aftermarket: false,
    oem: false,
    troubleshoot: false,
    manual: false,
    components:false

};

function closeModal() {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    frame.src = "";
    modal.classList.remove("show");
}



/* =========================
SKELETON
========================= */
function renderSkeleton(count = 6) {
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="card skeleton-card">
            <div class="skeleton image"></div>
            <div class="skeleton text short"></div>
            <div class="skeleton text"></div>
            <div class="skeleton text"></div>
        </div>
    `).join("");
}

/* =========================
READY CHECK
========================= */
function checkReady() {

    console.log("LOAD STATUS:", loaded);

    if (
        loaded.aftermarket &&
        loaded.oem &&
        loaded.troubleshoot &&
        loaded.manual
    ) {

        console.log("ALL DATA READY");

        isLoading = false;

        render();

        renderChips();

    }

}

/* Global Functions*/

/* =========================
GLOBAL FUNCTIONS
========================= */

function hintChipScroll(){

    const chips = document.getElementById("chips");

    if(!chips) return;


    // only animate if content is overflowing
    if(chips.scrollWidth <= chips.clientWidth){
        return;
    }


    chips.classList.add("hint-scroll");


    setTimeout(()=>{
        chips.classList.remove("hint-scroll");
    },1800);

}

function scrollChips(){

    const chips = document.getElementById("chips");

    chips.scrollBy({
        left:150,
        behavior:"smooth"
    });

}

function getYouTubeId(url) {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
    );
    return match ? match[1] : null;
}

function openModal(url) {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");

    const ytId = getYouTubeId(url);

    frame.src = "";

    // YouTube → in-app
    if (ytId) {
        frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        modal.classList.add("show");
        return;
    }

    // TikTok → force app intent (best effort)
    if (url.includes("tiktok.com")) {
        window.location.href = url; // mobile opens app if installed
        return;
    }

    // Facebook → force app / browser fallback
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
        window.location.href = url;
        return;
    }

    window.open(url, "_blank");
}


/* =========================
UTILS
========================= */
function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
}

function safeHighlight(text) {

    if (!globalKeyword) return text || "";

    const escaped = globalKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const reg = new RegExp(escaped, "gi");

    return (text || "").replace(
        reg,
        m => `<mark>${m}</mark>`
    );
}


/* =========================
LOADERS
========================= */
function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            loaded.aftermarket = true;
            checkReady();
        }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            oemParts = res.data.filter(p => p["Parts Name"]);
            loaded.oem = true;
            checkReady();
        }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            troubleshootData = res.data.filter(p => p["Known Issue"]);
            loaded.troubleshoot = true;
            checkReady();
        }
    });
}

function loadManual(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            manualData = res.data.filter(x => x["Category"]);
            loaded.manual = true;
            checkReady();
        }
    });
}

function loadManualComponents(url) {

    Papa.parse(url, {

        download:true,

        header:true,

        complete: res => {

            manualComponents =
            res.data.filter(x=>x["Component"]);


            manualComponents.sort((a,b)=>
            Number(a.ID)-Number(b.ID)
            );


            console.log(
                "Components loaded:",
                manualComponents.length
            );


        }

    });

}


/*function loadManualSections(){

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1017192042&single=true&output=csv", data=>{
        manualComponents = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=81321961&single=true&output=csv", data=>{
        manualDashboard = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1981058519&single=true&output=csv", data=>{
        manualMaintenance = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1991247179&single=true&output=csv", data=>{
        manualEFI = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1373439743&single=true&output=csv", data=>{
        manualWiring = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=2052007273&single=true&output=csv", data=>{
        manualPrecautions = data;
    });

    loadCSV("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1708336835&single=true&output=csv", data=>{
        manualMistakes = data;
    });

}
*/

/* =========================
TAB UI
========================= */
function updateTabUI() {
    document.querySelectorAll(".seg").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-tab="${currentTab}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

/* =========================
TOGGLE TROUBLESHOOT
========================= */
function toggleCard(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.toggle("open");
}

/* =========================
CHIPS
========================= */
function renderChips() {
    let cats = [];

    if (currentTab === "aftermarket") {
        cats = [...new Set(aftermarketParts.map(p => p["Parts Category"]))];
    } else if (currentTab === "oem") {
        cats = [...new Set(oemParts.map(p => p["Parts Category"]))];
    } else if (currentTab === "troubleshoot") {
        cats = [...new Set(troubleshootData.flatMap(p => (p["Tags"] || "").split(",")))];
    } else {
        chips.innerHTML = "";
        return;
    }

    cats = ["All", ...cats.filter(Boolean)];

    chips.innerHTML = cats.map(c => `
        <button class="${c === currentCategory ? "active" : ""}"
        onclick="setCategory('${c}')">${c}</button>
    `).join("");


    setTimeout(hintChipScroll,1500);

}

/* =========================
MAIN RENDER
========================= */
function render() {

    if (isLoading) {
        renderSkeleton();
        return;
    }

    container.classList.remove("manual-mode", "grid-layout");

    if (currentTab === "aftermarket" || currentTab === "oem") {
        container.classList.add("grid-layout");
    }

    if (currentTab === "manual") {
        container.classList.add("manual-mode");
        return renderManual();
    }

    if (currentTab === "troubleshoot") {
        return renderTroubleshoot();
    }

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"]);
        const cat = normalizeText(p["Parts Category"]);

        return (
            (name.includes(globalKeyword) || cat.includes(globalKeyword)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">${getEmptyStateMessage()}</div>`;
        return;
    }

    container.innerHTML = filtered.map(part => `
    <div class="card">

        <img 
            src="${part["Preview"] || ""}" 
            onerror="this.style.display='none'"
        >

        <div class="card-content">

            <h3>${part["Parts Name"]}</h3>

            <span class="category">
                ${part["Parts Category"] || ""}
            </span>

            ${
    part["Spec Size"] 
    ? `<div class="specs ${part["Spec Size"].toLowerCase().includes("plug") ? "plug-fit" : ""}">
        ${part["Spec Size"]}
       </div>`
    : ""
}

        </div>

        <a class="button" href="${part["Shopee"]}" target="_blank">
            View Product
        </a>

    </div>
`).join("");

    updateTabUI();
}

/*Linkyfy Text*/
function linkifySolution(text) {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

    return text
        .replace(/\n/g, "<br>")
        .replace(urlRegex, (url) => {

            const href = url.startsWith("www.") ? "https://" + url : url;

            let label = "🔗 Open Link";

            // 👇 PUT THE CODE HERE
            let className = "inline-link";

            if (/youtu\.?be|youtube\.com/.test(href)) {
                className += " youtube";
                label = "▶ Watch in YouTube";
            }
            else if (/tiktok\.com/.test(href)) {
                className += " tiktok";
                label = "🎵 Watch in TikTok";
            }
            else if (/facebook\.com|fb\.watch/.test(href)) {
                className += " facebook";
                label = "📘 View in Facebook";
            }

            return `
                <div style="margin:6px 0;">
                    <a class="${className}" href="javascript:void(0)" onclick="openModal('${href}')">
                        ${label}
                    </a>
                </div>
            `;
        });
}


function switchViewerSide(side){

if(!currentViewerComponent)
return;


currentViewerComponent["Image Side"] = side;



const image =
document.getElementById(
"componentViewerImage"
);


const marker =
document.getElementById(
"componentViewerMarker"
);



if(image){

image.classList.remove("zoom");


image.src =
`assets/images/er175-sideview-${side.toLowerCase()}.png`;


}



if(marker){

marker.style.left =
currentViewerComponent["X Position"]+"%";


marker.style.top =
currentViewerComponent["Y Position"]+"%";

}



setTimeout(()=>{

image.classList.add("zoom");

},500);



}


document.addEventListener(
"click",
function(e){


if(e.target.id==="componentViewerImage"){


resetViewerZoom();


}


});

/*open component modal*/

function openComponentViewer(id){

console.log("OPEN COMPONENT", id);


const item = manualComponents.find(
x => x["ID"] == id
);

if(!item){
    console.log("Missing component", id);
    return;
}


currentViewerComponent = item;

currentViewerIndex =
manualComponents.findIndex(
x=>x["ID"] == id
);


if(!item){

console.log("Missing component", id);
return;

}



const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const marker =
document.getElementById("componentViewerMarker");



const title =
document.getElementById("componentViewerTitle");


const location =
document.getElementById("componentViewerLocation");


const notes =
document.getElementById("componentViewerNotes");



// IMAGE LOAD

if(image){

    image.classList.remove("zoom");


    image.src =
    `assets/images/er175-sideview-${item["Image Side"].toLowerCase()}.png`;

    image.style.transformOrigin =
    `${item["X Position"]}% ${item["Y Position"]}%`;

}



// MARKER POSITION

if(marker){

    marker.style.left =
    item["X Position"] + "%";


    marker.style.top =
    item["Y Position"] + "%";


    marker.style.display = "block";

    marker.classList.add("active");

}



// TEXT INFO

if(title){

    title.innerHTML =
    item["Component"];

}


if(location){

    location.innerHTML =
    `
    <strong>Location:</strong>
    ${item["Location"] || ""}
    `;

}


if(notes){

    notes.innerHTML =
    item["Access / Notes"] || "";

}



// SHOW MODAL

modal.classList.add("show");



// ZOOM AFTER IMAGE LOAD

setTimeout(()=>{


    if(image){

        image.classList.add("zoom");

    }


},500);



}


function previousComponent(){


currentViewerIndex--;


if(currentViewerIndex < 0){

    currentViewerIndex =
    manualComponents.length - 1;

}

const previous =
manualComponents[currentViewerIndex];


openComponentViewer(previous["ID"]);


}

function openNextComponent(){

    currentViewerIndex++;

if(currentViewerIndex >= manualComponents.length){

    currentViewerIndex = 0;

}


const next =
manualComponents[currentViewerIndex];


openComponentViewer(next["ID"]);

}

function resetViewerZoom(){

const image =
document.getElementById(
"componentViewerImage"
);


if(image){

image.classList.remove("zoom");

}


}

function closeComponentViewer(){

const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const marker =
document.getElementById("componentViewerMarker");



if(image){

    image.classList.remove("zoom");

}


if(marker){

    marker.style.display="none";

}


if(modal){

    modal.classList.remove("show");

}

if(marker){
    marker.classList.remove("active");
}


}



/* =========================
TROUBLESHOOT
========================= */
function renderTroubleshoot() {

    const filtered = troubleshootData.filter(item => {
        const issue = normalizeText(item["Known Issue"]);
        const sol = normalizeText(item["Possible Solution"]);
        const tags = (item["Tags"] || "").toLowerCase();

        return (
            (issue.includes(globalKeyword) || sol.includes(globalKeyword)) &&
            (currentCategory === "All" || tags.includes(currentCategory.toLowerCase()))
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">No results found</div>`;
        return;
    }

    container.innerHTML = filtered.map((item, i) => `
        <div class="help-card">
            <div class="help-header" onclick="toggleCard('card-${i}')">
                ⚠️ ${item["Known Issue"]}
            </div>
            <div class="help-body" id="card-${i}">
                <div class="help-solution">
                 ${linkifySolution(item["Possible Solution"])}
                </div>
            </div>
        </div>
    `).join("");

    updateTabUI();
}

/* =========================
MANUAL (FIXED + CSS SUPPORT)
========================= */

function renderManual() {

    container.innerHTML = `

    <div class="manual-download">

        <a class="manual-download-btn"
        href="https://drive.google.com/file/d/1xJyf7sNn1Nlo7X4r0a3X6W_R5pUabHbQ/view"
        target="_blank">

        Download Owner's Manual PDF (Official)

        </a>

    </div>


    <div class="manual-menu">


        <button onclick="openManualSection('specs')">
            Specifications
        </button>


        <button onclick="openManualSection('components')">
            Component Guide
        </button>


        <button onclick="openManualSection('dashboard')">
            Dashboard Guide
        </button>


        <button onclick="openManualSection('maintenance')">
            Maintenance
        </button>


        <button onclick="openManualSection('efi')">
            EFI Diagnostics
        </button>


        <button onclick="openManualSection('wiring')">
            Wiring Reference
        </button>


        <button onclick="openManualSection('precautions')">
            Precautions
        </button>


        <button onclick="openManualSection('mistakes')">
            Common Owner Mistakes
        </button>


    </div>


    <div id="manualContent">

        <div class="empty-state">
            Select a manual section
        </div>

    </div>


    `;


    updateTabUI();

}


function renderManualSpecs() {

    const filtered = manualData.filter(item => {

    const searchText = normalizeText(
    (item["Category"] || "") +
" " +
(item["Specification"] || "") +
" " +
(item["Value"] || "") +
" " +
(item["Notes"] || "")
);

return searchText.includes(
    normalizeText(globalKeyword)
);
    });


    const grouped = {};

    filtered.forEach(item => {

        const category = item["Category"] || "Other";

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push(item);

    });


    let html = "";


    if(filtered.length === 0){

        document.getElementById("manualContent").innerHTML = `
        <div class="empty-state">
        No manual information found
        </div>
        `;

        return;
    }



    Object.keys(grouped).forEach(category => {


        html += `

        <section class="manual-section">

            <h3 class="manual-section-title">
                ${category}
            </h3>


            <div class="manual-card">

        `;


        grouped[category].forEach(item=>{


            html += `

            <div class="manual-row">

<div>
    <div class="manual-spec">
        ${safeHighlight(item["Specification"])}
    </div>

    <div class="manual-note">
        ${item["Notes"] || ""}
    </div>
</div>


<div class="manual-value">
    ${safeHighlight(item["Value"])}
</div>

</div>

            `;


        });



        html += `

            </div>

        </section>

        `;


    });



    document.getElementById("manualContent").innerHTML = html;

    updateTabUI();

}

function renderManualComponents(){

const content = document.getElementById("manualContent");


if(!manualComponents || manualComponents.length === 0){

    content.innerHTML = `
    <div class="empty-state">
        Component data is loading...
    </div>
    `;

    return;

}



const grouped = manualComponents.reduce((groups,item)=>{


const category = item["Category"] || "Other";


if(!groups[category]){

    groups[category] = [];

}


groups[category].push(item);


return groups;


},{});




content.innerHTML = `

<div class="component-list">


${
Object.entries(grouped)
.map(([category,items])=>`


<section class="component-category">


<h3 class="component-category-title">

${category}

</h3>



${

items.map(item=>`

<div 
class="component-item"
onclick="openComponentViewer('${item["ID"]}')"
>


<div class="component-number">

${item["ID"]}

</div>


<div class="component-details">


<h4>

${item["Component"]}

</h4>


<span>

${item["Location"] || ""}

</span>


</div>


</div>


`).join("")

}


</section>


`).join("")
}


</div>

`;

}

function attachComponentMarkers(){

    document
    .querySelectorAll(".component-marker")
    .forEach(marker=>{


        marker.onclick=function(){

            focusComponent(this.dataset.id);

        };


    });

}

function focusComponent(id){


const component =
manualComponents.find(item =>
    item["ID"] == id
);



if(!component){

    console.log("Component not found:", id);

    return;

}


// check image side

const side = component["Image Side"];



if(
    side &&
    side.toLowerCase() !== currentComponentSide.toLowerCase()
){

    window.componentSide(side);


    // wait for image redraw

    setTimeout(()=>{

        focusComponent(id);

    },300);


    return;

}




const image =
document.querySelector(".component-image");



if(image){

    image.classList.add("show");

}




const marker =
document.querySelector(
`.component-marker[data-id="${id}"]`
);



const card =
document.getElementById(
`component-${id}`
);



if(card){


card.scrollIntoView({

    behavior:"smooth",

    block:"center"

});


card.classList.add("highlight");


setTimeout(()=>{

    card.classList.remove("highlight");

},2000);


}



if(marker){


marker.classList.add("marker-focus");


setTimeout(()=>{


marker.classList.remove("marker-focus");


},2000);


}



}

/* Dictionary*/

const suggestionMap = {
    breakpads: "brake pads",
    brakepad: "brake pads",
    oilfilter: "oil filter",
    sparkpluggs: "spark plug",
    clutchshoe: "clutch shoe"
};

/*fuzzy suggestion*/

function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}

/*suggestion UI*/

function renderSuggestion() {
    const suggestionBox = document.getElementById("suggestions");

    const suggestion = getSuggestion(globalKeyword);

    if (!globalKeyword || !suggestion) {
        suggestionBox.innerHTML = "";
        return;
    }

    suggestionBox.innerHTML = `
        <div class="suggestion-item" onclick="applySuggestion('${suggestion}')">
            💡 Do you mean: <b>${suggestion}</b>?
        </div>
    `;
}

/*Apply suggestion*/

function applySuggestion(text) {
    document.getElementById("search").value = text;
    globalKeyword = normalizeText(text);
    render();
    renderSuggestion();
}

/* =========================
ACTIONS
========================= */

function openManualSection(section){

    const content = document.getElementById("manualContent");

    if (!content) return;


    switch(section){


        case "specs":

            renderManualSpecs();

            break;



        case "components":

            renderManualComponents();

            break;



        case "dashboard":

            content.innerHTML = `
                <div class="empty-state">
                    Dashboard Guide coming next
                </div>
            `;

            break;



        case "maintenance":

            content.innerHTML = `
                <div class="empty-state">
                    Maintenance Guide coming next
                </div>
            `;

            break;



        case "efi":

            content.innerHTML = `
                <div class="empty-state">
                    EFI Diagnostics coming next
                </div>
            `;

            break;



        case "wiring":

            content.innerHTML = `
                <div class="empty-state">
                    Wiring Reference coming next
                </div>
            `;

            break;



        case "precautions":

            content.innerHTML = `
                <div class="empty-state">
                    Precautions coming next
                </div>
            `;

            break;



        case "mistakes":

            content.innerHTML = `
                <div class="empty-state">
                    Common Owner Mistakes coming next
                </div>
            `;

            break;


    }

}

function matchWords(text, query) {
    if (!query) return true;

    const words = text.split(" ");
    const q = query.trim();

    return words.includes(q);
}

function getEmptyStateMessage() {
    if (globalKeyword) {
        return `No results found for "<b>${globalKeyword}</b>"`;
    }
    return "No items available";
}

function resetFilters() {

    globalKeyword = "";
    manualSearch = "";
    currentCategory = "All";

    document.getElementById("search").value = "";

    renderChips();
    render();

}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

function switchTab(tab) {

    currentTab = tab;
    currentCategory = "All";

    container.classList.remove("manual-mode");

    renderChips();
    render();
    updateSearchPlaceholder();

}

/* =========================
SEARCH
========================= */

function updateSearchPlaceholder() {
    const search = document.getElementById("search");

    if (currentTab === "manual") {
        search.placeholder = "What do you want? (e.g. oil capacity, torque spec)";
    } else if (currentTab === "troubleshoot") {
        search.placeholder = "Search issues (e.g. no power, check engine light on, vibration)";
    } else {
        search.placeholder = "Search parts (e.g. bearing, seat cover, brake pads)";
    }
}

document.getElementById("search").addEventListener("input", e => {
    globalKeyword = normalizeText(e.target.value);

    render();

});

document.getElementById("chips").addEventListener("pointerdown",()=>{

    chips.classList.remove("hint-scroll");


});



window.closeModal = closeModal;
window.openModal = openModal;

window.openComponentViewer = openComponentViewer;
window.closeComponentViewer = closeComponentViewer;

window.previousComponent = previousComponent;
window.openNextComponent = openNextComponent;
window.resetViewerZoom = resetViewerZoom;

/* =========================
INIT
========================= */
renderSkeleton();

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");

loadManualComponents("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1017192042&single=true&output=csv");