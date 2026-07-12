function renderMistakes(){

    const content =
    document.getElementById("manualContent");

    if(!manualMistakes.length){

        content.innerHTML=`
        <div class="empty-state">
            Common mistakes loading...
        </div>
        `;

        return;

    }

    const filtered =
    manualMistakes.filter(item=>{

        if(!searchQuery) return true;

        const text = normalizeText(

        (item["Category"] || "") + " " +
        (item["Mistake"] || "") + " " +
        (item["Why It Happens"] || "") + " " +
        (item["Possible Result"] || "") + " " +
        (item["Recommendation"] || "")

);
        return text.includes(searchQuery);

    });

    if(!filtered.length){

        content.innerHTML=`
        <div class="empty-state">
            No common mistakes found.
        </div>
        `;

        return;

    }

    content.innerHTML=`

<div class="manual-tip">

🚫 Learn from common servicing mistakes to avoid costly repairs.

</div>

<div class="mistake-grid">

${filtered.map(item=>`

<div class="mistake-card">

<span class="mistake-category">

${item["Category"]}

</span>

<div class="mistake-box">

❌ <strong>${safeHighlight(item["Mistake"])}</strong>

<p>

${safeHighlight(item["Why It Happens"])}

</p>

</div>

<div class="cause-box">

⚠️ <strong>Possible Result</strong>

<p>

${safeHighlight(item["Possible Result"])}

</p>

</div>

<div class="correct-box">

✅ <strong>Recommendation</strong>

<p>

${safeHighlight(item["Recommendation"])}

</p>

</div>

</div>

`).join("")}

</div>

`;

}