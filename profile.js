const imgLookup = {
    1: "/pinky.png",
    2: "/purple.png",
    3: "/yellow.png",
}


function renderProfile(info){
    const pfp = imgLookup[parseInt(info.avatar)]
    return `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <!-- <link rel="icon" type="image/svg+xml" href="/vite.svg" /> -->
        <!-- <meta name="viewport" content="width=device-width, initial-scale=1.0" /> -->
        <link rel="stylesheet" type="text/css" href="/style.css"/>
        <title>A Game</title>
    </head>
    <body class="body-choose">
    <h1>Welcome, <i>${info.username}</i></h1>
    <img src="${pfp}"></img>
    <h2>Stats and Information</h2>
    <ul>
    <li>Wins: 0</li>
    <li>Loses: 0</li>
    <li>
    <input placeholder="${info.username}"></input>
    <button type="submit">Change username</button>
    </li>
    <li>
    <button type="submit">Change Avatar</button>
    </li>
    </ul>
    </body>
    </html>
    `
}

function renderChoices(){
    return `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <!-- <link rel="icon" type="image/svg+xml" href="/vite.svg" /> -->
        <!-- <meta name="viewport" content="width=device-width, initial-scale=1.0" /> -->
        <link rel="stylesheet" type="text/css" href="/style.css"/>
        <title>A Game</title>
    </head>
    <body class="body-choose">
    <script src="/functions.js"></script>
    <h1 class="choose-heading">Welcome! Choose an avatar here:</h1>
    <br><br>
    <div id="profile-options" class="profile-options">
    <button onclick="submitPinky()"><img id="pinky"  class="pinky" src="/pinky.png"></img></button>
    <button onclick="submitPurple()"><img id="purple" class="purple"  src="/purple.png"></img></button>
    <button onclick="submitYellow()"><img id="yellow" class="yellow" src="/yellow.png"></img></button>
    </div>
    </body>
    </html>
    `
}

module.exports = {
    renderProfile,
    renderChoices
}