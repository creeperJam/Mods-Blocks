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
const modLoaders = [
    "Any",
    "Forge",
    "Cauldron",
    "LiteLoader",
    "Fabric",
    "Quilt"
];

let modFilePage = 0;
let selectedTab = -1;

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

async function fetchRequest(input) {
    risultati = new Array();
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
}

function autocomplete(e) {
    if (e.code != "ArrowUp" && e.code != "ArrowDown") focus = -1;

    let input = modNameInput.value;
    input.replaceAll(" ", "%20");

    if (modNameInput.value.trim() == "") autocompleteList.innerHTML = "";

    // console.log(input);
    if (input.length > 0 && input != vecchioInput && e.code != "Enter") {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            await fetchRequest(input);

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

function clickAutocomplete(element) {
    modNameInput.value = element.textContent.substring(0, element.textContent.indexOf(" -"));
    selectedModId = element.getAttribute("value");
    autocompleteList.innerHTML = "";

    focus = -1;
}

let selectedModId = null;
function addEventListeners(element) {
    element.addEventListener("click", function () {
        clickAutocomplete(element);
        showModInfo();
    });
}


const getMod = "/v1/mods/";
let mod;
async function showModInfo() {
    mod = await fetch(linkApiCurseForge + getMod + selectedModId, {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    // console.log(mod);

    document.getElementById("modName").innerHTML = mod['name'];
    // document.getElementById("modId").innerHTML = mod['id'];
    // document.getElementById("modDescription").innerHTML = mod['summary'];
    document.getElementById("modAuthor").innerHTML = "By: ";
    for (let i = 0; i < mod['authors'].length; i++) {
        if (i == mod['authors'].length - 1) document.getElementById("modAuthor").innerHTML += mod['authors'][i]['name'];
        else document.getElementById("modAuthor").innerHTML += mod['authors'][i]['name'] + ", ";
    }
    // document.getElementById("modDownloads").innerHTML = mod['downloadCount'];
    // document.getElementById("modDate").innerHTML = mod['dateReleased'];
    let tabContent = document.getElementsByClassName("tab-content")[0];
    tabContent.style.flexDirection = "column";

    let description = await fetch(linkApiCurseForge + getModDescription.replace("{modId}", selectedModId), {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    tabContent.innerHTML = `<p>${description}</p>`;

    document.getElementsByClassName('tabs-nav')[0].innerHTML = `
    <ul class="tabs">
    <li class="tab">
        <button type="button" title="tab button" value="description" class="tab-button" data-tab>Description</button>
    </li>
    <li class="tab">
        <button type="button" title="tab button" value="files" class="tab-button" data-tab>Files</button>
    </li>
    <li class="tab">
        <button type="button" title="tab button" value="screenshots" class="tab-button" data-tab>Screenshots</button>
    </li>
    <li class="tab">
        <button type="button" title="source" value="source" class="tab-button" data-tab>
            <a href="${mod['links']['sourceUrl']}" class="tab-link">Source</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button type="button" title="website" value="website" class="tab-button" data-tab>
            <a href="${mod['links']['websiteUrl']}" class="tab-link">Website</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button type="button" title="issues" value="issues" class="tab-button" data-tab>
            <a href="${mod['links']['IssuesUrl']}" class="tab-link">Issues</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button type="button" title="wiki" value="wiki" class="tab-button" data-tab>
            <a href="${mod['links']['wikiUrl']}" class="tab-link">Wiki</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
</ul>
    `

    let tabButtons = document.getElementsByClassName("tab-button");
    for (let index = 0; index < tabButtons.length; index++) {
        tabButtons[index].addEventListener("click", openTab);
    }
    selectedTab = 0;
    // console.log(mod);
}

modNameInput.addEventListener("keydown", function (e) {
    let elements = document.querySelectorAll(".autocomplete-item > span");

    switch (e.key) {
        case "Enter":
            e.preventDefault();
            if (focus == -1) focus = 0;
            clickAutocomplete(elements[focus]);
            showModInfo();
            break;

        case "ArrowDown":
            if (focus > -1) elements[focus].classList.remove("focus");
            if (focus < 14) focus++;
            elements[focus].classList.add("focus");
            break;

        case "ArrowUp":
            if (focus > -1) elements[focus].classList.remove("focus");
            if (focus > 0) focus--;
            elements[focus].classList.add("focus");
            break;

        case "Escape":
            autocompleteList.innerHTML = "";
            break;
    }
});

// Chiusura lista in caso di click fuori
modNameInput.addEventListener("focusout", function (e) {
    setTimeout(function () {
        autocompleteList.innerHTML = "";
    }, 300);
});

document.addEventListener("keypress", function (e) {
    if (e.code == "Enter") {
        e.preventDefault();
        // console.log("INVIO documento - " + e.code)
    }
})

const getFile = "/v1/mods/{modId}/files/{fileId}";
const getModDescription = "/v1/mods/{modId}/description";
let arr;
function openTab(e) {
    let tabContent = document.getElementsByClassName("tab-content")[0];

    switch (this.value) {
        case "description":
            if (selectedTab == 0) return;
            insertDescriptionTab(tabContent);
            selectedTab = 0;
            break;

        case "files":
            if (selectedTab == 1) return;
            insertFilesTab(tabContent);
            selectedTab = 1;

            // Tentativo precedente alla versione funzionante sopra ^^^
            // arr.forEach(element => async () => {
            //     let file = await fetch(linkApiCurseForge + getFile.replaceAll("{modId}", selectedModId).replaceAll("{fileId}", element['fileId']), {
            //         method: "GET",
            //         headers: headers
            //     });
            //     let downloadUrl = file['downloadUrl'];

            //     tabContent += "<tr>";


            //     if (file['filename'].length > 30) {
            //         tabContent.innerHTML += `
            //             <td>${file['filename'].substring(0, 30)}...</td>
            //         `;
            //     } else {
            //         tabContent.innerHTML += `
            //             <td>${file['filename']}</td>
            //         `;
            //     }
            //     tabContent.innerHTML += `
            //         <td>${file['gameVersion'][2]}</td>
            //         <td>${file['fileDate']}</td>
            //         <td>${modLoaders[element['modLoader']]}</td>
            //     `;

            //     tabContent += "</tr>";
            // });
            break;

        case "screenshots":
            if (selectedTab == 2) return;
            insertScreenshotsTab(tabContent);
            selectedTab = 2;
            break;

        default:
            console.log("Opening link of " + this.value);
    }
}

async function insertDescriptionTab(tabContent) {
    tabContent.style.flexDirection = "column";

    let description = await fetch(linkApiCurseForge + getModDescription.replace("{modId}", selectedModId), {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    tabContent.innerHTML = `<p>${description}</p>`;
}


function gameVersions(gameVersionsArray) {
    let pattern = new RegExp("[0-9.]+");

    let gameVersionsString = new Array();
    gameVersionsArray.forEach((element) => {1
        if (pattern.test(element)) gameVersionsString.push(element);
    });
    // console.log(gameVersionsString);

    return gameVersionsString.sort().toString();
}

async function insertFilesTab(tabContent) {
    tabContent.style.flexDirection = "row";
    tabContent.innerHTML = `<table id="files-table">
                <thead id="files-header">
                    <tr>
                        <th>Name</th>
                        <th>Upload date</th>
                        <th>Game version</th>
                        <th>Mod loader</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="files-body">`

    let loading = document.createElement("img");
    loading.src = "./immagini/loading.gif";
    loading.setAttribute("id", "loading");
    document.querySelector("#files-header > tr").appendChild(loading);

    let modNumRows = 20;
    arr = mod['latestFilesIndexes'].slice(modNumRows * modFilePage, modNumRows * (modFilePage + 1));

    for (let i = 0; i < arr.length; i++) {
        await fetch(linkApiCurseForge + getFile.replaceAll("{modId}", selectedModId).replaceAll("{fileId}", arr[i]['fileId']), {
            method: "GET",
            headers: headers
        })
            .then(response => response.json())
            .then(responseJson => responseJson.data)
            .then(file => {
                console.log(arr[i]);
                // console.log(file)
                let downloadUrl = file['downloadUrl'];

                let tBodyContent = document.createElement("tr");
                // console.log(tabContent);


                if (file['fileName'].length > 28) {
                    tBodyContent.innerHTML += `
                                <td title="${file['fileName']}">${file['fileName'].substring(0, 28)}...</td>
                            `;
                } else {
                    tBodyContent.innerHTML += `
                                <td title="${file['fileName']}">${file['fileName']}</td>
                            `;
                }
                // console.log(tBodyContent);

                // TODO: per le versioni del gioco creare una funzione apposita che si occupa di riconoscere le versioni e di metterle in ordine, togliendo il modLoader dall'array
                tBodyContent.innerHTML += `
                            <td title="${file['fileDate']}">${file['fileDate'].slice(0, file['fileDate'].indexOf("T"))}</td>
                            <td>${gameVersions(file['gameVersions'])}</td>
                            <td>${modLoaders[arr[i]['modLoader']]}</td>
                            <td><a class="downloadMod" href="${downloadUrl}" download="Mod">Download</a></td>
                        `;
                // console.log(tBodyContent);

                document.getElementById("files-body").appendChild(tBodyContent);
            });
    }

    loading.parentNode.removeChild(loading);
}

function insertScreenshotsTab(tabContent) {
    let screenshots = mod['screenshots'];
    if (screenshots.length == 0) tabContent.innerHTML = `No images found for this mod.`;
    else {
        tabContent.style.display = "flex";
        tabContent.style.flexDirection = "column";
        tabContent.innerHTML = `<div id="screenshots-container"></div>`;

        let screenshotsContainer = document.getElementById("screenshots-container");
        screenshots.forEach(element => {
            screenshotsContainer.innerHTML += `<img src="${element['url']}" alt="${element['caption']}">`;
        });
    }
}