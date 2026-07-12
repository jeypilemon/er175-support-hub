/*open component modal*/

function openComponentViewer(id){

currentViewerMode = "component";

setViewerMode("component");


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

function previousComponent(){

    if(currentViewerMode === "guide"){
        return;
    }

    if(currentViewerMode === "efi"){
        return;
    }

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

    // Component mode

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


if(currentViewerMode === "guide"){
        return;
    }

    if(currentViewerMode === "efi"){
        return;
    }

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


// Component mode
    currentViewerIndex++;

    if(currentViewerIndex >= manualComponents.length){
        currentViewerIndex = 0;
    }

    openComponentViewer(
        manualComponents[currentViewerIndex]["ID"]
    );

}

function setViewerMode(mode){

    const prev = document.getElementById("viewerPrev");
    const next = document.getElementById("viewerNext");

    if(!prev || !next) return;

    if(mode === "component"){

        prev.style.display = "";
        next.style.display = "";

    }else{

        prev.style.display = "none";
        next.style.display = "none";

    }

}


function openImageModal(image){

    const modal = document.getElementById("imageModal");

    const img = document.getElementById("imageModalImg");

    const download = document.getElementById("imageDownload");

    img.src = image;

    download.href = image;

    modal.classList.add("show");

}

function closeImageModal(){

    document
        .getElementById("imageModal")
        .classList.remove("show");

}