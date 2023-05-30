const linkApiCurseForge = "https://api.curseforge.com";
const apiKey = "$2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.";
const gameNameInput = document.getElementById("gameNameInput");
const headers = {
    'Accept': 'application/json',
    'x-api-key': apiKey
};

const getGames = "/v1/games";
var games = new Array();
fetch(linkApiCurseForge + getGames, {
    method: 'GET',
    headers: headers
})
    .then(response => response.json())
    .then(responseJson => {
        responseJson.data.forEach(element => {
            games.push(element);
        })
        gameInserter(games);
    });

gameNameInput.addEventListener("keyup", function (e) {
    if (e.code == "Enter") e.preventDefault();
    else {
        let gamesList = new Array();

        games.forEach(game => {
            if (game['name'].toLowerCase().includes(gameNameInput.value.toLowerCase())) {
                gamesList.push(game);
            }
        });

        gameInserter(gamesList);
    }
});


function gameInserter(gamesList) {
    let gamesGrid = document.getElementsByClassName("games")[0];
    gamesGrid.innerHTML = "";

    for (let i = 0; i < gamesList.length; i++) {
        // console.log(gamesList[i]);
        let game = gamesList[i];
        let card = document.createElement("article");
        card.className = "card";

        let cardHeader = document.createElement("header");
        cardHeader.className = "card-image";
        let cardImage = document.createElement("img");
        cardImage.src = game['assets'].tileUrl;
        cardImage.title = "Image of " + game.name;
        cardImage.height = "184px";
        let cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `<p><strong>${game.name}</strong></p>`;

        cardHeader.appendChild(cardImage);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        gamesGrid.appendChild(card);
    }
}