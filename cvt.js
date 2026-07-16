function uniqueValues(column){
    let values = [
        ...new Set(
            cvtData
            .map(item => item[column])
            .filter(Boolean)
        )
    ];

    return values.map(value => `
        <option value="${value}">
            ${value}
        </option>
    `).join("");
}

function renderCVT(){
    const container = document.getElementById("products");
    if(!container) return;

    container.innerHTML = `
        <div class="cvt-container">
            <h2>⚙️ Motorstar ER175 Fi CVT Tuner</h2>
            <p class="cvt-sub">Compare CVT setups for acceleration, speed and riding style.</p>

            <div class="cvt-controls">
                <div>
                    <label>Roller Weight</label>
                    <select id="rollerSelect" onchange="updateCVT()">
                        ${uniqueValues("Roller Weight")}
                    </select>
                </div>

                <div>
                    <label>Center Spring</label>
                    <select id="centerSelect" onchange="updateCVT()">
                        ${uniqueValues("Center Spring")}
                    </select>
                </div>

                <div>
                    <label>Clutch Spring</label>
                    <select id="clutchSelect" onchange="updateCVT()">
                        ${uniqueValues("Clutch Spring")}
                    </select>
                </div>
            </div>

            <div class="cvt-results-grid">
                <div id="cvtResult" class="cvt-result"></div>
                
                <div class="cvt-score-card">
                    <h3>Performance Dynamics</h3>
                    
                    <div class="score-box">
                        <label>🏍️ Acceleration</label>
                        <div class="bar"><div id="accelBar" style="width: 0%"></div></div>
                        <strong id="accelValue">0/100</strong>
                    </div>

                    <div class="score-box">
                        <label>🔝 Top Speed</label>
                        <div class="bar"><div id="speedBar" style="width: 0%"></div></div>
                        <strong id="speedValue">0/100</strong>
                    </div>

                    <div class="score-box">
                        <label>⛽ Fuel Economy</label>
                        <div class="bar"><div id="fuelBar" style="width: 0%"></div></div>
                        <strong id="fuelValue">0/100</strong>
                    </div>

                    <div class="score-box">
                        <label>⛰️ Uphill Ability</label>
                        <div class="bar"><div id="uphillBar" style="width: 0%"></div></div>
                        <strong id="uphillValue">0/100</strong>
                    </div>
                </div>
            </div>

            <div id="cvtTags" class="cvt-tags"></div>
            <div id="cvtCompare" class="cvt-compare"></div>

            <div class="cvt-disclaimer">
                ⚠️ Simulation only: Actual results may vary depending on rider weight, road condition, engine condition, tire size, fuel quality, CVT wear, parts combination, and installation accuracy.
            </div>
        </div>
    `;

    updateCVT();
}

function updateCVT(){
    let roller = document.getElementById("rollerSelect")?.value;
    let center = document.getElementById("centerSelect")?.value;
    let clutch = document.getElementById("clutchSelect")?.value;

    if(!roller) return;

    let setup = cvtData.find(x => 
        x["Roller Weight"] == roller && 
        x["Center Spring"] == center && 
        x["Clutch Spring"] == clutch
    );

    if(!setup) return;

    let result = {
        name: setup["Preset Name"],
        type: setup["Type"] || "General",
        roller: setup["Roller Weight"],
        center: setup["Center Spring"],
        clutch: setup["Clutch Spring"],
        uphill: Number(setup["Uphill Score"]) || 0,
        fuel: Number(setup["Fuel Economy Score"]) || 0,
        speed: Number(setup["Top Speed Score"]) || 0,
        accel: Number(setup["Acceleration Score"]) || 0,
        topSpeed: setup["Estimated Top Speed"] || "N/A",
        rpm: setup["RPM Holding"] || "Balanced",
        launch: setup["Launch Feel"] || "Normal",
        stress: setup["Engine Stress"] || "Low",
        weight: setup["Rider Weight Range"] || "60-90kg",
        character: setup["CVT Character"] || "",
        riding: setup["Recommended Riding"] || "",
        notes: setup["Notes"] || ""
    };

    // RESULT CARD (Fixed the missing closing div tag for cvt-spec-grid here)
    document.getElementById("cvtResult").innerHTML = `
        <div class="cvt-title">
            <h2>⚙️ ${result.name}</h2>
            <span class="cvt-type">${result.type}</span>
        </div>

        <h3>⚙️ CVT Setup</h3>
        <div class="cvt-spec-grid">
            <div>
                <strong>${result.roller}</strong>
                <span>Flyball</span>
            </div>
            <div>
                <strong>${result.center}</strong>
                <span>Center Spring</span>
            </div>
            <div>
                <strong>${result.clutch}</strong>
                <span>Clutch Spring</span>
            </div>
        </div> 
    `;

    // PROGRESS BARS & SCORES
    const metrics = ['accel', 'speed', 'fuel', 'uphill'];
    metrics.forEach(metric => {
        let bar = document.getElementById(`${metric}Bar`);
        let value = document.getElementById(`${metric}Value`);
        if(bar) bar.style.width = result[metric] + "%";
        if(value) value.innerHTML = result[metric] + "/100";
    });

    // TAGS
    let tags = document.getElementById("cvtTags");
    if(tags){
        tags.innerHTML = `
            <span>🔧CVT Setup for  ${result.type}</span>
            <span>${getStressIcon(result.stress)} ${result.stress}</span>
            <span>📈${result.rpm}</span>
            <span>${getLaunchIcon(result.launch)} ${result.launch}</span>
            <span>🏋️Best for ${result.weight}</span>
        `;
    }

    // COMPARE & ADDITIONAL INFO
    let compareDiv = document.getElementById("cvtCompare");
    if(compareDiv) {
        compareDiv.innerHTML = `
            <strong>Character:</strong> ${result.character || 'Balanced setup'} <br/>
            <strong>Best For:</strong> ${result.riding || 'Daily Commute'}
        `;
    }
}

function getStressIcon(value){
    value = value || "";
    if(value.includes("Extreme")) return "🔥Engine Stress";
    if(value.includes("Very High")) return "🔥Engine Stress";
    if(value.includes("High")) return "🔥Engine Stress";
    if(value.includes("Medium")) return "⚠️Engine Stress";
    if(value.includes("Low")) return "✅Engine Stress";
    return "✅ Engine Stress: Normal ";
}

function getLaunchIcon(value){
    value = value || "";
    if(value.includes("Smooth")) return "😎Launch Feel";
    if(value.includes("Strong")) return "💪Launch Feel";
    if(value.includes("Very Aggressive")) return "👹";
    if(value.includes("Aggressive")) return "😡Launch Feel";
    if(value.includes("Snappy")) return "🫰Launch Feel";
    if(value.includes("Quick")) return "👌Launch Feel";
    if(value.includes("Normal")) return "💚Launch Feel";
    return "🚀 Launch Feel: ";
}