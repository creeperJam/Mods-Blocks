// Global Variabiles/Costants
// var modNameInput = document.getElementById("nomeMod");
const searchButton = document.getElementById("search");
const gameSelect = document.getElementById("gameSelect");
const modNameInput = document.getElementById("modNameInput");
// const datalistNomeMod = document.getElementById("datalistNomeMod");
const autocompleteList = document.getElementById("autocomplete-list");

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
const headers = {
    'Accept': 'application/json',
    'x-api-key': apiKey
};
const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

var modFilePage = 0;
var selectedTab = -1;
var focus = -1;
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
searchButton.addEventListener("click", function () {
    let pageSizeSelect = document.createElement("select");
    pageSizeSelect.id = "pageSize-selector";
    pageSizeSelect.innerHTML = `
                    <option value="10">10</option>
                    <option value="20" selected>20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>`;
    pageSizeSelect.addEventListener("change", async () => {
        pageSize = pageSizeSelect.value;
        await fetchRequest(modNameInput.value);
        search();
    });
    document.getElementById("main").appendChild(pageSizeSelect);
    search();
}, false);


// Spiegazione api usate:

// https://docs.curseforge.com - Chiave API: $2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.
// Spiegazione link curseForge: "https://api.curseforge.com/service"
// Servizi offerti usati:
//   GET /v1/games/ 
//   GET /v1/mods/search/

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
var risultati = new Array();
var pageSize = 20;
var debounceTimeout = 0;
var vecchioInput = "";

