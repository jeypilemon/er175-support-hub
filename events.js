
const searchInput = document.getElementById("search");
const suggestionPanel = document.getElementById("suggestions");

searchInput.addEventListener("input", e => {
    handleGlobalSearch(e.target.value);
});

searchInput.addEventListener("focus", () => {
    renderSuggestion();
    if (typeof renderPopularSearches === "function") renderPopularSearches();
});

searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (searchQuery.trim()) { saveRecentSearch(searchInput.value); trackSharedSearch(searchInput.value); }
        closeSearchSuggestions();
        render();
    } else if (e.key === "Escape") {
        closeSearchSuggestions();
    }
});

document.getElementById("popularSearches")?.addEventListener("click", e => {
    const button = e.target.closest("[data-search-value]");
    if (!button) return;
    selectSearchSuggestion(button.dataset.searchValue);
});

suggestionPanel.addEventListener("click", e => {
    const categoryButton = e.target.closest("[data-category-value]");
    if (categoryButton) {
        selectSearchCategory(categoryButton.dataset.categoryValue);
        return;
    }
    const searchButton = e.target.closest("[data-search-value]");
    if (searchButton) selectSearchSuggestion(searchButton.dataset.searchValue);
});

document.addEventListener("click", e => {
    if (!e.target.closest(".search-box")) closeSearchSuggestions();
});

document.getElementById("chips").addEventListener("pointerdown",()=>{

    chips.classList.remove("hint-scroll");


});


window.closeModal = closeModal;
window.openModal = openModal;

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
