function normalizeText(text){

    return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g,"")
    .replace(/\s+/g," ")
    .trim();

}

function safeHighlight(text) {

    if (!searchQuery) return text || "";

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const reg = new RegExp(escaped, "gi");

    return (text || "").replace(
        reg,
        m => `<mark>${m}</mark>`
    );
}

function matchWords(text, query){

    if(!query) return true;

    const normalizedText = normalizeText(text);

    const words = normalizeText(query).split(" ");

    return words.every(word =>
        normalizedText.includes(word)
    );

}

function getAllSearchTerms(){

    let data = [];


    if(currentTab === "aftermarket"){

        data = aftermarketParts;

    }

    else if(currentTab === "oem"){

        data = oemParts;

    }

    else if(currentTab === "diagnostics"){

        data = efiData;

    }



    let terms = [];


    data.forEach(item=>{


        let fields = [];


        if(currentTab==="aftermarket" || currentTab==="oem"){

            fields = [

                item["Parts Name"],
                item["Parts Category"]

            ];

        }



        if(currentTab==="diagnostics"){

            fields = [

                item["Error / Symptom"],
                item["Component / System"]

            ];

        }



        fields.forEach(value=>{


            if(value){

                terms.push(value.trim());

            }


        });



    });



    return [...new Set(terms)];

}

function levenshtein(a,b){

    const matrix=[];


    for(let i=0;i<=b.length;i++){

        matrix[i]=[i];

    }


    for(let j=0;j<=a.length;j++){

        matrix[0][j]=j;

    }



    for(let i=1;i<=b.length;i++){

        for(let j=1;j<=a.length;j++){


            if(b[i-1]===a[j-1]){

                matrix[i][j]=matrix[i-1][j-1];

            }

            else{

                matrix[i][j]=Math.min(
                    matrix[i-1][j-1]+1,
                    matrix[i][j-1]+1,
                    matrix[i-1][j]+1
                );

            }

        }

    }


    return matrix[b.length][a.length];

}


function findAutoSuggestion(query){


    const q = normalizeText(query);


    const terms = getAllSearchTerms().map(x=>({
    raw:x,
    normalized:normalizeText(x)
    }));


    // 1. Partial phrase match first

    let partial =
terms.find(item =>
    item.normalized.includes(q)
);


if(partial){

    return partial.raw;

}



    // 2. fuzzy typo correction

    let best="";
    let score=99;


    terms.forEach(item=>{


    const distance =
    levenshtein(q,item.normalized);


    if(distance < score){

        score=distance;
        best=item.raw;

    }


});



    if(score <= 2){

        return best;

    }


    return null;

}


function getSuggestion(query) {
    const q = normalizeText(query);

    return suggestionMap[q] || null;
}


function renderSuggestion(){

    const suggestionBox =
    document.getElementById("suggestions");


    if(!suggestionBox)
        return;


    if(searchQuery.length < 3){

        suggestionBox.innerHTML="";
        return;

    }



    let suggestion =
    getSuggestion(searchQuery);



    if(!suggestion){

        suggestion =
        findAutoSuggestion(searchQuery);

    }



    if(!suggestion){

        suggestionBox.innerHTML="";
        return;

    }



    if(
        normalizeText(suggestion)
        .includes(searchQuery)
    ){

        suggestionBox.innerHTML="";
        return;

    }



    suggestionBox.innerHTML = `

    <div class="suggestion-item"
    onclick="applySuggestion('${suggestion}')">

        💡 Do you mean:
        <b>${suggestion}</b>?

    </div>

    `;

}

function applySuggestion(text) {
    document.getElementById("search").value = text;
    searchQuery = normalizeText(text);
    render();
    renderSuggestion();
}

/*fuzzy suggestion*/

function getEmptyStateMessage() {
    if (searchQuery) {
        return `No results found for "<b>${searchQuery}</b>"`;
    }
    return "No items available";
}


/* Dictionary*/

const suggestionMap = {
    breakpads: "brake pads",
    brakepad: "brake pads",
    oilfilter: "oil filter",
    sparkpluggs: "spark plug",
    clutchshoe: "clutch shoe"
};