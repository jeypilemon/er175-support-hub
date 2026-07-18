function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            loaded.aftermarket = true;
            checkReady();
        },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }
    });
}

function loadOEM(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            oemParts = res.data.filter(p => p["Parts Name"]);
            loaded.oem = true;
            checkReady();
        },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }
    });
}

function loadTroubleshoot(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            troubleshootData = res.data.filter(p => p["Known Issue"]);
            loaded.troubleshoot = true;
            checkReady();
        },
        
        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }
    });
}

/* Load Manual Tabs*/

function loadManual(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            manualData = res.data.filter(x => x["Category"]);
            loaded.manual = true;
            checkReady();
        },
        
        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }
    });
}

function loadManualComponents(url) {

    Papa.parse(url, {

        download:true,

        header:true,

        complete: res => {

    manualComponents =
    res.data.filter(x=>x["Component"]);


    manualComponents.sort((a,b)=>
    Number(a.ID)-Number(b.ID)
    );


    loaded.components = true;

    checkReady();

    },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadManualDashboard(url){

    Papa.parse(url,{
        download:true,
        header:true,

        complete: res=>{

            manualDashboard =
            res.data.filter(
                x=>x["Component"]
            );

        },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadManualMaintenance(url){

    Papa.parse(url,{

        download:true,
        header:true,

        complete: res => {


            manualMaintenance =
            res.data.filter(
                x => x["Item"]
            );

        },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}


function loadEFI(url) {

    Papa.parse(url, {

        download: true,
        header: true,

        complete: res => {


            console.log("RAW EFI CSV:", res.data);


            efiData = res.data.filter(
                r => r.ID
            );


            window.efiData = efiData;


            console.log(
                "EFI LOADED:",
                efiData.length
            );


            console.log(
                "EFI HEADERS:",
                Object.keys(efiData[0] || {})
            );


            loaded.efi = true;


            checkReady();



            if(typeof renderEFI === "function"){
                renderEFI();
            }


        },


        error(error){

            console.error(
                "EFI LOAD ERROR:",
                error
            );


            showError(
            "Unable to load EFI database."
            );

        }


    });

}

function loadWiring(url) {

    Papa.parse(url, {

        download: true,

        header: true,

        complete: res => {

            window.manualWiring = res.data.filter(r => r.ID);



            loaded.wiring = true;

            checkReady();

        },

        error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadPrecautions(url){

    Papa.parse(url,{

        download:true,

        header:true,

        complete:res=>{

            manualPrecautions =
                res.data.filter(r=>r.ID);


        },

           error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadMistakes(url){

    Papa.parse(url,{

        download:true,

        header:true,

        complete:res=>{

            manualMistakes =
                res.data.filter(r=>r.ID);

        },

           error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadManualSearchIndex(url){

    Papa.parse(url,{

        download:true,

        header:true,

        complete:res=>{

            manualSearchIndex =
                res.data.filter(r=>r.ID);

        },

           error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}

function loadCVT(url){

    Papa.parse(url,{

        download:true,

        header:true,

        complete:res=>{

            cvtData =
            res.data.filter(
                r=>r.ID
            );

        },

           error(error){
        console.error(error);
        showError(
          "Unable to load database. Please check your connection."
        );
    }

    });

}



function checkReady() {


    if(appStarted) return;


    if (
        loaded.aftermarket &&
        loaded.oem &&
        loaded.troubleshoot &&
        loaded.manual &&
        loaded.components &&
        loaded.efi
    ) {


        appStarted = true;

        isLoading = false;


        currentTab = "aftermarket";
        currentCategory = "All";


        switchTab("aftermarket");

    }

}



function showError(message) {
    const container = document.getElementById("app");

    if (container) {
        container.innerHTML = `
            <div class="error-card">
                <h3>⚠️ Something went wrong</h3>
                <p>${message}</p>
                <button onclick="location.reload()">
                    Reload Page
                </button>
            </div>
        `;
    }
}