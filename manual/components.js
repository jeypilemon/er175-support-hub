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



const grouped = manualComponents.reduce((groups,item)=>{

    const category = item["Category"] || "Other";

    if(!groups[category]){
        groups[category] = [];
    }

    groups[category].push(item);

    return groups;

},{});



content.innerHTML = `


<div class="component-preview">

    <div class="component-preview-title">
        ER175 Component Location Guide
    </div>

    <div class="component-preview-image">

        <img src="assets/images/er175-sideview-left.png">

    </div>

    <p>
        Select a component below to view location and access information.
    </p>

</div>



<div class="component-grid">


${Object.entries(grouped)
.map(([category,items])=>`


<section class="component-section">


<h3 class="component-category-title">
${category}
</h3>


<div class="component-cards">


${items.map(item=>`


<div 
class="component-card"
onclick="openComponentViewer('${item["ID"]}')"
>


<h4>
${item["Component"]}
</h4>


<span>
${item["Location"]}
</span>


</div>


`).join("")}


</div>


</section>


`).join("")}


</div>


`;

}