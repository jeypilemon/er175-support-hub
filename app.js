let currentTab = "aftermarket";
let currentCategory = "All";
let globalKeyword = "";

let currentViewerComponent = null;
let currentViewerIndex = 0;

let currentViewerMode = "";
let currentComponentIndex = 0;
let currentDashboardIndex = 0;

let viewerMode = "";
viewerMode="dashboard";
viewerMode="component";

let currentEFIProblem = null;
let currentEFISteps = [];
let currentEFIStepIndex = 0;

let efiFilter = "All";
let efiSearch = "";

let manualSearch = "";
let manualData = [];
let manualComponents = [];
let manualDashboard = [];
let manualMaintenance = [];
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

function closeOutsideModal(e){

    const box =
    document.querySelector(".component-modal-box");


    if(!box.contains(e.target)){

        closeComponentViewer();

    }

}

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



    if (
        loaded.aftermarket &&
        loaded.oem &&
        loaded.troubleshoot &&
        loaded.manual &&
        loaded.components
    ) {


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

if(!chips) return;


chips.scrollBy({

left:250,

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

/* Load Manual Tabs*/

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


    loaded.components = true;

    checkReady();

}

    });

}

function loadManualDashboard(url){

    Papa.parse(url,{
        download:true,
        header:true,

        complete: res=>{

            manualDashboard =
            res.data.filter(
                x=>x["Component"]
            );


            console.log(
                "Dashboard loaded:",
                manualDashboard.length
            );

        }

    });

}

function loadManualMaintenance(url){

    Papa.parse(url,{

        download:true,
        header:true,

        complete: res => {


            manualMaintenance =
            res.data.filter(
                x => x["Item"]
            );


            console.log(
                "Maintenance loaded:",
                manualMaintenance.length
            );


        }

    });

}


let efiData = [];

function loadEFI(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            efiData = res.data.filter(r => r.ID);

        }
    });
}

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

function updateChipArrow(){

    const chips = document.getElementById("chips");
    const arrow = document.querySelector(".chips-next");

    if(!chips || !arrow) return;


    if(chips.scrollWidth > chips.clientWidth){

        arrow.style.display="flex";

    }else{

        arrow.style.display="none";

    }

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


    updateChipArrow();
}


