
function renderSkeleton(count = 6) {
    const safeCount = Math.max(0, Math.min(24, Number(count) || 0));
    container.innerHTML = Array.from({ length: safeCount }, () => `
        <div class="card skeleton-card">
            <div class="skeleton image"></div>
            <div class="skeleton text short"></div>
            <div class="skeleton text"></div>
            <div class="skeleton text"></div>
        </div>
    `).join("");
}

/** Build one parts card. Keep its class names stable for the existing CSS. */
function renderPartCard(part) {
    const name = escapeHTML(part["Parts Name"] || "Unnamed part");
    const category = escapeHTML(part["Parts Category"] || "");
    const preview = getSafeHttpUrl(part["Preview"]);
    const spec = String(part["Spec Size"] || "").trim();
    const compatibility = String(part["Compatibility"] || "").trim();
    const shopee = getSafeHttpUrl(part["Shopee"]);
    const lazada = getSafeHttpUrl(part["Lazada"]);
    const specClass = spec.toLowerCase().includes("plug") ? " plug-fit" : "";

    return `
        <div class="card">
            ${preview ? `<img class="product-card-image" src="${escapeHTML(preview)}" data-full-image="${escapeHTML(preview)}" alt="View full image of ${name}" role="button" tabindex="0" aria-label="View full-size image of ${name}" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">` : ""}
            <div class="card-content">
                <h3>${name}</h3>
                <span class="category category-tag">${category}</span>
                ${spec ? `<div class="specs${specClass}">${escapeHTML(spec)}</div>` : ""}
                ${compatibility ? `<div class="spec-compatibility">${escapeHTML(compatibility)}</div>` : ""}
                <div class="card-actions">
                    ${shopee ? `<a class="button button-shopee" href="${escapeHTML(shopee)}" target="_blank" rel="noopener noreferrer">Buy in Shopee</a>` : ""}
                    ${lazada ? `<a class="button button-lazada" href="${escapeHTML(lazada)}" target="_blank" rel="noopener noreferrer">Buy in Lazada</a>` : ""}
                    ${shopee ? `<button class="copy-btn" type="button" data-copy-url="${escapeHTML(shopee)}" onclick="copyAffiliateLink(this.dataset.copyUrl)" aria-label="Copy Shopee link">🔗</button>` : ""}
                </div>
            </div>
        </div>
    `;
}

/** Build a troubleshooting card while preserving the existing expand behavior. */
function renderTroubleshootCard(item, index) {
    const id = `trouble-${index}`;
    const issue = escapeHTML(item["Known Issue"] || "Untitled issue");
    const tags = escapeHTML(item["Tags"] || "General");

    return `
        <div class="troubleshoot-card">
            <div class="troubleshoot-top" onclick="toggleCard('${id}')">
                <div class="trouble-title-area">
                    <h3>${issue}</h3>
                    <span class="trouble-tag">${tags}</span>
                </div>
                <div class="trouble-arrow">▼</div>
            </div>
            <div class="troubleshoot-content" id="${id}">
                <div class="solution-box">
                    <div class="solution-title">🔧 Possible Solution</div>
                    <div class="solution-text">${linkifySolution(item["Possible Solution"] || "")}</div>
                </div>
            </div>
        </div>
    `;
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
        const name = getNormalizedField(p, "Parts Name");
        const cat = getNormalizedField(p, "Parts Category");

        return (
            (name.includes(searchQuery) || cat.includes(searchQuery)) &&
            (currentCategory === "All" || p["Parts Category"] === currentCategory)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state">${getEmptyStateMessage()}</div>`;
        return;
    }

    container.innerHTML = filtered.map(renderPartCard).join("");

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

        const issue = getNormalizedField(item, "Known Issue");
        const sol = getNormalizedField(item, "Possible Solution");
        const tags = getNormalizedField(item, "Tags");

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



    container.innerHTML = filtered.map(renderTroubleshootCard).join("");

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

    <section class="manual-download-card" aria-labelledby="manualDownloadTitle">
        <div class="manual-download-copy">
            <span class="manual-download-kicker">DIGITAL REFERENCE</span>
            <h2 id="manualDownloadTitle">Looking for the E-Manual?</h2>
            <p>Scanned document · Motorcycle owner's manual · 2025</p>
        </div>
        <a class="manual-download-btn"
           href="https://drive.google.com/file/d/1xJyf7sNn1Nlo7X4r0a3X6W_R5pUabHbQ/view"
           target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">↓</span> Download Owner's Manual (PDF)
        </a>
    </section>

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
        search.placeholder = "Search...";
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
    document.body.classList.toggle("diagnostics-active", tab === "diagnostics");
    document.body.classList.toggle("manual-active", tab === "manual");
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
    if (typeof renderMostSearchedProducts === "function") renderMostSearchedProducts();

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

if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("show", window.scrollY > 350);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}



function updateSiteStats(){

    const set = (id,value)=>{

        const el = document.getElementById(id);

        if(el){

            el.textContent = value;

        }

    };

    set("partsCount", aftermarketParts.length);

    set("manualCount",
        manualData.length +
        manualComponents.length +
        manualDashboard.length +
        manualMaintenance.length +
        manualPrecautions.length +
        manualMistakes.length +
        manualSearchIndex.length
    );

    set("repairCount", troubleshootData.length);

    set("cvtCount", cvtData.length);

}


/*share site*/

const shareBtn = document.getElementById("shareSite");

if (shareBtn) shareBtn.addEventListener("click", async () => {

    const shareData = {
        title: document.title,
        text: "Motorstar ER175A FI Support Hub",
        url: window.location.href
    };

    if (navigator.share) {

        try{

            await navigator.share(shareData);

        }catch(e){}

    }else{

        navigator.clipboard.writeText(window.location.href);

        alert("Link copied!");

    }

});


function showToast(message){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(()=>{

        toast.classList.remove("show");

    },1800);

}