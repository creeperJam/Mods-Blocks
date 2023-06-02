let itemNameInput = document.getElementById("blockName");
let span = document.getElementById("grassetto");
// let descrizione =

itemNameInput.addEventListener("keyup", searchItem, false);
// itemNameInput.addEventListener("submit", mostraInfoBlocco ,false);
const linkApiListBlocchi = "https://minecraft-api.vercel.app/api"; // API per la lista dei blocchi - restituisce un array contenenete tutti i blocchi in formato JSON
// const linkWiki = "https://minecraft.fandom.com/wiki/itemName?so=search"; // "https://minecraft.fandom.com/wiki/blockName?so=search" - inutilizzabile
const imagesAPILink = "https://raw.githubusercontent.com/Sgambe33/MinecraftAPI/main/images/itemName.png"; // API per le immagini creata da Sgambe

// Spiegazione link: https://minecraft.fandom.com/wiki/Iron_Ingot?so=search - inutilizzabile
// Iron_Ingot --> nome del blocco (replace("itemName", blockName)) con "_" al posto degli spazi
// ?so=search --> ricerca (FISSO)

// Spiegazione link -> http://209.38.242.254:6969/x800/itemName.png
// itemName --> nome del blocco (replace("itemName", blockName)) con "_" al posto degli spazi

// Link con spiegazione: https://minecraft-api.vercel.app/api/items?limit=25&page=2&sort=name&order=asc&fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D&stackSize=64
// 
// limit=25 --> numero massimo di results della ricerca
// page=2 --> pagina della ricerca
// sort=name --> ordina per nome
// order=asc --> ordina in ordine crescente
// fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D --> ["name", "image", "stackSize"] --> campi da visualizzare
// stackSize=64 --> numero di blocchi per stack

const cercaBlocchi = "/items/";
let oldInput = "";
let results = new Array();
let data = fetch(linkApiListBlocchi + cercaBlocchi).then((response) => response.json()).then((data) => {
    return data;
});
function searchItem(e) {
    // results = new Array();
    if (oldInput != itemNameInput.value) {
        let pattern = new RegExp('^' + itemNameInput.value + '.*\\b', "i");
        // await fetch(linkApiListBlocchi + cercaBlocchi).then((response) => response.json()).then((data) => {
        //     data.forEach(element => {
        //         if (pattern.test(element['name']) == true) results.push(element);
        //     });
        // });
        // console.log(results);
        results = new Array();
        data.then(result => {
            result.forEach(element => {
                if (pattern.test(element['name']) == true) results.push(element);
            })
            autocomplete(results);
        });
        oldInput = itemNameInput.value;
    }

    if (itemNameInput.value.length == 0) {
        document.getElementById('autocomplete-list').innerHTML = "";
    }
}

let currentFocus = -1;
function autocomplete(arr) {
    closeAllLists();

    if (arr.length == 0) {
        let div = document.createElement('DIV'); // Div che contiene il div
        let span = document.createElement('span') // Span che contiene il testo del div

        div.setAttribute("class", "autocomplete-item");
        span.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");

        div.innerHTML = "<p class='spacing'></p> <p class='firstColumn'></p>";
        span.innerHTML += "<strong>Nessun elemento trovato per la query inserita</strong>";

        div.addEventListener("click", closeAllLists, false);

        div.appendChild(span);
        div.innerHTML += "<p class='spacing'></p>";
        document.getElementById("autocomplete-list").appendChild(div);
    } else {
        let n = arr.length > 10 ? 10 : arr.length;
        for (let i = 0; i < n; i++) {
            let inizioStringa = arr[i]['name'].toLowerCase().indexOf(itemNameInput.value.toLowerCase()); // Indice in cui inizia la stringa cercata
            let div = document.createElement('DIV'); // Div che contiene il div
            let span = document.createElement('span') // Span che contiene il testo del div

            // Assegnazione attributi ai vari elementi
            div.setAttribute("class", "autocomplete-item");;
            span.setAttribute("value", arr[i]['name']);
            if (i == n - 1) span.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
            else span.setAttribute("style", "border-radius: 0");

            div.innerHTML = "<p class='spacing'></p> <p class='firstColumn' style='color: rgba(0, 0, 0, 0)'>Oggetto: </p>";
            span.innerHTML += arr[i]['name'].substr(0, inizioStringa);
            span.innerHTML += "<strong>" + arr[i]['name'].substr(inizioStringa, itemNameInput.value.length) + "</strong>";
            span.innerHTML += arr[i]['name'].substr(inizioStringa + itemNameInput.value.length);
            // span.innerHTML += "<input style='margin-top: 0; margin-bottom: 0; height: 75%; border-radius: 0' type='text' value='" + arr[i]['name'] + "' readonly>";

            // span.addEventListener("click", mostraInfoBlocco, false);
            // span.addEventListener("click", clickItem, false);

            div.appendChild(span);
            div.innerHTML += "<p class='spacing'></p>";
            document.getElementById("autocomplete-list").appendChild(div);
        }
        addEventListeners();
    }
}

