let inputNomeBlocco = document.getElementById("nomeBlocco");
let span = document.getElementById("grassetto");
// let descrizione =

inputNomeBlocco.addEventListener("keyup", cercaBlocco, false);
// inputNomeBlocco.addEventListener("submit", mostraInfoBlocco ,false);
const linkApiListBlocchi = "https://minecraft-api.vercel.app/api"; // API per la lista dei blocchi - restituisce un array contenenete tutti i blocchi in formato JSON
// const linkWiki = "https://minecraft.fandom.com/wiki/itemName?so=search"; // "https://minecraft.fandom.com/wiki/NomeBlocco?so=search" - inutilizzabile
const linkApiImmagini = "https://raw.githubusercontent.com/Sgambe33/MinecraftAPI/main/images/itemName.png"; // API per le immagini creata da Sgambe

// Spiegazione link: https://minecraft.fandom.com/wiki/Iron_Ingot?so=search - inutilizzabile
// Iron_Ingot --> nome del blocco (replace("itemName", nomeBlocco)) con "_" al posto degli spazi
// ?so=search --> ricerca (FISSO)

// Spiegazione link -> http://209.38.242.254:6969/x800/itemName.png
// itemName --> nome del blocco (replace("itemName", nomeBlocco)) con "_" al posto degli spazi

// Link con spiegazione: https://minecraft-api.vercel.app/api/items?limit=25&page=2&sort=name&order=asc&fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D&stackSize=64
// 
// limit=25 --> numero massimo di risultati della ricerca
// page=2 --> pagina della ricerca
// sort=name --> ordina per nome
// order=asc --> ordina in ordine crescente
// fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D --> ["name", "image", "stackSize"] --> campi da visualizzare
// stackSize=64 --> numero di blocchi per stack

const cercaBlocchi = "/items/";
let vecchioInput = "";
let risultati = new Array();
let data = fetch(linkApiListBlocchi + cercaBlocchi).then((response) => response.json()).then((data) => {
    return data;
});
function cercaBlocco(e) {
    // risultati = new Array();
    if (vecchioInput != inputNomeBlocco.value) {
        let pattern = new RegExp('^' + inputNomeBlocco.value + '.*\\b', "i");
        // await fetch(linkApiListBlocchi + cercaBlocchi).then((response) => response.json()).then((data) => {
        //     data.forEach(element => {
        //         if (pattern.test(element['name']) == true) risultati.push(element);
        //     });
        // });
        // console.log(risultati);
        risultati = new Array();
        data.then(result => {
            result.forEach(element => {
                if (pattern.test(element['name']) == true) risultati.push(element);
            })
            suggerimenti(risultati);
        });
        vecchioInput = inputNomeBlocco.value;
    }

    if (inputNomeBlocco.value.length == 0) {
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
            let inizioStringa = arr[i]['name'].toLowerCase().indexOf(inputNomeBlocco.value.toLowerCase()); // Indice in cui inizia la stringa cercata
            let suggerimento = document.createElement('DIV'); // Div che contiene il suggerimento
            let testoSuggerimento = document.createElement('span') // Span che contiene il testo del suggerimento

            // Assegnazione attributi ai vari elementi
            suggerimento.setAttribute("class", "autocomplete-item");;
            testoSuggerimento.setAttribute("value", arr[i]['name']);
            if (i == n - 1) testoSuggerimento.setAttribute("style", "border-radius: 0 0 var(--border-radius) var(--border-radius)");
            else testoSuggerimento.setAttribute("style", "border-radius: 0");

            suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna' style='color: rgba(0, 0, 0, 0)'>Oggetto: </p>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(0, inizioStringa);
            testoSuggerimento.innerHTML += "<strong>" + arr[i]['name'].substr(inizioStringa, inputNomeBlocco.value.length) + "</strong>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(inizioStringa + inputNomeBlocco.value.length);
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
        // children[i].children[2].addEventListener("keydown", mostraInfo);
        children[i].children[2].addEventListener("click", mostraInfo);
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
let oggettoJSON;
async function mostraInfo(e) {
    inputNomeBlocco.value = this.getAttribute('value');

    // console.log(risultati);
    risultati.forEach(element => {
        // console.log(element.name + " <-> " + inputNomeBlocco.value);
        if (element.name == inputNomeBlocco.value) {
            oggettoJSON = element;
            // console.log(oggettoJSON);
            return;
        }
    });
    // console.log(oggettoJSON);

    itemName.textContent = oggettoJSON['name'];
    itemDescription.textContent = oggettoJSON['description'];
    // image.src = linkApiImmagini.replace("itemName", itemName)
    // image.src = linkApiImmagini.replace("itemName", itemName.textContent.replaceAll(" ", '_').toLowerCase());
    image.style.width = "128px";
    image.style.height = "128px";

    const options = {
        method: "GET"
    }

    let url = URL.createObjectURL(await fetch(linkApiImmagini.replace("itemName", oggettoJSON['namespacedId']), options)
        .then(response => {
            return response.blob()
        }));

    image.src = url;

    document.getElementsByClassName("destra")[0].offsetHeight = document.getElementsByClassName("sinistra")[0].offsetHeight;

    // console.log(oggettoJSON['namespacedId'])
    // let response = await fetch(linkApiImmagini.replace("itemName", oggettoJSON['namespacedId']), options);
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
    //     temp.src = oggettoJSON['image'];
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

inputNomeBlocco.addEventListener("keyup", async function (e) {
    let divs = document.getElementById('autocomplete-list').children;
    // console.log(divs[0].children)
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
        inputNomeBlocco.value = divs[currentFocus].children[2].getAttribute('value');
        currentFocus = -1;
        closeAllLists();
    } else {
        // console.log("Tasto premuto - " + tastoPremuto)
    }
})

document.getElementById("nomeBlocco").addEventListener("focusout", function (e) {
    setTimeout(closeAllLists, 500);
});

document.addEventListener("keypress", function (e) {
    if (e.code == "Enter") {
        e.preventDefault();
        // console.log("INVIO documento - " + e.code)
    }
})