function renderPrecautions() {
    const content = document.getElementById("manualContent");
    if (!content) return;

    const dataset = window.manualPrecautions || manualPrecautions || [];
    const pick = (item, names) => {
        const keys = Object.keys(item || {});
        for (const wanted of names) {
            const exact = keys.find(key => key.trim().toLowerCase() === wanted.toLowerCase());
            if (exact && String(item[exact] || "").trim()) return String(item[exact]).trim();
        }
        const fuzzy = keys.find(key => names.some(name => key.toLowerCase().includes(name.toLowerCase())) && String(item[key] || "").trim());
        return fuzzy ? String(item[fuzzy]).trim() : "";
    };

    // ==========================================
    // 1. PERSISTENT LAYOUT WRAPPER ENGINE
    // ==========================================
    // Initializes the structure once. This stops the text field 
    // from losing focus or glitching while typing a search query.
    let gridContainer = content.querySelector(".precaution-grid");
    if (!gridContainer) {
        content.innerHTML = `
        <div class="manual-tip">
            ⚠️ Always follow these precautions before servicing your ER175A.
        </div>
        <div class="precaution-grid"></div>
        `;
        gridContainer = content.querySelector(".precaution-grid");
    }

    // ==========================================
    // 2. DATA FILTERING
    // ==========================================
    if (!dataset || !dataset.length) {
        const state = window.manualPrecautionsLoadState;
        const message = state === "error"
            ? "Precautions could not be loaded. Please refresh the page or try again later."
            : state === "empty"
                ? "No precaution entries were found in the published sheet."
                : "Precautions are still loading. Please wait a moment or switch sections and return.";
        gridContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${message}</div>`;
        return;
    }

    const filtered = dataset.filter(item => {
        if (!searchQuery) return true;

        const text = typeof normalizeText === 'function' ? normalizeText(Object.values(item).join(" ")) : Object.values(item).join(" ").toLowerCase();

        return text.includes(searchQuery);
    });

    if (!filtered.length) {
        gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            No precautions found matching "${searchQuery}".
        </div>
        `;
        return;
    }

    // ==========================================
    // 3. TARGETED DOM PLACEMENT (SMOOTH UX)
    // ==========================================
    gridContainer.innerHTML = filtered.map(item => {
        const category = pick(item, ["Category", "Group", "Type", "Area"]) || "General";
        const topic = pick(item, ["Topic", "Title", "Precaution", "Subject", "Item", "Do", "Don't"]) || "Safety Notice";
        const instruction = pick(item, ["Instruction", "Description", "Details", "Guideline", "Reminder", "Action", "Precautions"]) || "";
        const notes = pick(item, ["Notes", "Remarks", "Additional Notes", "Explanation"]);

        const negative = instruction.toLowerCase().startsWith("avoid") ||
                         instruction.toLowerCase().startsWith("do not") ||
                         instruction.toLowerCase().startsWith("never");

        return `
        <div class="precaution-card ${negative ? "danger" : "success"}">
            <div class="precaution-header">
                <span class="precaution-category">${category}</span>
                <span class="precaution-badge">
                    ${negative ? "🚫 Avoid" : "✅ Recommended"}
                </span>
            </div>
            
            <div class="precaution-body">
                <h3>${typeof safeHighlight === 'function' ? safeHighlight(topic) : topic}</h3>
                <p>${typeof safeHighlight === 'function' ? safeHighlight(instruction) : instruction}</p>
            </div>

            ${notes ? `
            <div class="precaution-notes">
                📝 ${typeof safeHighlight === 'function' ? safeHighlight(notes) : notes}
            </div>
            ` : ''}
        </div>
        `;
    }).join("");
}