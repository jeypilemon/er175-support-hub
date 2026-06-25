console.log("APP JS LOADED");
alert("APP JS LOADED");

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQuOxI5JH-mWFfHd2VecpdsOXdT6UsnqDaedyEjofuMK3qofOnLJkK4tPPiX0qJqg5Wp9G0PaXSTysz/pub?gid=0&single=true&output=csv";

let parts = [];

const products = document.getElementById("products");

// DISPLAY PRODUCTS
function displayParts(list) {
    products.innerHTML = "";

    list.forEach(part => {
        products.innerHTML += `
        <div class="card">

            <img src="${part['Image']}" loading="lazy">

            <h3>${part['Parts Name']}</h3>

            <p><b>Category:</b> ${part['Parts Category']}</p>
            <p><b>Brand:</b> ${part['Brand']}</p>
            <p><b>Compatibility:</b> ${part['Compatibility']}</p>
            <p><b>Specs:</b> ${part['Specs/Size']}</p>

            <a class="button" href="${part['Shopee']}" target="_blank">
                Buy on Shopee
            </a>

        </div>
        `;
    });
}

// LOAD GOOGLE SHEET
function loadSheet() {
    Papa.parse(sheetURL, {
        download: true,
        header: true,
        complete: function(results) {

            parts = results.data;

            displayParts(parts);
        }
    });
}

loadSheet();

// SEARCH FUNCTION
document.getElementById("search").addEventListener("input", (e) => {

    const keyword = e.target.value.toLowerCase();

    const filtered = parts.filter(part =>
        (part['Parts Name'] || '').toLowerCase().includes(keyword) ||
        (part['Parts Category'] || '').toLowerCase().includes(keyword) ||
        (part['Brand'] || '').toLowerCase().includes(keyword) ||
        (part['Compatibility'] || '').toLowerCase().includes(keyword)
    );

    
    displayParts(filtered);

});