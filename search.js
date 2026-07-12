function handleGlobalSearch(value){

    searchQuery = normalizeText(value);

    renderSuggestion();

    if(currentTab === "manual"){

        if(searchQuery){

            renderManualSearch();

        }else{

            openManualSection(currentManualSection);

        }

        return;

    }

    if(currentTab === "troubleshoot"){

        renderTroubleshoot();
        return;

    }

    render();

}


function renderManualSearch(){

    const content =
    document.getElementById("manualContent");

    if(!searchQuery){

        openManualSection(currentManualSection);

        return;

    }

    const filtered =
    manualSearchIndex.filter(item=>{

        const text = normalizeText(

            (item["Section"]||"") + " " +
            (item["Category"]||"") + " " +
            (item["Title"]||"") + " " +
            (item["Content"]||"")

        );

        return text.includes(searchQuery);

    });

    if(!filtered.length){

        content.innerHTML=`

        <div class="empty-state">

            No manual results found.

        </div>

        `;

        return;

    }

    content.innerHTML=`

<div class="search-results">

${filtered.map(item=>`

<div class="search-card"

onclick="openSearchResult(
'${item["Section"]}'
)">

<div class="search-section">

${item["Section"]}

</div>

<h3>

${safeHighlight(item["Title"])}

</h3>

<p>

${safeHighlight(item["Content"])}

</p>

</div>

`).join("")}

</div>

`;

}


function openSearchResult(section){

    switch(section.toLowerCase()){

        case "specifications":

            openManualSection("specs");

            break;

        case "components":

            openManualSection("components");

            break;

        case "dashboard":

            openManualSection("dashboard");

            break;

        case "maintenance":

            openManualSection("maintenance");

            break;

        case "efi":

            openManualSection("efi");

            break;

        case "wiring":

            openManualSection("wiring");

            break;

        case "precautions":

            openManualSection("precautions");

            break;

        case "common mistakes":

            openManualSection("mistakes");

            break;

    }

}