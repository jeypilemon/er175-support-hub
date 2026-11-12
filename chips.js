function openManualSection(section){

    currentManualSection = section;
    currentCategory = section;

    searchQuery = "";

    const search = document.getElementById("search");

    if(search){
        search.value = "";
    }

    updateSearchPlaceholder();

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

function renderChips() {

    const chips = document.getElementById("chips");

    if(!chips) return;


    let cats = [];



    if(currentTab === "aftermarket"){

        cats = aftermarketParts.map(
            p => p["Parts Category"]
        );

    }


    else if(currentTab === "oem"){

        cats = oemParts.map(
            p => p["Parts Category"]
        );

    }


    else if(currentTab === "troubleshoot"){

        cats = troubleshootData.flatMap(
            p => (p["Tags"] || "").split(",")
        );

    }



    cats = [
        ...new Set(
            cats
            .filter(Boolean)
            .map(c=>String(c).trim())
        )
    ]
    .sort((a,b)=>a.localeCompare(b));



    cats.unshift("All");



    chips.innerHTML = cats.map(c=>`

        <button
        class="${c === currentCategory ? "active" : ""}"
        onclick="setCategory('${c}')">

        ${c}

        </button>

    `).join("");

    updateChipArrow();
    requestAnimationFrame(hintChipScroll);

}

function renderTroubleshootTabs(){

    container.innerHTML = `
<div id="troubleshootContent"></div>
`;

    if(currentTroubleshootSection==="common"){

        renderChips();

    }

}

function renderManualChips(){

const chips =
document.getElementById("chips");


const sections = [
    ["specs","Specifications"],
    ["components","ER Component Guide"],
    ["dashboard","Digital Panel"],
    ["maintenance","Maintenance Schedule"],
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

function hintChipScroll(){

    const chips = document.getElementById("chips");
    if(!chips || window.__er175ChipPeekShown) return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if(chips.scrollWidth <= chips.clientWidth + 4) return;

    // Let the welcome explainer and its video finish before showing the hint.
    const waitForIntroToClose = () => {
        const explainerOpen = document.getElementById("explainerModal")?.classList.contains("is-open");
        const videoOpen = document.getElementById("linkModal")?.classList.contains("show");
        if(explainerOpen || videoOpen){
            window.setTimeout(waitForIntroToClose, 350);
            return;
        }
        window.setTimeout(startPeek, 750);
    };

    const startPeek = () => {
        if(window.__er175ChipPeekShown || !document.getElementById("chips")) return;
        const row = document.getElementById("chips");
        if(!row || row.scrollWidth <= row.clientWidth + 4) return;

        window.__er175ChipPeekShown = true;
        let interrupted = false;
        let restoreTimer;

        const cancelHint = () => {
            interrupted = true;
            clearTimeout(restoreTimer);
            row.removeEventListener("pointerdown", cancelHint);
            row.removeEventListener("touchstart", cancelHint);
            row.removeEventListener("wheel", cancelHint);
            row.removeEventListener("keydown", cancelHint);
        };

        row.addEventListener("pointerdown", cancelHint, { once: true });
        row.addEventListener("touchstart", cancelHint, { once: true, passive: true });
        row.addEventListener("wheel", cancelHint, { once: true, passive: true });
        row.addEventListener("keydown", cancelHint, { once: true });

        // Peek, hold the offset long enough to notice, then return.
        row.scrollTo({ left: Math.min(30, row.scrollWidth - row.clientWidth), behavior: "smooth" });
        restoreTimer = window.setTimeout(() => {
            if(!interrupted) row.scrollTo({ left: 0, behavior: "smooth" });
            row.removeEventListener("pointerdown", cancelHint);
            row.removeEventListener("touchstart", cancelHint);
            row.removeEventListener("wheel", cancelHint);
            row.removeEventListener("keydown", cancelHint);
        }, 4550);
    };

    waitForIntroToClose();
}

function scrollChips(){

const chips = document.getElementById("chips");

if(!chips) return;


chips.scrollBy({

left:250,

behavior:"smooth"

});

}

