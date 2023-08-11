// const fns = require("./functions.js")

document.querySelector('#app').innerHTML = `
  <div>
  <br><br>
  <div id="waiting-room">
    <link rel="stylesheet" type="text/css" href="/style.css"/>
    <h2>Welcome to the lobby!<br> You can choose a single player game below or wait for another player to join :)</h2>
    <button onclick="startGame()">Start 1-player Game</button>
    <h4>Automatic redirect to single player game in <span id="w-timer">05:00</span></h4>
    <!-- <button onclick="startMultGame()">Start 2-player Game</button> -->
  </div>
  <div class="side-cont">
  <div id="sides" class="sides">
  <div id="gboard"></div>
  <div id="palette">
  </div>
  
  </div>

  <div id="side-2"></div>
  <div id="p2-gboard" class="hidden"></div>
  </div>
  </div>
  </div>
`
startTimer(5*60, document.getElementById("w-timer"), startGame)
// websocketConn()
