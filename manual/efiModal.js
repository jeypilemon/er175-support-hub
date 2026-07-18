// ======================================
// EFI DIAGNOSIS MODAL
// ======================================


window.openEFIDiagnosis = function(id){


    window.currentEFIProblem =
    window.efiData.find(
        x => x.ID == id
    );


    if(!window.currentEFIProblem){

        console.error(
            "EFI ENTRY NOT FOUND:",
            id
        );

        return;

    }


    renderEFIDiagnosisModal();


};





// ======================================
// RENDER EFI MODAL
// ======================================


function renderEFIDiagnosisModal(){


    const item =
    window.currentEFIProblem;


    if(!item)
        return;



    const content =
    document.getElementById(
        "efiDiagnosisContent"
    );


    const modal =
    document.getElementById(
        "efiDiagnosisModal"
    );


    if(!content || !modal)
        return;





    content.innerHTML = `




    <div class="efi-modal-header">


        <div>

            <h2>
            ⚡ ${item["Flash Code"] || "EFI Diagnosis"}
            </h2>


            <p>
            ${item["Error / Symptom"] || ""}
            </p>


        </div>


    </div>





    ${
        item["Image"]

        ?

        `

        <div class="efi-image-box">

            <img 
            src="${item["Image"]}"
            loading="lazy"
            >

        </div>

        `

        :

        ""

    }






    <div class="efi-component-title">


        <h3>

        🔧 ${item["Component / System"] || "EFI System"}

        </h3>


    </div>









    <div class="efi-info-card">


        <h4>
        Symptoms
        </h4>


        <div class="efi-text">

        ${item["Common Symptoms"] || "No symptoms listed."}

        </div>


    </div>








    <div class="efi-info-card">


        <h4>
        🔍 Inspection & Checks
        </h4>



        <div class="efi-steps">

        ${formatNumberedSteps(
            item["Inspection & Checks"]
        )}

        </div>


    </div>








    <div class="efi-info-card">


        <h4>
        🛠 Possible Repair
        </h4>



        <div class="efi-steps">

        ${formatRepair(
            item["Possible Repair"]
        )}

        </div>


    </div>




    <div class="efi-info-card efi-notes">


        <h4>
        📝 Notes
        </h4>



        <p>

        ${item["Notes"] || "No notes available."}

        </p>


    </div>






    `;



    modal.classList.add("show");


}







// ======================================
// CLOSE MODAL
// ======================================


function closeEFIDiagnosisModal(){


    const modal =
    document.getElementById(
        "efiDiagnosisModal"
    );


    if(modal){

        modal.classList.remove("show");

    }


}








// ======================================
// FORMAT INSPECTION STEPS
// Supports:
// 1. Step
// 2. Step
// ======================================


function formatNumberedSteps(text){


    if(!text)
        return "No procedure available.";



    return text

    .split(/\s*(?=\d+\.)/)

    .map(step=>{


        return `

        <div class="efi-step-item">

            ${step.trim()}

        </div>

        `;


    })

    .join("");

}








// ======================================
// FORMAT POSSIBLE REPAIR
// Supports:
// A; B; C
// OR
// 1. A 2. B
// ======================================


function formatRepair(text){


    if(!text)
        return "No repair information available.";



    let repairs = [];



    if(text.includes(";")){


        repairs =
        text
        .split(";")
        .map(x=>x.trim())
        .filter(Boolean);


    }

    else {


        repairs =
        text
        .split(/\s*(?=\d+\.)/)
        .map(x=>
            x.replace(/^\d+\.\s*/,"").trim()
        )
        .filter(Boolean);


    }




    return repairs

    .map((item,index)=>{


        return `

        <div class="efi-step-item">

            <b>${index+1}.</b>
            ${item}

        </div>

        `;


    })

    .join("");

}








// ======================================
// FORMAT RELATED PARTS
// ======================================


function formatList(text){


    if(!text)
        return "No related parts listed.";



    return text

    .split(";")

    .map(x=>x.trim())

    .filter(Boolean)

    .map((item,index)=>{


        return `

        <div class="efi-step-item">

            <b>${index+1}.</b>
            ${item}

        </div>

        `;


    })

    .join("");

}