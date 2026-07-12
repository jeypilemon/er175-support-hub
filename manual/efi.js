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

        return text.includes(searchQuery);

    });

    content.innerHTML=`

<div class="efi-header">

<h2>EFI Diagnostic Center</h2>

<div class="efi-tip">
    <span class="efi-tip-icon">ℹ️</span>
    <div>
        <strong>How to use</strong><br>
        Select a symptom below, then tap <b>Diagnose →</b> to follow the step-by-step troubleshooting guide.
    </div>
</div>

</div>

<div class="efi-guide-grid">

    <div class="efi-guide-card"
         onclick="openImageModal(
'assets/images/component/mil-flash-example.png'
)">

        <img src="assets/images/component/mil-flash-example.png">

        <h3>MIL Flash Example</h3>

        <p>Understand long and short MIL flashes.</p>

    </div>

    <div class="efi-guide-card"
         onclick="openImageModal(
'assets/images/component/obd-manual-ecu-clearing.png'
)">

        <img src="assets/images/component/obd-manual-ecu-clearing.png">

        <h3>Manual OBD Query & Clearing</h3>

        <p>Read and erase EFI fault codes manually.</p>

    </div>

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


function openEFIDiagnosis(id){

    currentEFIProblem = efiData.find(x=>x.ID==id);

    if(!currentEFIProblem) return;

    currentEFISteps = parseTroubleshootingSteps(
        currentEFIProblem["Possible Cause & Troubleshooting Steps (Sequential)"]
    );

    currentEFIStepIndex = 0;

    renderEFIModal();

}

function renderEFIModal(){

    currentViewerMode = "efi";
    setViewerMode("efi");

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
const zoomImg = currentEFIProblem["Zoom Image"]?.trim();

const image = document.getElementById("componentViewerImage");
const marker = document.getElementById("componentViewerMarker");
const zoom = document.getElementById("componentViewerZoom");

// Hide marker (EFI doesn't use map markers)
marker.style.display = "none";

if (zoomImg) {

    image.style.display = "none";

    zoom.src = zoomImg;
    zoom.style.display = "block";

    zoom.onclick = () => {
        window.open(zoomImg, "_blank");
    };

} else {

    zoom.src = "";
    zoom.style.display = "none";

    image.style.display = "none";

}

    modal.classList.add("show");

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

    if(!text) return [];

    const matches = text.match(/(?:^|\n)\d+\.\s[\s\S]*?(?=(?:\n\d+\.\s)|$)/g);

    if(!matches) return [text];

    return matches.map(step=>{

        return step
            .replace(/^\s*\d+\.\s*/,"")
            .trim();

    });

}