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
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        let risultati = new Array();
        let pattern = new RegExp('\\b.*' + inputNomeBlocco.value + '.*\\b', "i");

        await fetch(linkApi + cercaBlocchi).then((response) => response.json()).then((data) => {
            data.forEach(element => {
                if (pattern.test(element['name']) == true) risultati.push(element);
            });
        });

        console.log(risultati);

        suggerimenti(risultati);
    }, 500)
}


let currentFocus = 0;
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
            console.log(arr[i]['name'])
            console.log(inizioStringa + " - InizioStringa");
            let suggerimento = document.createElement('DIV');
            suggerimento.setAttribute("class", "autocomplete-item");
            suggerimento.setAttribute("value", arr[i]['name']);
            let testoSuggerimento = document.createElement('span');

            suggerimento.innerHTML = "<p class='vuoto'></p> <p class='primaColonna'></p>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(0, inizioStringa);
            testoSuggerimento.innerHTML += "<strong>" + arr[i]['name'].substr(inizioStringa, inputNomeBlocco.value.length) + "</strong>";
            testoSuggerimento.innerHTML += arr[i]['name'].substr(inizioStringa+inputNomeBlocco.value.length, );
            // testoSuggerimento.innerHTML += "<input style='margin-top: 0; margin-bottom: 0; height: 75%; border-radius: 0' type='text' value='" + arr[i]['name'] + "' readonly>";

            testoSuggerimento.addEventListener("click", apriPaginaBlocco, false);
            suggerimento.addEventListener("click", closeAllLists, false);

            suggerimento.appendChild(testoSuggerimento);
            suggerimento.innerHTML += "<p class='vuoto'></p>";
            div.appendChild(suggerimento);
        }
    }

    function apriPaginaBlocco() {
        console.log(this.value);
        let nomeBlocco = this.value.replace(/\s/g, '+');
        let link = window.location.href + "blocco.html" + "?" + nomeBlocco;
        window.location.href = link;
    }

    function closeAllLists() {
        let div = document.getElementById("autocomplete-list");
        let children = div.childNodes, n = children.length;
        for (let i = 0; i < n; i++) {
            div.removeChild(children[0]);
        }
    }
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.getElementById("autocomplete");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}