// Variabili/Costanti
let inputNomeMod = document.getElementById("nomeMod");
const linkApiCurseForge = "https://api.curseforge.com";
const apiKey = "$2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.";

// Event Listeners
inputNomeMod.addEventListener("keyup", cercaMod, false);


// Spiegazione api usate:

// https://docs.curseforge.com - Chiave API: $2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.
// Spiegazione link curseForge: "https://api.curseforge.com/service"
// Servizi offerti:
//   GET /v1/games/ 

const headers = {
    'Accept': 'application/json',
    'x-api-key': apiKey
};

// let x = fetch(linkApiCurseForge + '/v1/games',
// {
//     method: 'GET',
//     headers: headers
// }).then(result => result.json())
// .then((responseJson) => { return responseJson })


const getMods = "/v1/mods/search"; // + gameId + "&searchFilter=" + inputNomeMod.value + "&pageSize=10&pageIndex=0
let gameId = 432; // default: 432 (Minecraft) - TODO: aggiungere la possibilità di scegliere il gioco
let debounceTimeout = 0;
let vecchioInput = "";
let risultati = new Array();
function cercaMod() {
    risultati = new Array();
    if (vecchioInput != inputNomeMod.value) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            let pattern = new RegExp('^' + inputNomeMod.value + '.*\\b', "i");
            let linkFetch = linkApiCurseForge + getMods + "?gameId=" + gameId + "&searchFilter=" + inputNomeMod.value;
            await fetch(linkFetch,
                {
                    method: 'GET',
                    headers: headers
                })
                .then((response) => response.json())
                .then((responseJson) => responseJson.data)
                .then((data) => {
                    console.log("E fin qui ci siamo");
                    data.forEach(element => {
                        if (pattern.test(element['name']) == true) risultati.push(element);
                    });
                });

            console.log(risultati);

            suggerimenti(risultati);
        }, 350)
        vecchioInput = inputNomeMod.value;
    }

    if (inputNomeMod.value.length == 0) {
        document.getElementById('autocomplete-list').innerHTML = "";
    }
}

let currentFocus = -1;
function suggerimenti(arr) {
    let div = document.getElementById('autocomplete-list');
    closeAllLists();

    if (arr.length == 0) {
        let suggerimento = document.createElement('DIV'); // Div che contiene il suggerimento
        let testoSuggerimento = document.createElement('span') // Span che contiene il testo del suggerimento

        suggerimento.setAttribute("class", "autocomplete-item");
        testoSuggerimento.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");

        suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna'></p>";
        testoSuggerimento.innerHTML += "<strong>Nessun elemento trovato per la query inserita</strong>";

        suggerimento.addEventListener("click", closeAllLists, false);

        suggerimento.appendChild(testoSuggerimento);
        suggerimento.innerHTML += "<p class='vuoto'></p>";
        div.appendChild(suggerimento);
    } else {
        let n = arr.length > 10 ? 10 : arr.length;
        for (let i = 0; i < n; i++) {
            let inizioStringa = arr[i]['name'].toLowerCase().indexOf(inputNomeMod.value.toLowerCase()); // Indice in cui inizia la stringa cercata
            let suggerimento = document.createElement('DIV'); // Div che contiene il suggerimento
            let testoSuggerimento = document.createElement('span') // Span che contiene il testo del suggerimento

            // Assegnazione attributi ai vari elementi
            suggerimento.setAttribute("class", "autocomplete-item");;
            testoSuggerimento.setAttribute("value", arr[i]['name']);
            if (i == n - 1) testoSuggerimento.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
            else testoSuggerimento.setAttribute("style", "border-radius: 0");

            suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna' style='color: rgba(0, 0, 0, 0)'>Oggetto: </p>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(0, inizioStringa);
            testoSuggerimento.innerHTML += "<strong>" + arr[i]['name'].substr(inizioStringa, inputNomeMod.value.length) + "</strong>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(inizioStringa + inputNomeMod.value.length);
            // testoSuggerimento.innerHTML += "<input style='margin-top: 0; margin-bottom: 0; height: 75%; border-radius: 0' type='text' value='" + arr[i]['name'] + "' readonly>";

            // testoSuggerimento.addEventListener("click", mostraInfoBlocco, false);
            // testoSuggerimento.addEventListener("click", clickItem, false);

            suggerimento.appendChild(testoSuggerimento);
            suggerimento.innerHTML += "<p class='vuoto'></p>";
            div.appendChild(suggerimento);
        }
        aggiungiEventListener();
    }
}

function aggiungiEventListener() {
    let div = document.getElementById("autocomplete-list");
    let children = div.childNodes, n = children.length;
    for (let i = 0; i < n; i++) {
        children[i].children[2].addEventListener("click", mostraInfoBlocco);
        children[i].children[2].addEventListener("click", clickItem);
        children[i].children[2].addEventListener("click", closeAllLists);
        children[i].children[2].addEventListener("focusout", function (e) {
            closeAllLists();
        });
    }
}

function clickItem() {
    inputNomeMod.value = this.getAttribute('value');
}

function closeAllLists() {
    let div = document.getElementById("autocomplete-list");
    let children = div.childNodes, n = children.length;
    for (let i = 0; i < n; i++) {
        div.removeChild(children[0]);
    }
}

function noFocus(element) {
    element.removeAttribute("class", "spanFocus");
}

function focus(element) {
    element.setAttribute("class", "spanFocus");
}

inputNomeMod.addEventListener("keyup", function (e) {
    let divs = document.getElementById('autocomplete-list').children;
    let tastoPremuto = e.code;

    // console.log(tastoPremuto);

    if (tastoPremuto == "ArrowDown") {
        if (currentFocus > -1) noFocus(divs[currentFocus].children[2]);
        if (currentFocus < 9) currentFocus++;
        focus(divs[currentFocus].children[2]);
    } else if (tastoPremuto == "ArrowUp") {
        if (currentFocus > -1) noFocus(divs[currentFocus].children[2]);
        if (currentFocus > 0) currentFocus--;
        focus(divs[currentFocus].children[2]);
    } else if (tastoPremuto == "Enter") {
        e.preventDefault();
        // console.log("INVIO if-case - " + tastoPremuto)
        // console.log(divs[currentFocus].children[2].value);
        inputNomeMod.value = divs[currentFocus].children[2].getAttribute('value');
        currentFocus = -1;
        closeAllLists();
    } else {
        // console.log("Tasto premuto - " + tastoPremuto)
    }
})

document.getElementById("nomeMod").addEventListener("focusout", function (e) {
    setTimeout(closeAllLists, 500);
});

document.addEventListener("keypress", function (e) {
    if (e.code == "Enter") {
        e.preventDefault();
        // console.log("INVIO documento - " + e.code)
    }
})