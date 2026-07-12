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
    ["components","ER Component Guide"],
    ["dashboard","Digital Panel"],
    ["maintenance","Maintenance Schedule"],
    ["efi","EFI Diagnostics"],
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

