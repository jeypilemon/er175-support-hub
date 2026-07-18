
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

    if (currentTab === "diagnostics") {
        return renderDiagnostics();
    }
    
    if(currentTab==="cvt"){

    if(cvtData.length === 0){

        loadCVT();

    }
    else{

        renderCVT();

    }

    return;

}

    const data = currentTab === "aftermarket"
        ? aftermarketParts
        : oemParts;

    const filtered = data.filter(p => {
        const name = normalizeText(p["Parts Name"]);
        const cat = normalizeText(p["Parts Category"]);

        return (
            (name.includes(searchQuery) || cat.includes(searchQuery)) &&
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

${
    part["Compatibility"]
    ?
    `
    <div class="spec-compatibility">
        ${part["Compatibility"]}
    </div>
    `
    :
    ""
}


${
    part["Brand"]
    ?
    `
    <div class="spec-brand">
        ${part["Brand"]}
    </div>
    `
    :
    ""
}

        </div>

        <a class="button" href="${part["Shopee"]}" target="_blank">
            View Product
        </a>

    </div>
`).join("");

    updateTabUI();
}

function renderTroubleshoot(){

    renderTroubleshootCards();

}


function renderDiagnostics(){

    container.innerHTML = `

        <div id="diagnosticsContent"></div>

    `;

    renderEFI();

}

function renderTroubleshootCards() {

    const filtered = troubleshootData.filter(item => {

        const issue = normalizeText(item["Known Issue"]);
        const sol = normalizeText(item["Possible Solution"]);
        const tags = normalizeText(item["Tags"] || "");

        return (

            (
                issue.includes(searchQuery) ||
                sol.includes(searchQuery) ||
                tags.includes(searchQuery)
            )

            &&

            (
                (
 currentCategory === "All" ||
 item["Tags"]
    .toLowerCase()
    .split(",")
    .map(t=>t.trim())
    .includes(
        currentCategory.toLowerCase().trim()
    )
)
            )

        );

    });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                🔎 No troubleshooting guide found
            </div>
        `;

        return;

    }



    container.innerHTML = filtered.map((item,i)=>{


        const id = `trouble-${i}`;


        return `

<div class="troubleshoot-card">


    <div class="troubleshoot-top"
        onclick="toggleCard('${id}')">

        <div class="trouble-title-area">


            <h3>
                ${item["Known Issue"]}
            </h3>


            <span class="trouble-tag">

                ${item["Tags"] || "General"}

            </span>


        </div>


        <div class="trouble-arrow">
            ▼
        </div>


    </div>



    <div 
    class="troubleshoot-content"
    id="${id}">


        <div class="solution-box">


            <div class="solution-title">

                🔧 Possible Solution

            </div>


            <div class="solution-text">

                ${linkifySolution(
                    item["Possible Solution"]
                )}

            </div>


        </div>


    </div>


</div>


`;

    }).join("");


    updateTabUI();

}

function copyTroubleshoot(index){

    const item = troubleshootData[index];


    const text = 
`
Problem:
${item["Known Issue"]}


Possible Solution:
${item["Possible Solution"]}


Motorstar ER175 Support Hub
`;


    navigator.clipboard.writeText(text);


    alert("Guide copied!");

}



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
    const content = document.getElementById("manualContent");
    if (!content) return;

    // 1. Safe normalization fallback check
    const cleanSearch = typeof normalizeText === 'function' ? normalizeText(searchQuery || "") : (searchQuery || "").toLowerCase();

    // 2. Data Filtering
    const filtered = (window.manualData || manualData || []).filter(item => {
        const cat = item["Category"] || "";
        const spec = item["Specification"] || "";
        const val = item["Value"] || "";
        const notes = item["Notes"] || "";
        
        const searchText = typeof normalizeText === 'function' 
            ? normalizeText(`${cat} ${spec} ${val} ${notes}`) 
            : `${cat} ${spec} ${val} ${notes}`.toLowerCase();

        return searchText.includes(cleanSearch);
    });

    // 3. Clear empty state early if nothing matches
    if (filtered.length === 0) {
        content.innerHTML = `
        <div class="empty-state">
            No manual information found matching "${searchQuery}".
        </div>
        `;
        return;
    }

    // 4. Group data by Category
    const grouped = {};
    filtered.forEach(item => {
        const category = item["Category"] || "General Specifications";
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    });

    // ==========================================
    // 5. COMPACT SPECIFICATIONS RENDERER
    // ==========================================
    content.innerHTML = Object.keys(grouped).map(category => {
        return `
        <section class="manual-section">
            <h3 class="manual-section-title">${category}</h3>
            <div class="manual-card">
                ${grouped[category].map(item => {
                    const specText = item["Specification"] || "Parameter";
                    const valText = item["Value"] || "—";
                    const notesText = item["Notes"] || "";

                    return `
                    <div class="manual-row">
                        <div class="manual-spec-col">
                            <div class="manual-spec">
                                ${typeof safeHighlight === 'function' ? safeHighlight(specText) : specText}
                            </div>
                            ${notesText ? `
                            <div class="manual-spec-notes">
                                ${typeof safeHighlight === 'function' ? safeHighlight(notesText) : notesText}
                            </div>
                            ` : ''}
                        </div>
                        <div class="manual-value">
                            ${typeof safeHighlight === 'function' ? safeHighlight(valText) : valText}
                        </div>
                    </div>
                    `;
                }).join("")}
            </div>
        </section>
        `;
    }).join("");

    if (typeof updateTabUI === 'function') {
        updateTabUI();
    }
}

