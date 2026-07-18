// STOCK REFERENCE

const stockCVT = {

    name:
    "Stock ER175A Reference",

    roller:
    "14g-14.5g",

    center:
    "1200-1500 RPM",

    clutch:
    "1000-1200 RPM",


    accel:
    70,


    speed:
    88,


    fuel:
    90,


    uphill:
    75
    

};


// ======================================
// COMPARE CURRENT VS STOCK
// ======================================


function compareCVT(current){


    return {


        accelDiff:
        current.accel - stockCVT.accel,


        speedDiff:
        current.speed - stockCVT.speed,


        fuelDiff:
        current.fuel - stockCVT.fuel,


        uphillDiff:
        current.uphill - stockCVT.uphill


    };


}

// ======================================
// RENDER COMPARISON CARD
// ======================================

function renderCVTCompare(result){

    let box = document.getElementById("cvtCompare");

    if(!box)
        return;


    let compare = compareCVT(result);


    box.innerHTML = `

        <h3>
        🔧 vs Stock ER175A
        </h3>


        <p class="compare-sub">
        Stock: ${stockCVT.roller} Roller |
        ${stockCVT.center} Center |
        ${stockCVT.clutch} Clutch
        </p>


        <div class="compare-grid">


            ${createCompareCard(
                "🏍️",
                "Acceleration",
                stockCVT.accel,
                result.accel,
                compare.accelDiff
            )}



            ${createCompareCard(
                "🔝",
                "Top Speed",
                stockCVT.speed,
                result.speed,
                compare.speedDiff
            )}



            ${createCompareCard(
                "⛽",
                "Fuel Economy",
                stockCVT.fuel,
                result.fuel,
                compare.fuelDiff
            )}



            ${createCompareCard(
                "⛰️",
                "Uphill",
                stockCVT.uphill,
                result.uphill,
                compare.uphillDiff
            )}




        </div>

        
        <div class="cvt-character">

        <strong>🎯 Character:</strong>
        ${result.character || "Balanced setup"}

        <br>

        <strong>🏍️ Best For:</strong>
        ${result.riding || "Daily Commute"}

        </div>


        <div class="cvt-notes">

        <strong>🔧Setup Notes: </strong>
        <p>
        ${result.notes || "No additional notes available.:"}
        </p>

        </div>
    `;

}

// ======================================
// COMPARISON CARD
// ======================================


function createCompareCard(
    icon,
    title,
    stock,
    current,
    diff
){


    let status;


    if(diff > 0){

        status =
        `⬆️ +${diff} Better`;

    }


    else if(diff < 0){

        status =
        `⬇️ ${Math.abs(diff)} Lower`;

    }


    else{

        status =
        "⚖️ Same";

    }





    return `


    <div class="compare-stat">


        <h4>
        ${icon}
        ${title}
        </h4>



        <div class="compare-values">


            <div>
            Stock
            <b>
            ${stock}
            </b>
            </div>



            <div>
            Setup
            <b>
            ${current}
            </b>
            </div>


        </div>




        <div class="compare-result">


            ${status}


        </div>

        



    </div>


    `;


}