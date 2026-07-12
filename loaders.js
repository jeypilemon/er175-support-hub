function loadAftermarket(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            aftermarketParts = res.data.filter(p => p["Parts Name"]);
            loaded.aftermarket = true;
            checkReady();
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


            console.log(
                "Dashboard loaded:",
                manualDashboard.length
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


            console.log(
                "Maintenance loaded:",
                manualMaintenance.length
            );


        }

    });

}

function loadEFI(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {

            efiData = res.data.filter(r => r.ID);
            
            console.log(
                "EFI loaded:",
                efiData.length
            );
        }
    });
}

function loadWiring(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: res => {
            // 1. Explicitly attach it to the window so all other JS files can see it
            window.manualWiring = res.data.filter(r => r.ID);

            console.log(
                "Wiring loaded:",
                window.manualWiring.length
            );

            // 2. Trigger the render function immediately now that the data exists!
            if (typeof renderWiring === 'function') {
                renderWiring();
            }
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

            console.log(
                "Precautions loaded:",
                manualPrecautions.length
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

            console.log(
                "Mistakes loaded:",
                manualMistakes.length
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

            console.log(
                "Manual Search Index loaded:",
                manualSearchIndex.length
            );

        }

    });

}

function checkReady() {



    if (
        loaded.aftermarket &&
        loaded.oem &&
        loaded.troubleshoot &&
        loaded.manual &&
        loaded.components
    ) {


        isLoading = false;

        render();

        renderChips();

    }

}
