// General Variabiles/Costants
// let inputNomeMod = document.getElementById("nomeMod");
let searchButton = document.getElementById("search");
let selectNomeGioco = document.getElementById("selectNomeGioco");
let inputNomeMod = document.getElementById("inputNomeMod");
let datalistNomeMod = document.getElementById("datalistNomeMod"); // TODO: Togli questa riga insieme al dataList nell'HTML quando hai aggiunto la funzione di autocompletamento
let autocompleteList = document.getElementById("autocomplete-list");

const linkApiCurseForge = "https://api.curseforge.com";
const apiKey = "$2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.";

// Event listeners
selectNomeGioco.addEventListener("change", function () {
    inputNomeMod.value = "";
    if (selectNomeGioco.value == -1) {
        inputNomeMod.disabled = true;
        gameId = -1;
    } else {
        inputNomeMod.disabled = false;
        gameId = selectNomeGioco.value;
    }
});
inputNomeMod.addEventListener("keyup", suggerimenti);


// Spiegazione api usate:

// https://docs.curseforge.com - Chiave API: $2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.
// Spiegazione link curseForge: "https://api.curseforge.com/service"
// Servizi offerti:
//   GET /v1/games/ 
//   GET /

const headers = {
    'Accept': 'application/json',
    'x-api-key': apiKey
};

// Functions

// Aggiunta dei tag option per i nomi dei giochi
const getGames = "/v1/games";
gameOptionsAdd();
function gameOptionsAdd() {
    fetch(linkApiCurseForge + getGames, {
        method: 'GET',
        headers: headers
    })
        .then((response) => response.json())
        .then((responseJson) => responseJson.data)
        .then((data) => {
            data.forEach(element => {
                let option = document.createElement("option");
                option.setAttribute("value", element['id']);
                option.innerHTML = element['name'];
                selectNomeGioco.appendChild(option);
            });
        });
}


// aggiunta dei tag option per i nomi delle mod dopo aver selezionato un gioco dal select
const getMods = "/v1/mods/search"; // + gameId + "&searchFilter=" + inputNomeMod.value + "&pageSize=50
let risultati = new Array();
let filtroRicerca = ""
gameModsOptionsAdd(); // Test funzione
function gameModsOptionsAdd() {
    risultati = new Array();
    gameId = selectNomeGioco.value;
    if (gameId == -1) {
        searchButton.disabled = true;
        inputNomeMod.disabled = true;
        inputNomeMod.value = "";
        return;
    }

    risultati = new Array();
    inputNomeMod.disabled = false;
    searchButton.disabled = false;
    // datalistNomeMod.innerHTML = `<option selected="selected">Selezionare un'opzione tra le disponibili</option>`;
    fetch(linkApiCurseForge + getMods + "?gameId=" + gameId + "&searchFilter=" + filtroRicerca, {
        method: 'GET',
        headers: headers
    })
        .then((response) => response.json())
        .then((responseJson) => responseJson.data)
        .then((data) => {
            data.forEach(element => {
                let option = document.createElement("option");
                option.setAttribute("value", element['id']);
                option.innerHTML = element['name'];
                datalistNomeMod.appendChild(option);

                risultati.push(element);
            });
        });
}


let debounceTimeout = 0;
let vecchioInput = "";
function suggerimenti() {
    let input = inputNomeMod.value;
    input.replaceAll(" ", "%20");
    risultati = new Array();

    // console.log(input);
    if (input.length > 0) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            await fetch(linkApiCurseForge + getMods + "?gameId=" + gameId + "&searchFilter=" + input, {
                method: 'GET',
                headers: headers
            })
                .then(response => response.json())
                .then(responseJson => responseJson.data).then(data => {
                    data.forEach(element => {
                        risultati.push(element);
                    });
                });
        }, 350);

        autocompleteList.innerHTML = "";
        risultati.forEach((element, index) => {
            let inizioStringa = element['name'].toLowerCase().indexOf(inputNomeMod.value.toLowerCase()); // Indice in cui inizia la stringa cercata

            let div = document.createElement("div");
            let span = document.createElement("span");

            div.setAttribute("class", "autocomplete-item")
            span.setAttribute("value", element['id']);

            if (index == n - 1) testoSuggerimento.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
            else testoSuggerimento.setAttribute("style", "border-radius: 0");

            span.innerHTML = element['name'].substring(0, inizioStringa);
            div.appendChild(span);

            autocompleteList.appendChild(div);
        });
    }
}