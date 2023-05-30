const linkApiCurseForge = "https://api.curseforge.com";
const apiKey = "$2a$10$bfD0D0C.HJ.DPma2VLUitO7luPMA0EmnJH8f8I7mocgmlbLKOI4r.";
const headers = {
    'Accept': 'application/json',
    'x-api-key': apiKey
};

const getGames = "/v1/games";
let games = fetch(linkApiCurseForge + getGames, {
    method: 'GET',
    headers: headers
})
    .then(response => response.json())
    .then(responseJson => { return responseJson.data; });