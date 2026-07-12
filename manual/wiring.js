/**
 * Motorstar ER175 Support Hub - Wiring Manual Logic
 * Driven dynamically via Spreadsheet data
 */

function renderWiring() {
    const content = document.getElementById("manualContent") || document.getElementById("products");
    if (!content) return;

    // Pull directly from the global window state we populated above
    const dataset = window.manualWiring;

    if (!dataset || !dataset.length) {
        content.innerHTML = `
        <div class="empty-state">
            Wiring data loading...
        </div>
        `;
        return;
    }

    const filtered = dataset.filter(item => {
        // Match column names EXACTLY as they appear in your Google Sheet header row
        const rawCode = (item["Wire Code"] || "").toString().trim().toLowerCase();
        
        // Hide empty or explicitly unused rows
        if (!rawCode || rawCode === "" || rawCode === "-" || rawCode === "unused" || rawCode === "no code listed") {
            return false;
        }

        // Apply active global text search strings across fields
        if (typeof searchQuery !== 'undefined' && searchQuery) {
            const system = (item["System"] || "");
            const color = (item["Wire Color"] || "");
            const component = (item["Component / Function"] || "");
            const notes = (item["Notes"] || "");
            
            const combinedText = `${system} ${rawCode} ${color} ${component} ${notes}`.toLowerCase();
            return combinedText.includes(searchQuery.toLowerCase());
        }

        return true;
    });

    if (!filtered.length) {
        content.innerHTML = `
        <div class="empty-state">
            No active wiring information found matching your filters.
        </div>
        `;
        return;
    }

    content.innerHTML = `
    <div class="manual-tip">
        💡 Tap any wire card to quickly identify the circuit.
    </div>
    <div class="wiring-grid">
    ${filtered.map(item => {
        const system = item["System"] || "General";
        const code = item["Wire Code"] || "-";
        const color = item["Wire Color"] || "Standard Color";
        const func = item["Component / Function"] || "No Description";
        const notes = item["Notes"] || "";

        // Hex Code translation engine for clean UI generation
        const colorHex = {
            'Black': '#1a1a1a', 'White': '#f0f0f0', 'Red': '#ff4d4d', 
            'Yellow': '#ffcc00', 'Green': '#2ecc71', 'Brown': '#8b5a2b', 
            'Pink': '#ff99cc', 'Orange': '#ff9f43', 'Blue': '#3498db', 'Purple': '#9b59b6'
        };

        let tagStyle = '';
        let textColor = '#ffffff'; 

        const colorParts = color.split(' / ').map(c => c.trim());
        const mainColor = colorHex[colorParts[0]];
        const stripeColor = colorParts[1] ? colorHex[colorParts[1]] : null;

        if (mainColor) {
            if (stripeColor) {
                tagStyle = `background: linear-gradient(135deg, ${mainColor} 50%, ${stripeColor} 50%);`;
            } else {
                tagStyle = `background: ${mainColor};`;
            }
            
            if (colorParts[0] === 'White' || colorParts[0] === 'Yellow') {
                textColor = '#121821'; 
            }
        } else {
            tagStyle = `background: var(--bg); border: 1px solid var(--border);`;
            textColor = `var(--accent)`;
        }

        tagStyle += ` color: ${textColor};`;

        return `
        <div class="wiring-card">
            <div class="wiring-header">
                <span class="wire-system">${system}</span>
                <div class="wire-code-container">
                    <span class="wire-code" style="${tagStyle}">${code}</span>
                </div>
            </div>
            <div class="wiring-body">
                <h3>${typeof safeHighlight === 'function' ? safeHighlight(func) : func}</h3>
                <span class="wire-color-text">Color Code: ${color}</span>
                ${notes ? `<p>${typeof safeHighlight === 'function' ? safeHighlight(notes) : notes}</p>` : ''}
            </div>
        </div>
        `;
    }).join("")}
    </div>
    `;
}