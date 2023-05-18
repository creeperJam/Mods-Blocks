// General Variabiles/Costants
let focus = -1;
// let modNameInput = document.getElementById("nomeMod");
let searchButton = document.getElementById("search");
let gameSelect = document.getElementById("gameSelect");
let modNameInput = document.getElementById("modNameInput");
// let datalistNomeMod = document.getElementById("datalistNomeMod");
let autocompleteList = document.getElementById("autocomplete-list");

const linkApiCurseForge = "https://api.curseforge.com";
const apiKey = "$2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.";

// Event listeners
gameSelect.addEventListener("change", function () {
    modNameInput.value = "";
    if (gameSelect.value == -1) {
        modNameInput.disabled = true;
        gameId = -1;
    } else {
        modNameInput.disabled = false;
        gameId = gameSelect.value;
    }
});
modNameInput.addEventListener("keyup", autocomplete, false);


// Spiegazione api usate:

// https://docs.curseforge.com - Chiave API: $2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.
// Spiegazione link curseForge: "https://api.curseforge.com/service"
// Servizi offerti usati:
//   GET /v1/games/ 
//   GET /v1/mods/search/


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
                gameSelect.appendChild(option);
            });
        });
}


// aggiunta dei tag option per i nomi delle mod dopo aver selezionato un gioco dal select
const getMods = "/v1/mods/search"; // + gameId + "&searchFilter=" + modNameInput.value + "&pageSize=15
let risultati = new Array();
let pageSizeAutocomplete = 15;
let debounceTimeout = 0;
let vecchioInput = "";
function autocomplete(e) {
    focus = -1;
    let input = modNameInput.value;
    input.replaceAll(" ", "%20");
    risultati = new Array();

    if (modNameInput.value.trim() == "") autocompleteList.innerHTML = "";

    // console.log(input);
    if (input.length > 0 && input != vecchioInput) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            await fetch(linkApiCurseForge + getMods + "?gameId=" + gameId + "&searchFilter=" + input + "&sortOrder=desc" + "&sortType=1" + "&pagesize=" + pageSizeAutocomplete, {
                method: 'GET',
                headers: headers
            })
                .then(response => response.json())
                .then(responseJson => responseJson.data).then(data => {
                    data.forEach(element => {
                        risultati.push(element);
                    });
                });

            // console.log(risultati);
            autocompleteList.innerHTML = "";
            let n = risultati.length;
            risultati.forEach((element, index) => {
                // console.log("ci sei?")
                let inizioStringa = element['name'].toLowerCase().indexOf(modNameInput.value.toLowerCase()); // Indice in cui inizia la stringa cercata

                let div = document.createElement("div");
                let span = document.createElement("span");

                div.setAttribute("class", "autocomplete-item")
                span.setAttribute("value", element['id']);

                if (index == n - 1) span.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
                else span.setAttribute("style", "border-radius: 0");

                span.innerHTML = `<strong>${element['name'].substring(inizioStringa, inizioStringa + modNameInput.value.length)}</strong>`;
                span.innerHTML += `${element['name'].substring(inizioStringa + modNameInput.value.length)} - ${element['id']}`;
                // span.innerHTML = element['name'];
                div.appendChild(document.createElement('p'));
                div.appendChild(span);

                addEventListeners(span);

                autocompleteList.appendChild(div);
            });
        }, 200);
    }

    vecchioInput = input;
}

let selectedModId = null;
function addEventListeners(element) {
    element.addEventListener("click", function () {
        modNameInput.value = element.textContent;
        selectedModId = element.getAttribute("value");
        autocompleteList.innerHTML = "";
        showModInfo();
    });
}


const getMod = "/v1/mods/";
async function showModInfo() {
    let mod = await fetch(linkApiCurseForge + getMod + selectedModId, {
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    console.log(mod);
}

modNameInput.addEventListener("keydown", function (e) {
    let elements = document.querySelectorAll(".autocomplete-item > span");

    if (e.key == "Enter") {
        e.preventDefault();
        modNameInput.value = elements[focus].textContent.substring(0, elements[focus].textContent.indexOf(" -"));
        selectedModId = elements[focus].getAttribute("value");
        autocompleteList.innerHTML = "";
        showModInfo();
        focus = -1;
    }
    else if (e.key == "ArrowDown") {
        if (focus < 14) {
            focus++;
            if (elements[focus - 1].classList.contains("focus")) elements[focus - 1].classList.remove("class", "focus");
        }
        elements[focus].classList.add("class", "focus");
    }
    else if (e.key == "ArrowUp") {
        if (focus > 0) {
            elements[focus].classList.remove("class", "focus");
            focus--;
        }
        elements[focus].classList.add("class", "focus");
    }
});