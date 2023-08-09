// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
  <h1>A very awesome and amazing game</h1>
  <button onclick="generateUser()">Play as guest</button>
  <button onclick="insertCreate()">Create an account</button>
  <button onclick="insertLogin()">Login</button>

  <br><br>
  <div id="onboarding"></div>
  
  </div>
`



// setupCounter(document.querySelector('#counter'))