function addEventListeners() {
    let div = document.getElementById("autocomplete-list");
    let children = div.childNodes, n = children.length;
    for (let i = 0; i < n; i++) {
        // children[i].children[2].addEventListener("keydown", showItemInfo);
        children[i].children[2].addEventListener("click", showItemInfo);
        children[i].children[2].addEventListener("click", closeAllLists);
        children[i].children[2].addEventListener("focusout", function (e) {
            closeAllLists();
        });
    }
}


//Aggiunta descrizione e image oggetto nella pagina
const itemName = document.getElementById('itemName');
const itemDescription = document.getElementById('itemDescription');
const image = document.getElementById('itemImage');
let JSONObject;
async function showItemInfo(e) {
    itemNameInput.value = this.getAttribute('value');

    // console.log(results);
    results.forEach(element => {
        // console.log(element.name + " <-> " + itemNameInput.value);
        if (element.name == itemNameInput.value) {
            JSONObject = element;
            // console.log(JSONObject);
            return;
        }
    });
    // console.log(JSONObject);

    itemName.textContent = JSONObject['name'];
    itemDescription.textContent = JSONObject['description'];
    // image.src = imagesAPILink.replace("itemName", itemName)
    // image.src = imagesAPILink.replace("itemName", itemName.textContent.replaceAll(" ", '_').toLowerCase());
    image.style.width = "128px";
    image.style.height = "128px";

    const options = {
        method: "GET"
    }

    let url = URL.createObjectURL(await fetch(imagesAPILink.replace("itemName", JSONObject['namespacedId']), options)
        .then(response => {
            return response.blob()
        }));

    image.src = url;

    document.getElementsByClassName("destra")[0].offsetHeight = document.getElementsByClassName("sinistra")[0].offsetHeight;

    // console.log(JSONObject['namespacedId'])
    // let response = await fetch(imagesAPILink.replace("itemName", JSONObject['namespacedId']), options);
    // if (response.status === 200) {

    //     const imageBlob = await response.blob();
    //     const imageObjectURL = URL.createObjectURL(imageBlob);

    //     image.src = imageObjectURL;
    // }
    // else {
    //     console.log("HTTP-Error: " + response.status);
    //     let canvas = document.createElement("canvas");
    //     let ctx = canvas.getContext("2d");

    //     // Actual resizing
    //     let temp = document.createElement("img");
    //     temp.src = JSONObject['image'];
    //     ctx.drawImage(temp, 0, 0, 128, 128);

    //     let dataurl = canvas.toDataURL();
    //     image.src = dataurl;
    // }
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

itemNameInput.addEventListener("keyup", async function (e) {
    let divs = document.getElementById('autocomplete-list').children;
    // console.log(divs[0].children)
    let pressedKey = e.code;

    // console.log(pressedKey);

    if (pressedKey == "ArrowDown") {
        if (currentFocus > -1) noFocus(divs[currentFocus].children[2]);
        if (currentFocus < 9) currentFocus++;
        focus(divs[currentFocus].children[2]);
    } else if (pressedKey == "ArrowUp") {
        if (currentFocus > -1) noFocus(divs[currentFocus].children[2]);
        if (currentFocus > 0) currentFocus--;
        focus(divs[currentFocus].children[2]);
    } else if (pressedKey == "Enter") {
        e.preventDefault();
        // console.log("INVIO if-case - " + pressedKey)
        // console.log(divs[currentFocus].children[2].value);
        itemNameInput.value = divs[currentFocus].children[2].getAttribute('value');
        currentFocus = -1;
        closeAllLists();
    } else {
        // console.log("Tasto premuto - " + pressedKey)
    }
})

document.getElementById("blockName").addEventListener("focusout", function (e) {
    setTimeout(closeAllLists, 500);
});

document.addEventListener("keypress", function (e) {
    if (e.code == "Enter") {
        e.preventDefault();
        // console.log("INVIO documento - " + e.code)
    }
})