
document.querySelector('#app').innerHTML = `
  <div>
  <button onclick="startGame()">Start 1-player Game</button>
  <button onclick="startMultGame()">Start 2-player Game</button>

  <br><br>
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