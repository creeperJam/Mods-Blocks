let inputNomeBlocco = document.getElementById("nomeBlocco");
let span = document.getElementById("grassetto");


inputNomeBlocco.addEventListener("keyup", cercaBlocco, false);
// inputNomeBlocco.addEventListener("click", function (e) {}, false);
// inputNomeBlocco.addEventListener("submit", apriPaginaBlocco ,false);
const linkApi = "https://minecraft-api.vercel.app/api";


// Link con spiegazione: https://minecraft-api.vercel.app/api/items?limit=25&page=2&sort=name&order=asc&fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D&stackSize=64
// 
// limit=25 --> numero massimo di risultati della ricerca
// page=2 --> pagina della ricerca
// sort=name --> ordina per nome
// order=asc --> ordina in ordine crescente
// fields=%5B%22name%22%2C%22image%22%2C%22stackSize%22%5D --> ["name", "image", "stackSize"] --> campi da visualizzare
// stackSize=64 --> numero di blocchi per stack

// TODO: aggiungere il grassetto alla parte già scritta

const cercaBlocchi = "/items/";
let debounceTimeout = 0;
function cercaBlocco() {
    if (inputNomeBlocco.value.length == 0) {
        let div = document.getElementById('autocomplete-list');
        div.innerHTML = "";
        return;
    }


    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        let risultati = new Array();
        let pattern = new RegExp('^' + inputNomeBlocco.value + '.*\\b', "i");

        await fetch(linkApi + cercaBlocchi).then((response) => response.json()).then((data) => {
            data.forEach(element => {
                if (pattern.test(element['name']) == true) risultati.push(element);
            });
        });

        // console.log(risultati);

        suggerimenti(risultati);
    }, 500)
}

let currentFocus = -1;
function suggerimenti(arr) {
    let div = document.getElementById('autocomplete-list');
    div.innerHTML = "";

    if (arr.length == 0) {
        let suggerimento = document.createElement('DIV');
        suggerimento.setAttribute("class", "autocomplete-item");

        suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna'></p>";
        suggerimento.innerHTML += "<strong>Nessun elemento trovato per la query inserita</strong>";
        suggerimento.innerHTML += "<p class='vuoto'></p>";

        suggerimento.addEventListener("click", closeAllLists, false);

        div.appendChild(suggerimento);
    } else {
        let n = arr.length > 10 ? 10 : arr.length;
        for (let i = 0; i < n; i++) {
            let inizioStringa = arr[i]['name'].toLowerCase().indexOf(inputNomeBlocco.value.toLowerCase());
            // console.log(arr[i]['name'])
            // console.log(inizioStringa + " - InizioStringa");
            let suggerimento = document.createElement('DIV');
            suggerimento.setAttribute("class", "autocomplete-item");
            suggerimento.setAttribute("value", arr[i]['name']);
            let testoSuggerimento = document.createElement('span');

            suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna'></p>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(0, inizioStringa);
            testoSuggerimento.innerHTML += "<strong>" + arr[i]['name'].substr(inizioStringa, inputNomeBlocco.value.length) + "</strong>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(inizioStringa + inputNomeBlocco.value.length,);
            // testoSuggerimento.innerHTML += "<input style='margin-top: 0; margin-bottom: 0; height: 75%; border-radius: 0' type='text' value='" + arr[i]['name'] + "' readonly>";

            testoSuggerimento.addEventListener("click", apriPaginaBlocco, false);
            // suggerimento.addEventListener("click", closeAllLists, false);

            suggerimento.appendChild(testoSuggerimento);
            suggerimento.innerHTML += "<p class='vuoto'></p>";
            div.appendChild(suggerimento);
        }
    }

    function apriPaginaBlocco() {
        // console.log(this.value);
        let nomeBlocco = this.value.replace(/\s/g, '+');
        let link = window.location.href + "risultatoRicerca.html" + "?" + nomeBlocco;
        window.location.href = link;
    }

    function closeAllLists() {
        let div = document.getElementById("autocomplete-list");
        let children = div.childNodes, n = children.length;
        for (let i = 0; i < n; i++) {
            div.removeChild(children[0]);
        }
    }

    inputNomeBlocco.addEventListener("keypress", function (e) {
        let tastoPremuto = e.code;

        if (tastoPremuto == "ArrowDown") {
            console.log(currentFocus);

            if (currentFocus > -1) div.children[currentFocus].blur();
            if (currentFocus < 9) currentFocus++;
            div.children[currentFocus].focus();

            console.log(currentFocus);
        } else if (tastoPremuto == "ArrowUp") {
            console.log(currentFocus);

            if (currentFocus > -1) div.children[currentFocus].blur();
            if (currentFocus > 0) currentFocus--;
            div.children[currentFocus].focus();

            console.log(currentFocus);
        } else if (tastoPremuto == "Enter") {
            e.preventDefault();
            console.log("INVIO if-case - " + tastoPremuto)
        } else {
            console.log("Tasto premuto - " + tastoPremuto)
        }
    })

    document.addEventListener("focusout", function (e) {
        closeAllLists();
    });
}


document.addEventListener("keypress", function (e) {
    if (e.code == "Enter") {
        e.preventDefault();
        // console.log("INVIO documento - " + e.code)
    }
})