function renderPrecautions(){

    const content =
    document.getElementById("manualContent");

    if(!manualPrecautions.length){

        content.innerHTML=`
        <div class="empty-state">
            Precautions loading...
        </div>
        `;

        return;

    }

    const filtered =
    manualPrecautions.filter(item=>{

        if(!searchQuery) return true;

        const text = normalizeText(

        (item["Category"] || "") + " " +
        (item["Topic"] || "") + " " +
        (item["Instruction"] || "") + " " +
        (item["Notes"] || "")

);

        return text.includes(searchQuery);

    });

    if(!filtered.length){

        content.innerHTML=`
        <div class="empty-state">
            No precautions found.
        </div>
        `;

        return;

    }

    content.innerHTML=`

<div class="manual-tip">

⚠️ Always follow these precautions before servicing your ER175A.

</div>

<div class="precaution-grid">

${filtered.map(item=>{

const instruction = item["Instruction"] || "";

const negative =

instruction.toLowerCase().startsWith("avoid") ||
instruction.toLowerCase().startsWith("do not") ||
instruction.toLowerCase().startsWith("never");

return`

<div class="precaution-card ${negative?"danger":"success"}">

<div class="precaution-category">

${item["Category"]}

</div>

<div class="precaution-badge">

${negative?"🚫 Avoid":"✅ Recommended"}

</div>

<h3>

${safeHighlight(item["Topic"])}

</h3>

<p>

${safeHighlight(instruction)}

</p>

<div class="precaution-notes">

📝 ${safeHighlight(item["Notes"]||"")}

</div>

</div>

`;

}).join("")}

</div>

`;

}