function renderManualChips(){

const chips =
document.getElementById("chips");


const sections = [
    ["specs","Specifications"],
    ["components","Component Guide"],
    ["dashboard","Dashboard"],
    ["maintenance","Maintenance"],
    ["efi","EFI"],
    ["wiring","Wiring"],
    ["precautions","Precautions"],
    ["mistakes","Mistakes"]
];


chips.innerHTML = sections.map(item=>`

<button 
class="${currentCategory === item[0] ? "active" : ""}"
onclick="openManualSection('${item[0]}')">

${item[1]}

</button>

`).join("");


updateChipArrow();

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

/*open component modal*/

function openComponentViewer(id){

currentViewerMode = "component";


const item = manualComponents.find(
    x => x["ID"] == id
);


if(!item){
    console.log("Missing component:", id);
    return;
}


currentViewerComponent = item;


currentViewerIndex =
manualComponents.findIndex(
    x => x["ID"] == id
);



const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const zoomImage =
document.getElementById("componentViewerZoom");


const marker =
document.getElementById("componentViewerMarker");


const title =
document.getElementById("componentViewerTitle");


const location =
document.getElementById("componentViewerLocation");


const notes =
document.getElementById("componentViewerNotes");


// REMOVE DASHBOARD ELEMENTS

const hint =
document.querySelector(".dashboard-hint");

if(hint){
    hint.style.display="none";
}


// RESTORE COMPONENT IMAGE

if(image){

    image.style.display="block";

    image.src =
    `assets/images/er175-sideview-${item["Image Side"].toLowerCase()}.png`;

}


// HIDE DASH ZOOM IMAGE

if(zoomImage){

    zoomImage.src="";
    zoomImage.style.display="none";

}


// MARKER

if(marker){

    marker.style.left =
    item["X Position"] + "%";


    marker.style.top =
    item["Y Position"] + "%";


    marker.style.display="block";

}


// TEXT

if(title){

    title.innerHTML =
    item["Component"] || "";

}


if(location){

    location.innerHTML =
    "";

}


if(notes){

    notes.innerHTML =
    item["Access / Notes"] || "";

}


// OPEN

if(modal){

    modal.classList.add("show");

}


}

function previousComponent(){


if(currentViewerMode==="dashboard"){


currentDashboardIndex--;


if(currentDashboardIndex < 0){

    currentDashboardIndex =
    manualDashboard.length - 1;

}


openDashboardInfo(
    manualDashboard[currentDashboardIndex]["ID"]
);


return;

}


// COMPONENT MODE

currentViewerIndex--;


if(currentViewerIndex < 0){

    currentViewerIndex =
    manualComponents.length - 1;

}


openComponentViewer(
    manualComponents[currentViewerIndex]["ID"]
);


}


function openNextComponent(){


if(currentViewerMode==="dashboard"){


currentDashboardIndex++;


if(currentDashboardIndex >= manualDashboard.length){

    currentDashboardIndex = 0;

}


openDashboardInfo(
    manualDashboard[currentDashboardIndex]["ID"]
);


return;

}


// COMPONENT MODE

currentViewerIndex++;


if(currentViewerIndex >= manualComponents.length){

    currentViewerIndex = 0;

}


openComponentViewer(
    manualComponents[currentViewerIndex]["ID"]
);


}


function closeComponentViewer(){

const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const zoomImage =
document.getElementById("componentViewerZoom");


const marker =
document.getElementById("componentViewerMarker");


// RESET COMPONENT IMAGE

if(image){

    image.src="";
    image.style.display="none";

}


// RESET DASH ZOOM

if(zoomImage){

    zoomImage.src="";
    zoomImage.style.display="none";

}


// RESET MARKER

if(marker){

    marker.style.display="none";

}


// CLOSE

if(modal){

    modal.classList.remove("show");

}


currentViewerMode = "";

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
id="component-${item["ID"]}"
onclick="openComponentViewer('${item["ID"]}')"
>


<div class="component-details">


<h3>
${item["Component"]}
</h3>

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

function renderDashboard(){

const content =
document.getElementById("manualContent");


if(!manualDashboard || manualDashboard.length === 0){

    content.innerHTML = `
    <div class="empty-state">
        Dashboard data loading...
    </div>
    `;

    return;

}


content.innerHTML = `

<div class="dashboard-guide">


<div class="dashboard-image-container">


<img 
src="assets/images/er175-dash.png"
class="dashboard-image"
>

<div class="dashboard-hint">
👆 Tap the highlighted area to view information
</div>


${
manualDashboard.map(item=>`

<div
class="dashboard-marker"

style="
left:${item["X Position"]}%;
top:${item["Y Position"]}%;
width:${(Number(item["Width"]) / 1177) * 100}%;
height:${(Number(item["Height"]) / 785) * 100}%;
"

onclick="openDashboardInfo('${item["ID"]}')">

</div>


`).join("")
}


</div>

`;

}

function renderMaintenance(){


const content =
document.getElementById("manualContent");



if(!manualMaintenance.length){

content.innerHTML = `

<div class="empty-state">

Maintenance data loading...

</div>

`;

return;

}



content.innerHTML = `


<div class="maintenance-note">

⚠️ Maintenance intervals may vary depending on riding conditions.
<br>
Shorten service intervals for heavy traffic, dusty roads,
frequent uphill riding, or long-distance use.

</div>



<div class="maintenance-list">


${

manualMaintenance.map(item=>`


<div class="maintenance-card">


<div class="maintenance-header">

<h3>
${item["Item"]}
</h3>


<span class="maintenance-category">

${item["Category"]}

</span>


</div>



<div class="maintenance-row">

<strong>
Interval
</strong>

<p>
${item["Interval"]}
</p>

</div>



<div class="maintenance-row">

<strong>
Specification / Procedure
</strong>

<p>
${item["Specification / Procedure"]}
</p>

</div>



<div class="maintenance-row">

<strong>
Notes
</strong>

<p>
${item["Notes"] || ""}
</p>

</div>



</div>


`).join("")

}



</div>


`;

}


function renderEFI(){

    const content = document.getElementById("manualContent");

    if(!efiData.length){

        content.innerHTML=`
        <div class="empty-state">
            EFI data loading...
        </div>
        `;
        return;

    }

    const filtered = efiData.filter(problem=>{

        const text = (
            problem["Error / Symptom"]+" "+
            problem["Component / System"]
        ).toLowerCase();

        return text.includes(efiSearch.toLowerCase());

    });

    content.innerHTML=`

<div class="efi-header">

<h2>EFI Diagnostic Center</h2>

<p>
Select a symptom to begin guided troubleshooting.
</p>

<input
id="efiSearch"
class="efi-search"
placeholder="Search symptoms..."
value="${efiSearch}"
oninput="searchEFI(this.value)"
>

</div>

<div class="efi-grid">

${filtered.map(problem=>{

const steps=parseTroubleshootingSteps(
problem["Possible Cause & Troubleshooting Steps (Sequential)"]
);

const difficulty=getEFIDifficulty(problem["Component / System"]);

return`

<div class="efi-card">

<div class="efi-card-top">

<div>

<h3>

${problem["Error / Symptom"]}

</h3>

<p>

${problem["Component / System"]}

</p>

</div>

<span class="efi-difficulty ${difficulty.class}">

${difficulty.label}

</span>

</div>

<div class="efi-card-bottom">

<span>

${steps.length} Diagnostic Steps

</span>

<button
onclick="openEFIDiagnosis('${problem.ID}')">

Diagnose →

</button>

</div>

</div>

`;

}).join("")}

</div>

`;

}

function searchEFI(value){

    efiSearch=value;

    renderEFI();

}

function getEFIDifficulty(component){

    const c=component.toLowerCase();

    if(c.includes("ecu")){

        return{
            label:"Advanced",
            class:"danger"
        };

    }

    if(
        c.includes("pump")||
        c.includes("injector")||
        c.includes("sensor")
    ){

        return{
            label:"Moderate",
            class:"warning"
        };

    }

    return{

        label:"Easy",
        class:"success"

    };

}

function openEFIDiagnosis(id){

    currentEFIProblem = efiData.find(x=>x.ID==id);

    if(!currentEFIProblem) return;

    currentEFISteps = parseTroubleshootingSteps(
        currentEFIProblem["Possible Cause & Troubleshooting Steps (Sequential)"]
    );

    currentEFIStepIndex = 0;

    renderEFIModal();

}



function parseTroubleshootingSteps(text){

    if(!text) return [];

    const matches = text.match(/(?:^|\n)\d+\.\s[\s\S]*?(?=(?:\n\d+\.\s)|$)/g);

    if(!matches) return [text];

    return matches.map(step=>{

        return step
            .replace(/^\s*\d+\.\s*/,"")
            .trim();

    });

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

function getEFICategory(component){

    const c = component.toLowerCase();

    if(c.includes("mil"))
        return "MIL";

    if(c.includes("fuel") || c.includes("injector") || c.includes("pump"))
        return "Fuel";

    if(c.includes("sensor") || c.includes("tps"))
        return "Sensors";

    if(c.includes("battery") || c.includes("fuse") || c.includes("starter"))
        return "Electrical";

    if(c.includes("ecu"))
        return "ECU";

    return "Starting";

}


function renderEFIModal(){

    const modal = document.getElementById("componentModal");

    document.getElementById("componentViewerTitle").innerHTML =
        currentEFIProblem["Error / Symptom"];

    document.getElementById("componentViewerLocation").innerHTML =
        currentEFIProblem["Component / System"];

    document.getElementById("componentViewerNotes").innerHTML = `

<div class="efi-progress">

Step ${currentEFIStepIndex+1}
of
${currentEFISteps.length}

</div>

<div class="efi-step-box">

${currentEFISteps[currentEFIStepIndex]}

</div>

<div class="efi-nav">

<button
onclick="previousEFIStep()"
${currentEFIStepIndex==0?"disabled":""}>

◀ Previous

</button>

<button
onclick="nextEFIStep()"
${currentEFIStepIndex==currentEFISteps.length-1?"disabled":""}>

Next ▶

</button>

</div>

`;

    document.getElementById("componentViewerImage").style.display="none";
    document.getElementById("componentViewerMarker").style.display="none";
    document.getElementById("componentViewerZoom").style.display="none";

    modal.classList.add("show");

}

function nextEFIStep(){

    if(currentEFIStepIndex<currentEFISteps.length-1){

        currentEFIStepIndex++;

        renderEFIModal();

    }

}

function previousEFIStep(){

    if(currentEFIStepIndex>0){

        currentEFIStepIndex--;

        renderEFIModal();

    }

}

function resetViewerModal(){

    const image =
    document.getElementById("componentViewerImage");

    const zoom =
    document.getElementById("componentViewerZoom");

    const marker =
    document.getElementById("componentViewerMarker");


    if(image){
        image.src="";
        image.style.display="none";
    }


    if(zoom){
        zoom.src="";
        zoom.style.display="none";
    }


    if(marker){
        marker.style.display="none";
    }

}

function resetViewerImage(){

    const image =
    document.getElementById("componentViewerImage");

    const marker =
    document.getElementById("componentViewerMarker");

    const zoom =
    document.getElementById("componentViewerZoom");


    if(image){
        image.src="";
        image.style.display="block";
    }


    if(marker){
        marker.style.display="none";
    }


    if(zoom){
        zoom.style.display="none";
        zoom.src="";
    }

}


function openDashboardInfo(id){

currentViewerMode = "dashboard";


const item =
manualDashboard.find(
    x => x["ID"] == id
);


if(!item){
    console.log("Missing dashboard item:", id);
    return;
}


currentDashboardIndex =
manualDashboard.findIndex(
    x => x["ID"] == id
);



const modal =
document.getElementById("componentModal");


const image =
document.getElementById("componentViewerImage");


const zoomImage =
document.getElementById("componentViewerZoom");


const marker =
document.getElementById("componentViewerMarker");


const title =
document.getElementById("componentViewerTitle");


const location =
document.getElementById("componentViewerLocation");


const notes =
document.getElementById("componentViewerNotes");


// HIDE COMPONENT IMAGE

if(image){

    image.src="";
    image.style.display="none";

}


// HIDE COMPONENT MARKER

if(marker){

    marker.style.display="none";

}


// TITLE

if(title){

    title.innerHTML =
    item["Component"] || "";

}


// MEANING

if(location){

    location.innerHTML =
    item["Meaning"] || "";

}


// NOTES

if(notes){

    notes.innerHTML =
    item["Notes"] || "";

}


// DASHBOARD ZOOM IMAGE

if(zoomImage){

    if(item["Zoom Image"]){

        zoomImage.src =
        item["Zoom Image"];

        zoomImage.style.display="block";

    }
    else{

        zoomImage.src="";
        zoomImage.style.display="none";

    }

}


// OPEN MODAL

if(modal){

    modal.classList.add("show");

}


}


function openManualSection(section){

    currentCategory = section;

    renderManualChips();

    const content = document.getElementById("manualContent");

    if(!content) return;

    // VERY IMPORTANT
    content.innerHTML = "";

    switch(section){

        case "specs":
            renderManualSpecs();
            break;

        case "components":
            renderManualComponents();
            break;

        case "dashboard":
            renderDashboard();
            break;

        case "maintenance":
            renderMaintenance();
            break;

        case "efi":
            renderEFI();
            break;

        case "wiring":
            renderWiring();
            break;

        case "precautions":
            renderPrecautions();
            break;

        case "mistakes":
            renderMistakes();
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


    if(tab === "manual"){

        renderManualChips();

    }
    else{

        renderChips();

    }


    render();

    updateSearchPlaceholder();

    setTimeout(updateChipArrow,100);
    

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

window.openManualSection = openManualSection;
window.switchTab = switchTab;
window.setCategory = setCategory;
window.resetFilters = resetFilters;

window.openEFIDiagnosis = openEFIDiagnosis;
window.searchEFI = searchEFI;
window.nextEFIStep = nextEFIStep;
window.previousEFIStep = previousEFIStep;

window.previousComponent = previousComponent;
window.openNextComponent = openNextComponent;

window.addEventListener("resize",()=>{

updateChipArrow();

});


document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        closeComponentViewer();

    }

});

/* =========================
INIT
========================= */
renderSkeleton();

loadAftermarket("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv");

loadOEM("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1094479797&single=true&output=csv");

loadTroubleshoot("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=557855511&single=true&output=csv");

loadManual("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=56637698&single=true&output=csv");

loadManualComponents("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1017192042&single=true&output=csv");

loadManualDashboard("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=81321961&single=true&output=csv");

loadManualMaintenance("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=1981058519&single=true&output=csv");

loadEFI("https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=980811144&single=true&output=csv");