function updateSearchPlaceholder(){

    const search = document.getElementById("search");

    if(!search) return;

    if(currentTab === "aftermarket"){

        search.placeholder =
        "Search aftermarket parts...";

        return;
    }

    if(currentTab === "oem"){

        search.placeholder =
        "Search OEM parts...";

        return;
    }

    if(currentTab === "manual"){

        switch(currentCategory){

            case "maintenance":
                search.placeholder =
                "Search maintenance items...";
                break;

            case "dashboard":
                search.placeholder =
                "Search dashboard indicators...";
                break;

            case "components":
                search.placeholder =
                "Search engine components...";
                break;

            case "efi":
                search.placeholder =
                "Search symptoms or error codes...";
                break;

            default:
                search.placeholder =
                "Search manual...";
        }

        return;
    }

    if(currentTab === "troubleshoot"){

    search.placeholder =
    "Search issues (e.g. vibration, won't start)...";

    return;

    }

    if(currentTab === "diagnostics"){

    search.placeholder =
    "Search EFI codes, sensors or diagnostics...";

    return;

    }
}

function toggleCard(id){

    const card =
    document.getElementById(id);


    if(!card) return;


    card.classList.toggle("active");


}

function updateTabUI() {

    document.querySelectorAll(".seg").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(
        `[data-tab="${currentTab}"]`
    );

    if (activeBtn) {
        activeBtn.classList.add("active");
    }

}

function switchTab(tab) {

    currentTab = tab;
    currentCategory = "All";

    searchQuery = "";

    const search = document.getElementById("search");
    if (search) {
    search.value = "";
    }

    container.classList.remove("manual-mode");

    if (tab === "manual") {

        currentManualSection = "specs";
        renderManualChips();

    } else {

        renderChips();

    }

    render();

    if (tab === "manual") {

        openManualSection("specs");

    }
    
    updateSearchPlaceholder();

    updateGlobalControls();

    updateTabUI();

    setTimeout(updateChipArrow, 100);

}

function updateGlobalControls(){

    const chipsWrapper =
    document.querySelector(".chips-wrapper");


    const searchBox =
    document.querySelector(".search-box");


    // Hide chips on CVT and Diagnostics
    if(
        currentTab === "cvt" ||
        currentTab === "diagnostics"
    ){

        if(chipsWrapper)
            chipsWrapper.style.display = "none";

    }
    else{

        if(chipsWrapper)
            chipsWrapper.style.display = "flex";

    }



    // Hide search only on CVT
    if(currentTab === "cvt"){

        if(searchBox)
            searchBox.style.display = "none";

    }
    else{

        if(searchBox)
            searchBox.style.display = "block";

    }

}

function setCategory(cat) {
    currentCategory = cat;
    renderChips();
    render();
}

function resetFilters() {

    searchQuery = "";
    manualSearch = "";
    currentCategory = "All";

    const search = document.getElementById("search");

    if (search) {
        search.value = "";
    }

    if (currentTab === "manual") {

        currentManualSection = "specs";

        renderManualChips();

        render();

        openManualSection("specs");

        return;
    }

    renderChips();

    render();

}


const backToTop = document.getElementById("backToTop");

if(backToTop){

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 400){
            backToTop.classList.add("show");
        }else{
            backToTop.classList.remove("show");
        }

    });


    backToTop.addEventListener("click",()=>{

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    });

}