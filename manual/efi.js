

function renderEFI(){


const content =
document.getElementById("diagnosticsContent");


if(!content)
return;



const dataset =
window.efiData || [];


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


<div class="efi-guide-section">

    <div class="efi-guide-grid">

        <!-- GUIDE 1 -->

        <div class="efi-guide-card">

            <img
                src="assets/images/manual-clearing-guide.png"
                onclick="openGuideImage(
                    'Manual Clearing / Reading Error Codes',
                    'assets/images/manual-clearing-guide.png'
                )"
            >

            <div class="guide-content">

                <h3>Manual Clearing / Reading Error Codes</h3>

                <p>
                    Step-by-step guide for clearing MIL without an OBD scanner.
                </p>

                <div class="guide-buttons">

                    <button
                        class="efi-btn"
                        onclick="openGuideImage(
                        'Manual Clearing / Reading Error Codes',
                        'assets/images/manual-clearing-guide.png'
                    )">

                        👁 View Full

                    </button>

                    <a
                        class="efi-download"
                        href="assets/images/manual-clearing-guide.png"
                        download>

                        ⬇ Download

                    </a>

                </div>

            </div>

        </div>


        <!-- GUIDE 2 -->

        <div class="efi-guide-card">

            <img
                src="assets/images/mil-reading-guide.png"
                onclick="openGuideImage(
                    'How to Read MIL Flash Codes',
                    'assets/images/mil-reading-guide.png'
                )"
            >

            <div class="guide-content">

                <h3>How to Read MIL Flash Codes</h3>

                <p>
                    Understand long flashes, short flashes and how to identify the correct error code.
                </p>

                <div class="guide-buttons">

                    <button
                        class="efi-btn"
                        onclick="openGuideImage(
                        'How to Read MIL Flash Codes',
                        'assets/images/mil-reading-guide.png'
                    )">

                        👁 View Full

                    </button>

                    <a
                        class="efi-download"
                        href="assets/images/mil-reading-guide.png"
                        download>

                        ⬇ Download

                    </a>

                </div>

            </div>

        </div>

    </div>

</div>

<div class="efi-header">
    <h2>EFI Diagnostic Center</h2>
    <div class="efi-tip">ℹ️ Select a problem and press Diagnose</div>
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
🗒️ ${steps.length} Diagnostic Steps
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

    const title = document.getElementById("componentViewerTitle");
    const location = document.getElementById("componentViewerLocation");
    const notes = document.getElementById("componentViewerNotes");
    if (!title || !location || !notes) return;

    title.textContent = activeProblem["Error / Symptom"] || "Diagnostic View";
    location.textContent = activeProblem["Component / System"] || "System Location";

    // Injection of interactive compact step layout controls
    notes.innerHTML = `
    <div class="efi-progress">Step ${stepIndex + 1} of ${Math.max(1, stepsArray.length)}</div>
    <div class="efi-step-box">
        <p>${escapeHTML(stepsArray[stepIndex] || "No steps configured for this issue entry.")}</p>
    </div>
    <div class="efi-nav">
        <button type="button" class="efi-nav-btn" onclick="previousEFIStep()" ${stepIndex === 0 ? "disabled" : ""}>◀ Previous</button>
        <button type="button" class="efi-nav-btn" onclick="nextEFIStep()" ${stepIndex >= stepsArray.length - 1 ? "disabled" : ""}>Next ▶</button>
    </div>
    `;

    const zoomImg = getSafeHttpUrl(activeProblem["Zoom Image"] || "");
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

    const safeImage = getSafeHttpUrl(image);
    if (!safeImage) {
        console.warn("Blocked an invalid guide image URL:", image);
        return;
    }

    currentViewerMode = "guide";
    setViewerMode("guide");

    const modal = document.getElementById("componentModal");

    document.getElementById("componentViewerTitle").textContent = title;

    document.getElementById("componentViewerLocation").innerHTML = "";

    document.getElementById("componentViewerNotes").innerHTML = `
        <div class="guide-download">
            <a
                class="efi-download"
                href="${escapeHTML(safeImage)}"
                download>
                ⬇ Download PNG
            </a>
        </div>
    `;

    const zoom = document.getElementById("componentViewerZoom");

    zoom.src = safeImage;
    zoom.style.display = "block";

    zoom.onclick = () => {

    closeComponentViewer();

    openImageModal(safeImage);

};

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