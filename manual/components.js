let selectedComponentID = null;
let activeComponentCategory = "All";
let activeComponentSide = "Left";
let componentSearch = "";

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



const categories = [
    "All",
    ...new Set(
        manualComponents.map(
            x=>x["Category"]
        )
    )
];



content.innerHTML = `


<div class="component-guide">

<div class="component-toolbar">

<div class="component-side-switch">


<button 
class="${activeComponentSide==="Left"?"active":""}"
onclick="changeComponentSide('Left')">

Left

</button>


<button 
class="${activeComponentSide==="Right"?"active":""}"
onclick="changeComponentSide('Right')">

Right

</button>


</div>


</div>

<div class="component-bike-area">


<div class="bike-image-wrapper">


<img 
id="componentBikeImage"
src="assets/images/er175-sideview-${activeComponentSide.toLowerCase()}.png"
class="bike-image"
>



<div id="componentMarkers"></div>


</div>


</div>




</div>


`;



renderComponentMarkers();

}


function renderComponentMarkers(){


const container =
document.getElementById("componentMarkers");


if(!container) return;



let data =
manualComponents.filter(item=>{


let categoryMatch =
activeComponentCategory==="All" ||
item["Category"]===activeComponentCategory;



let sideMatch =
(item["Image Side"]||"").toLowerCase()
===
activeComponentSide.toLowerCase();



let searchMatch =
(
item["Component"]+
item["Category"]+
item["Location"]
)
.toLowerCase()
.includes(
componentSearch.toLowerCase()
);



return categoryMatch &&
sideMatch &&
searchMatch;


});




container.innerHTML = data.map(item=>`


<button

class="
component-marker
${selectedComponentID==item.ID?"active":""}
"


style="

left:${item["X Position"]}%;

top:${item["Y Position"]}%;

"


onclick="selectComponent('${item.ID}')"


title="${item["Component"]}"

>

</button>


`).join("");



}

function selectComponent(id) {
    selectedComponentID = id;
    const item = manualComponents.find(x => x.ID == id);
    if (!item) return;
    openComponentDetailModal(item);
    renderComponentMarkers();
}

function openComponentDetailModal(item) {
    const modal = document.getElementById("componentDetailModal");
    if (!modal || !item) return;
    const image = document.getElementById("componentDetailImage");
    const download = document.getElementById("componentDetailDownload");
    document.getElementById("componentDetailTitle").textContent = item["Component"] || "";
    document.getElementById("componentDetailCategory").textContent = item["Category"] || "";
    document.getElementById("componentDetailLocation").textContent = item["Location"] || "Not specified";
    document.getElementById("componentDetailFunction").textContent = item["Function"] || "Function details not yet provided.";
    document.getElementById("componentDetailNotes").textContent = item["Access / Notes"] || "No additional access notes.";

    const imageUrl = typeof getSafeHttpUrl === "function"
        ? getSafeHttpUrl(item["Component Image"])
        : (item["Component Image"] || "").trim();

    if (imageUrl) {
        image.src = imageUrl;
        image.alt = (item["Component"] || "Component") + " location reference";
        image.hidden = false;
        download.href = imageUrl;
        download.hidden = false;
    } else {
        image.removeAttribute("src");
        image.hidden = true;
        download.removeAttribute("href");
        download.hidden = true;
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("component-detail-open");
    const closeButton = modal.querySelector(".component-detail-close");
    if (closeButton) closeButton.focus();
}

function closeComponentDetailModal() {
    const modal = document.getElementById("componentDetailModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("component-detail-open");
    const image = document.getElementById("componentDetailImage");
    if (image) image.removeAttribute("src");
}

(function initComponentDetailModal() {
    if (window.__er175ComponentDetailModalReady) return;
    window.__er175ComponentDetailModalReady = true;
    document.addEventListener("click", event => {
        const modal = document.getElementById("componentDetailModal");
        if (modal && event.target === modal) closeComponentDetailModal();
    });
    document.addEventListener("keydown", event => {
        const modal = document.getElementById("componentDetailModal");
        if (event.key === "Escape" && modal && modal.classList.contains("show")) closeComponentDetailModal();
    });
})();


function filterComponentCategory(category){


activeComponentCategory = category;


renderManualComponents();


}


function changeComponentSide(side){

activeComponentSide = side;

renderManualComponents();

}



function searchComponent(value){

componentSearch=value;

renderComponentMarkers();

}


let currentTroubleshootIndex = 0;


function openTroubleshootModal(index){

    currentTroubleshootIndex = index;

    const item =
    troubleshootData[index];


    document.getElementById(
        "componentViewerTitle"
    ).innerHTML =
    item["Known Issue"];


    document.getElementById(
        "componentViewerLocation"
    ).innerHTML =
    "Troubleshooting";


    document.getElementById(
        "componentViewerNotes"
    ).innerHTML =
    linkifySolution(
        item["Possible Solution"]
    );


    document
    .getElementById("componentModal")
    .classList.add("show");

}

function nextTroubleshoot(){


    currentTroubleshootIndex++;


    if(currentTroubleshootIndex >= troubleshootData.length){

        currentTroubleshootIndex = 0;

    }


    openTroubleshootModal(
        currentTroubleshootIndex
    );

}




function previousTroubleshoot(){


    currentTroubleshootIndex--;


    if(currentTroubleshootIndex < 0){

        currentTroubleshootIndex =
        troubleshootData.length - 1;

    }


    openTroubleshootModal(
        currentTroubleshootIndex
    );


}