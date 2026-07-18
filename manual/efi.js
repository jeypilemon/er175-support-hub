console.log("EFI.JS LOADED");

function renderEFI(){


const content =
document.getElementById("diagnosticsContent");


if(!content)
return;



const dataset =
window.efiData || [];



console.log(
"RENDER EFI DATA:",
dataset
);



if(!dataset.length){

content.innerHTML =
`
<div class="empty-state">
EFI database loading...
</div>
`;

return;

}





content.innerHTML = `


<div class="efi-dashboard-wrapper">


<div class="efi-header">

<h2>
EFI Diagnostic Center
</h2>


<div class="efi-tip">

ℹ️ Select a problem and press Diagnose

</div>


</div>





<div class="efi-grid">


${

dataset.map(problem=>{


const steps =
parseTroubleshootingSteps(
problem["Inspection & Checks"]
);



return `



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



${(() => {

const difficulty = getEFIDifficulty(problem["Difficulty"]);

return `

<span class="efi-difficulty ${difficulty.class}">
    ${difficulty.label}
</span>

`;

})()}


</div>





<div class="efi-card-bottom">


<span>
🩺 ${steps.length} Diagnostic Steps
</span>



<button
class="efi-btn"
onclick="openEFIDiagnosis('${problem.ID}')">

Diagnose →

</button>



</div>



</div>



`;



}).join("")

}


</div>


</div>


`;



}

function renderEFIModal() {
    window.currentViewerMode = "efi";
    if (typeof setViewerMode === 'function') setViewerMode("efi");

    const modal = document.getElementById("componentModal");
    if (!modal) return;

    // Safety checks for active object models
    const activeProblem = window.currentEFIProblem || currentEFIProblem || {};
    const stepIndex = typeof currentEFIStepIndex !== 'undefined' ? currentEFIStepIndex : 0;
    const stepsArray = window.currentEFIExtractedSteps || window.currentEFISteps || currentEFISteps || [];

    document.getElementById("componentViewerTitle").innerHTML = activeProblem["Error / Symptom"] || "Diagnostic View";
    document.getElementById("componentViewerLocation").innerHTML = activeProblem["Component / System"] || "System Location";

    // Injection of interactive compact step layout controls
    document.getElementById("componentViewerNotes").innerHTML = `
    <div class="efi-progress">Step ${stepIndex + 1} of ${Math.max(1, stepsArray.length)}</div>
    <div class="efi-step-box">
        <p>${stepsArray[stepIndex] || "No steps configured for this issue entry."}</p>
    </div>
    <div class="efi-nav">
        <button type="button" class="efi-nav-btn" onclick="previousEFIStep()" ${stepIndex === 0 ? "disabled" : ""}>◀ Previous</button>
        <button type="button" class="efi-nav-btn" onclick="nextEFIStep()" ${stepIndex >= stepsArray.length - 1 ? "disabled" : ""}>Next ▶</button>
    </div>
    `;

    const zoomImg = (activeProblem["Zoom Image"] || "").trim();
    const image = document.getElementById("componentViewerImage");
    const zoom = document.getElementById("componentViewerZoom");

    if (zoomImg) {
        if (image) image.style.display = "none";
        if (zoom) {
            zoom.src = zoomImg;
            zoom.style.display = "block";
            zoom.onclick = () => window.open(zoomImg, "_blank");
        }
    } else {
        if (zoom) {
            zoom.src = "";
            zoom.style.display = "none";
        }
        if (image) image.style.display = "none";
    }

    modal.classList.add("show");
}

function openGuideImage(title, image){

    currentViewerMode = "guide";
    setViewerMode("guide");

    const modal = document.getElementById("componentModal");

    document.getElementById("componentViewerTitle").innerHTML = title;

    document.getElementById("componentViewerLocation").innerHTML = "";

    document.getElementById("componentViewerNotes").innerHTML = "";

    document.getElementById("componentViewerMarker").style.display = "none";

    document.getElementById("componentViewerImage").style.display = "none";

    const zoom = document.getElementById("componentViewerZoom");

    zoom.src = image;
    zoom.style.display = "block";

    modal.classList.add("show");

}

function getEFIDifficulty(level){

    level = String(level || "Easy").toLowerCase();


    if(level.includes("advanced")){

        return {
            label:"Advanced",
            class:"danger"
        };

    }


    if(
        level.includes("intermediate") ||
        level.includes("moderate")
    ){

        return {
            label:"Intermediate",
            class:"warning"
        };

    }


    return {

        label:"Easy",
        class:"success"

    };

}

function getEFICategory(component){

    const c = String(component || "").toLowerCase();

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


function parseTroubleshootingSteps(text){


    if(!text)
    return [];



    return text
    .split(/\s*(?=\d+\.)/)
    .map(step=>{

        return step
        .replace(/^\d+\.\s*/,"")
        .trim();

    })
    .filter(Boolean);



}



window.openEFIDiagnosis = function(id){

    console.log("OPEN EFI:", id);


    window.currentEFIProblem =
    window.efiData.find(
        x => x.ID == id
    );


    if(!window.currentEFIProblem){

        console.error(
            "EFI ITEM NOT FOUND",
            id
        );

        return;

    }


    renderEFIDiagnosisModal();

};