async function fetchRequest(input) {
    risultati = new Array();
    await fetch(linkApiCurseForge + getMods + "?gameId=" + gameId + "&searchFilter=" + input + "&sortOrder=desc" + "&sortType=1" + "&pagesize=" + pageSize, {
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

    if (modNameInput.value.trim() == "") {
        autocompleteList.innerHTML = "";
        document.getElementById('main').style.visibility = 'visible';
        searchButton.disabled = true;
        return;
    }

    // console.log(input);
    if (input.length > 0 && input != vecchioInput && e.code != "Enter") {
        clearTimeout(debounceTimeout);
        searchButton.disabled = false;
        debounceTimeout = setTimeout(async () => {
            await fetchRequest(input);

            // console.log(risultati);
            autocompleteList.innerHTML = "";
            document.getElementById('main').style.visibility = 'hidden';
            risultati.forEach((element, index) => {
                // console.log("ci sei?")
                let inizioStringa = element['name'].toLowerCase().indexOf(modNameInput.value.toLowerCase()); // Indice in cui inizia la stringa cercata
                let spacing = document.createElement('p');
                let div = document.createElement("div");
                let span = document.createElement("span");

                div.classList.add("autocomplete-item");
                // div.classList.add("modName");
                spacing.classList.add('modName');
                span.setAttribute("value", element['id']);

                if (index == risultati.length - 1) span.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
                else span.setAttribute("style", "border-radius: 0");

                span.innerHTML = `<strong>${element['name'].substring(inizioStringa, inizioStringa + modNameInput.value.length)}</strong>`;
                span.innerHTML += `${element['name'].substring(inizioStringa + modNameInput.value.length)} - ${element['id']}`;
                // span.innerHTML = element['name'];


                div.appendChild(spacing);
                div.appendChild(span);
                addEventListeners(span);

                autocompleteList.appendChild(div);
            });
        }, 200);
    }

    vecchioInput = input;
}

var tabContent = document.getElementById("tab-content");
function modInfoStructureCreator(modName, modId) {
    let main = document.getElementById('main');
    main.style = "";
    main.innerHTML = "";
    main.classList.remove("results");
    main.classList.add("result");

    modNameInput.value = modName;
    selectedModId = modId;
    autocompleteList.innerHTML = "";

    // Creation of left and right sides core containers of the result
    let leftResult = document.createElement("div");
    let rightResult = document.createElement("div");
    leftResult.classList.add("left-result");
    rightResult.classList.add("right-result");
    leftResult.id = "left-result";
    rightResult.id = "right-result";

    // Creation of the left side of the result
    let modImageContainer = document.createElement("div");
    let modImageElement = document.createElement("img");
    let modNameElement = document.createElement("h4");
    let modAuthorElement = document.createElement("p");
    let tabsNavElement = document.createElement("div");
    let pageSelector = document.createElement("div");
    tabContent = document.createElement("div");

    modImageContainer.id = "mod-image-container";
    modImageElement.id = "mod-image";
    modNameElement.id = "mod-name";
    modAuthorElement.id = "mod-author";
    tabsNavElement.id = "tabs-nav";
    pageSelector.id = "page-selector";
    tabContent.id = "tab-content";

    modImageContainer.appendChild(modImageElement);
    modImageContainer.appendChild(modNameElement);
    leftResult.appendChild(modImageContainer);
    leftResult.appendChild(modAuthorElement);
    leftResult.appendChild(tabsNavElement);
    leftResult.appendChild(pageSelector);
    leftResult.appendChild(tabContent);

    // console.log(leftResult);

    // Creation of the right side of the result
    let rightResultContainer = document.createElement("div");
    let modInfoContainer = document.createElement("div");
    let modCategoriesContainer = document.createElement("div");

    rightResultContainer.id = "rightResultContainer";
    modInfoContainer.id = "modInfoContainer";
    modCategoriesContainer.id = "modCategoriesContainer";

    rightResult.appendChild(rightResultContainer);
    rightResultContainer.appendChild(modInfoContainer);
    rightResultContainer.appendChild(modCategoriesContainer);

    let containerTitle = document.createElement("h2");
    let creationDate = document.createElement("p");
    let lastUpdate = document.createElement("p");
    let downloads = document.createElement("p");

    // containerTitle.id = "containerTitle";
    containerTitle.innerText = "Mod Info";
    creationDate.id = "creationDate";
    lastUpdate.id = "lastUpdate";
    downloads.id = "downloads";
    containerTitle.classList.add("modInfo");
    creationDate.classList.add("modInfo");
    lastUpdate.classList.add("modInfo");
    downloads.classList.add("modInfo");

    modInfoContainer.appendChild(containerTitle);
    modInfoContainer.appendChild(creationDate);
    modInfoContainer.appendChild(lastUpdate);
    modInfoContainer.appendChild(downloads);


    main.appendChild(leftResult);
    main.appendChild(rightResult);
    focus = -1;

    document.getElementById('main').style.visibility = 'visible';
    // return 1;
}

var selectedModId = null;
function addEventListeners(element) {
    element.addEventListener("click", async function () {
        await modInfoStructureCreator(element.textContent.substring(0, element.textContent.indexOf(" -")), element.getAttribute("value"));
        showModInfo();
    });
}


const getMod = "/v1/mods/";
var mod;
async function showModInfo() {


    mod = await fetch(linkApiCurseForge + getMod + selectedModId, {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    // console.log(mod);

    document.getElementById("mod-image").src = mod['logo']['url'];
    document.getElementById("mod-name").innerHTML = " - " + mod['name'];
    // document.getElementById("modId").innerHTML = mod['id'];
    // document.getElementById("modDescription").innerHTML = mod['summary'];
    document.getElementById("mod-author").innerHTML = "By: ";
    for (let i = 0; i < mod['authors'].length; i++) {
        if (i == mod['authors'].length - 1) document.getElementById("mod-author").innerHTML += mod['authors'][i]['name'];
        else document.getElementById("mod-author").innerHTML += mod['authors'][i]['name'] + ", ";
    }
    // document.getElementById("modDownloads").innerHTML = mod['downloadCount'];
    // document.getElementById("modDate").innerHTML = mod['dateReleased'];
    let tabContent = document.getElementById("tab-content");
    tabContent.style.flexDirection = "column";

    let description = await fetch(linkApiCurseForge + getModDescription.replace("{modId}", selectedModId), {
        method: "GET",
        headers: headers
    })
        .then(response => response.json())
        .then(responseJson => { return responseJson.data });

    tabContent.innerHTML = `<p>${description}</p>`;

    document.getElementById('tabs-nav').innerHTML = `
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
        <button href="${mod['links']['sourceUrl']}" type="button" title="source" value="source" class="tab-button" data-tab>
            <a href="${mod['links']['sourceUrl']}" class="tab-link">Source</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button href="${mod['links']['websiteUrl']}" type="button" title="website" value="website" class="tab-button" data-tab>
            <a href="${mod['links']['websiteUrl']}" class="tab-link">Website</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button href="${mod['links']['IssuesUrl']}" type="button" title="issues" value="issues" class="tab-button" data-tab>
            <a href="${mod['links']['IssuesUrl']}" class="tab-link">Issues</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
    <li class="tab">
        <button href="${mod['links']['wikiUrl']}" type="button" title="wiki" value="wiki" class="tab-button" data-tab>
            <a href="${mod['links']['wikiUrl']}" class="tab-link">Wiki</a>
            <img title="external link" src="immagini/external-link.svg" alt="external link" class="svg"/>
        </button>
    </li>
</ul>
    `;

    let tabButtons = document.getElementsByClassName("tab-button");
    for (let index = 0; index < tabButtons.length; index++) {
        tabButtons[index].addEventListener("click", openTab);
    }
    selectedTab = 0;
    // console.log(mod);

    let creationDateValue = new Date(mod['dateCreated']);
    creationDate.innerHTML = "Created: " + creationDateValue.getDate() + "-" + months[creationDateValue.getMonth()] + "-" + creationDateValue.getFullYear();
    let lastUpdateDate = new Date(mod['dateModified']);
    lastUpdate.innerHTML = "Last Update: " + lastUpdateDate.getDate() + "-" + months[lastUpdateDate.getMonth()] + "-" + lastUpdateDate.getFullYear();
    downloads.innerHTML = "Downloads: " + (mod['downloadCount']).toLocaleString().replace(/,/g, " ",);

    let categories = mod['categories'];

    categories.forEach(category => {
        let categoryElement = document.createElement("span");
        categoryElement.classList.add("category");
        categoryElement.innerHTML = category['name'];
        categoryElement.addEventListener("click", function () {
            window.open(category['url']);
        });
        document.getElementById("modCategoriesContainer").appendChild(categoryElement);
    })
}

modNameInput.addEventListener("keydown", function (e) {
    let elements = document.querySelectorAll(".autocomplete-item > span");

    switch (e.key) {
        case "Enter":
            // console.log(focus)
            e.preventDefault();
            if (focus != -1) {
                modInfoStructureCreator(elements[focus].textContent.substring(0, elements[focus].textContent.indexOf(" -")), elements[focus].getAttribute("value"));
                showModInfo();
            } else {
                let pageSizeSelect = document.createElement("select");
                pageSizeSelect.id = "pageSize-selector";
                pageSizeSelect.innerHTML = `
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>`;
                pageSizeSelect.addEventListener("change", async () => {
                    pageSize = pageSizeSelect.value;
                    await fetchRequest(modNameInput.value);
                    search();
                });
                document.getElementById("main").appendChild(pageSizeSelect);
                search();
                setTimeout(function () {
                    autocompleteList.innerHTML = "";
                    document.getElementById("main").style.visibility = "visible";
                }, 500);
            }
            break;

        case "ArrowDown":
            if (focus > -1) elements[focus].classList.remove("focus");
            if (focus < 14) focus++;
            elements[focus].classList.add("focus");
            break;

        case "ArrowUp":
            if (focus > -1) elements[focus].classList.remove("focus");
            if (focus > -1) focus--;
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
        document.getElementById("main").style.visibility = "visible";
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
var arr;
function openTab(e) {
    // TODO: funziona tutto correttamente, unico problema è che se durante il caricamento della tabella con i file si cambia tab e poi si torna subito nei nella tabella dei file,
    //  vengono caricati i file della tabella precedente e di quella attuale

    switch (this.value) {
        case "description":
            if (selectedTab == 0) return;
            document.getElementById("page-selector").innerHTML = "";
            insertDescriptionTab();
            selectedTab = 0;
            break;

        case "files":
            if (selectedTab == 1) return;
            insertFilesTab();
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
            document.getElementById("page-selector").innerHTML = "";
            if (selectedTab == 2) return;
            insertScreenshotsTab();
            selectedTab = 2;
            break;

        default:
            console.log("Opening link of " + this.value);
    }
}

async function insertDescriptionTab() {
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
    gameVersionsArray.forEach((element) => {
        if (pattern.test(element)) gameVersionsString.push(element);
    });
    // console.log(gameVersionsString);

    return gameVersionsString.sort().toString();
}

async function insertFilesTab() {
    // let loading = document.createElement("img"); // Metodo iniziale per indiciare il caricamento
    let modfilesNumRows = 20;
    let numPages = Math.ceil(mod['latestFilesIndexes'].length / modfilesNumRows);
    let pageSelector = document.getElementById("page-selector");

    pageSelector.classList.add("loading");
    pageSelector.innerHTML = "";
    let progress = document.createElement("progress");
    progress.id = "loading-bar";
    progress.value = 0;

    pageSelector.appendChild(progress);
    // pageSelector.innerHTML = `<progress id="loading-bar" value="0" max="20"></progress>`;


    tabContent.style.flexDirection = "row";
    tabContent.innerHTML = `<figure><table id="files-table">
                <thead id="files-header">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Upload date</th>
                        <th scope="col">Game version</th>
                        <th scope="col">Mod loader</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody id="files-body">`


    // document.getElementById("files-table").setAttribute("aria-busy", "true"); // Metodo precedente per indicare il caricamento

    arr = mod['latestFilesIndexes'].slice(modfilesNumRows * modFilePage, modfilesNumRows * (modFilePage + 1));
    progress.max = arr.length;

    for (let i = 0; i < arr.length; i++) {
        await fetch(linkApiCurseForge + getFile.replaceAll("{modId}", selectedModId).replaceAll("{fileId}", arr[i]['fileId']), {
            method: "GET",
            headers: headers
        })
            .then(response => response.json())
            .then(responseJson => responseJson.data)
            .then(file => {
                // console.log(arr[i]);
                // console.log(file)
                let downloadUrl = file['downloadUrl'];

                let tBodyContent = document.createElement("tr");
                // console.log(tabContent);

                tBodyContent.innerHTML += `<th scope="row">${i + 1}</th>`;
                if (file['fileName'].length > 28) {
                    tBodyContent.innerHTML += `
                                <td class="gamefileName" data-tooltip="${file['fileName']}">${file['fileName'].substring(0, 28)}...</td>
                            `;
                } else {
                    tBodyContent.innerHTML += `
                                <td class="gamefileName" data-tooltip="${file['fileName']}">${file['fileName']}</td>
                            `;
                }
                // console.log(tBodyContent);

                let date = (new Date(file['fileDate']).getDate()) + "-" + months[(new Date(file['fileDate']).getMonth())] + "-" + (new Date(file['fileDate']).getFullYear());
                let dateTooltip = date + " @ " + ("0" + new Date(file['fileDate']).getHours()).slice(-2) + ":" + ("0" + new Date(file['fileDate']).getMinutes()).slice(-2) + ":" + ("0" + new Date(file['fileDate']).getSeconds()).slice(-2);
                // console.log(date);
                tBodyContent.innerHTML += `
                            <td class="gamefileDate" data-tooltip="${dateTooltip}">${date}</td>
                            <td class="gamefileVersions">${gameVersions(file['gameVersions'])}</td>
                            <td class="gamefileModLoader">${modLoaders[arr[i]['modLoader']]}</td>
                            <td class="gamefileDownload"><a class="downloadMod" href="${downloadUrl}" download="Mod">Download</a></td>
                        `;
                // console.log(tBodyContent);

                document.getElementById("files-body").appendChild(tBodyContent);
                progress.value++;
            });
    }

    if (modFilePage == 0) pageSelector.innerHTML = `<button class="page-button" id="page-previous" alt="previous" onclick="changePage(${modFilePage - 1})" disabled><img src="./immagini/freccia.png"/></button>`;
    else pageSelector.innerHTML = `<button class="page-button" id="page-previous" alt="previous" onclick="changePage(${modFilePage - 1})"><img src="./immagini/freccia.png"/></button>`;

    for (let i = ((modFilePage - 2 < 0) ? 0 : (modFilePage - 2)); i <= ((modFilePage + 2 > numPages - 1) ? (numPages - 1) : (modFilePage + 2)); i++) {
        // console.log("Current page: " + i)

        if (i == modFilePage) pageSelector.innerHTML += `<button class="page-button" onclick="changePage(${i})" disabled number="true" disabled><strong>${i + 1}</strong></button>`;
        else pageSelector.innerHTML += `<button class="page-button" onclick="changePage(${i})">${i + 1}</button>`;
        // page.innerHTML += `<button class="page-button" onclick="changePage(${i + 1})">${i + 1}</button>`;
    }
    if (modFilePage == numPages - 1) pageSelector.innerHTML += `<button class="page-button" id="page-next" alt="next" onclick="changePage(${modFilePage + 1})" disabled><img src="./immagini/freccia.png"/></button>`;
    else pageSelector.innerHTML += `<button class="page-button" id="page-next" alt="next" onclick="changePage(${modFilePage + 1})"><img src="./immagini/freccia.png"/></button>`;

    pageSelector.classList.remove("loading");
    // document.getElementById("files-table").setAttribute("aria-busy", "false"); // Metodo precedente per indicare il caricamento
}

function changePage(i) {
    // console.log("pagina precedente: " + modFilePage + " - pagina successiva: " + i);
    modFilePage = i;
    insertFilesTab(document.getElementById("files-tab-content"));
}

function insertScreenshotsTab() {
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

// TODO: aggiungere la creazione di una tabella
async function search() {
    let main = document.getElementById('main');
    main.classList.remove("result");
    main.classList.add("results");
    // main.innerHTML = "";

    while (main.children.length > 1) {
        if (main.children[1].id == "pageSize-selector") main.removeChild(main.children[0]);
        else main.removeChild(main.children[1]);
        
    }

    risultati.forEach(element => {
        let div = document.createElement("div");
        div.classList.add("modResultContainer");
        let modImageDiv = document.createElement("div");
        let modNameDiv = document.createElement("div");
        let modSummaryDiv = document.createElement("div");
        let modDetailsDiv = document.createElement("div");
        let modCategoriesDiv = document.createElement("div");

        modImageDiv.classList.add("modResultImage");
        modNameDiv.classList.add("modResultName");
        modSummaryDiv.classList.add("modResultSummary");
        modDetailsDiv.classList.add("modResultDetails");
        modCategoriesDiv.classList.add("modResultCategories");

        modImageDiv.innerHTML = `<img src="${element['logo']['url']}" alt="Mod image" width="200px">`;
        modNameDiv.innerHTML = `<h3>${element['name']}</h3>`;
        modSummaryDiv.innerHTML = `<p>${element['summary']}</p>`;
        let downloadCount = Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(element['downloadCount']);
        // let latestRelease = await fetch(linkApiCurseForge + getFile.replace("{gameId}", element['id'])).replace("{fileId}", element['mainFileId'], {
        //     method: "GET",
        //     headers: headers
        // }).then(response => response.json())
        //     .then(responseJson => { return responseJson.data })
        // let latestReleaseDate = "text";
        modDetailsDiv.innerHTML = `<p>${downloadCount}</p>`; //<p>${downloadCount}</p><p>${downloadCount}</p><p>${downloadCount}</p> TODO: add the other details
        let categories = "";
        element['categories'].forEach((category, index) => {
            if (index == element['categories'].length - 1) categories += `<a href="${category['url']}">${category['name']}</a>`;
            else categories += `<a href="${category['url']}">${category['name']}</a>  |  `;
        });
        modCategoriesDiv.innerHTML = `<span>${categories}</span>`;

        div.appendChild(modImageDiv);
        div.appendChild(modNameDiv);
        div.appendChild(modSummaryDiv);
        div.appendChild(modDetailsDiv);
        div.appendChild(modCategoriesDiv);
        div.addEventListener("click", function () {
            mod = element;
            selectedModId = element['id'];
            modInfoStructureCreator(element['name'], element['id']);
            showModInfo();
        });
        main.appendChild(div);
    });
}