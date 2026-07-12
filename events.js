
document.getElementById("search").addEventListener("input", e => {

    handleGlobalSearch(e.target.value);

});

document.getElementById("chips").addEventListener("pointerdown",()=>{

    chips.classList.remove("hint-scroll");


});


window.closeModal = closeModal;
window.openModal = openModal;

window.openComponentViewer = openComponentViewer;
window.closeComponentViewer = closeComponentViewer;

window.openManualSection = openManualSection;
window.switchTab = switchTab;
window.setCategory = setCategory;
window.resetFilters = resetFilters;

window.openEFIDiagnosis = openEFIDiagnosis;
window.nextEFIStep = nextEFIStep;
window.previousEFIStep = previousEFIStep;

window.previousComponent = previousComponent;
window.openNextComponent = openNextComponent;

window.addEventListener("resize",()=>{

updateChipArrow();

});


document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        closeComponentViewer();

    }

});
