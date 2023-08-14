// const colors = require("./code.js")

//CONSTANTS ------
const ROWNUM = 10
const DOTS = 4
let totalTries = 10;
const CORRECT = "correct";
const WRONG = "wrong";
const timeTop = "05:00"
const mins = 5*60

//STATES ------
let started = false
let waiting = false

var boardArr = []
let history = []
let curr = 1;
let score = 0
let finished = 0;
let done=false
let blocked=false
let myLobby=""

//SOCKET ------
var socket=null

//SECRET INFO ------
let hiddenArr = ["green", "green", "green", "green"]

function setboard(prefix=""){
    let board = document.getElementById(`${prefix}gboard`)

    let rows = ""
    
    for (let rin = 0; rin < ROWNUM + 0; rin++) {

        boardArr.push([])
        let dots = `<div class="${prefix}game-row" id="${prefix}row-${rin+1}">
        <div class="grow-cont" id="${prefix}row-${rin+1}">`
        for (let din = 0; din < DOTS + 0; din++) {
            let dot = `<div class="play-dot" id="${prefix}dot-${DOTS*rin + din +1}"></div>`
            dots += dot

            boardArr[rin][din] = "-"
        }

        dots += "</div>"
        
        grill = `<div class="grill" id="${prefix}grillb-${rin+1}"></div>
        <div class="${prefix}sub-cont" id="${prefix}sub-${rin+1}"></div>
        `
       
        dots += grill
        dots += "</div>"
        

        rows += dots
    }

    //SETUP HIDDEN ROW ------ 
    rows += `<br><div class="game-row grayed" id="${prefix}row-${ROWNUM+1}"><div class="grow-cont hidden" id="${prefix}hrow-${ROWNUM+1}">`
    for (let din = 0; din < DOTS + 0; din++) {
        let dot = `<div class="play-dot ${hiddenArr[din]}" id="${prefix}dot-${DOTS*ROWNUM + din +1}"></div>`
        rows += dot
    }
    rows += "</div>"
    rows += "</div>"

    // rows += "</div>"
    board.innerHTML = rows

    for (let index = 0; index < ROWNUM+0; index++) {
        let elm = document.getElementById(`${prefix}grillb-${index+1}`)
        grillstr = ""
        for (let din = 0; din < DOTS + 0; din++) {
            grilld = `<div class="grill-dot" id="${prefix}gdot-${DOTS*index + din +1}"></div>`
            grillstr += grilld
        }
        elm.innerHTML += grillstr
        
    }

    if (prefix == ""){
    //SETUP PALETTE ROW ------
        let pt = document.getElementById("palette")
        let colors = [
            "red", 
            "blue",
            "green",
            "cyan",
            "orange",
            "yellow",
            "navy",
            "gray",
        ]
        let palette = `
        <div id="status"></div>
        <div class="pt-row">`

        for (let index = 0; index < colors.length; index++) {
            palette += `<button onclick="${colors[index]}Click()" class="${colors[index]} pbox" id="${colors[index]}-box"></button>`
        }

        palette += `</div>`
        palette += `<br><br> <button onclick="undo()" id="undo">Undo action</button>
        <h2>Stats</h2>
        <p>Time Left: <span id="time">${timeTop}</span></p>
        <p>Tries: <span id="tries">10</span></p>
        <p>Score: <span id="score">0</span></p>
        `
        pt.innerHTML = palette
    }
}


function handleUndo(n){
    //dont undo if first box, or back row
    console.log("undo", n.detail)
    if("dot" in n.detail){
        console.log("undo inside", n.detail)
        let elm = document.getElementById(n.detail.prefix+"dot-"+n.detail.dot)
        elm.classList.remove(n.detail.color)
    }
    else if(!(Math.ceil((curr -1 )/4) == finished )){  
        blocked=false
        let elm = document.getElementById("dot-"+curr)
        let box = history.pop()
        let button = document.getElementById(`sub-${box[0]+1}`)
        button.innerHTML = ""
        boardArr[box[0]][box[1]] = "-"
        elm.classList.remove("highlight")

        socket.emit("undo", {
            room: myLobby,
            user:sessionStorage.getItem("id"),
            dot:curr-1,
            color:box[2],
        })

        curr--
        elm = document.getElementById("dot-"+curr)
        elm.classList.remove(box[2])
        elm.classList.add("highlight")
        document.addEventListener("colored", handleColor)
    }

}

function test(){
    console.log("hi")
}


function handleColor(e){
    console.log(e)
    if ("dot" in e.detail){
        let prefix = e.detail.prefix
        // console.log(e.detail.dot, "Accesing ", prefix+"dot-"+e.dot)
        let elm = document.getElementById(prefix+"dot-"+e.detail.dot)
        elm.classList.add(e.detail.color)
    } else if (curr <= ROWNUM*DOTS && blocked != true){
        
        let elm = document.getElementById("dot-"+curr)
        // console.log(e.detail, e)
        elm.classList.remove("highlight")
        elm.classList.add(e.detail.color)

        let layer = Math.ceil(curr/DOTS)

        let ind = curr
        if (!(ind % DOTS == 0)){
            ind = ind %DOTS
        }else{
            ind = DOTS
        }

        //Minus 1 for indexes
        history.push([layer-1, ind-1, e.detail.color])

        console.log("setting ",layer,ind)
        boardArr[layer-1][ind-1] = e.detail.color

        socket.emit("add color", {
            user:sessionStorage.getItem("id"),
            room:myLobby,
            dot:curr,
            color:e.detail.color,
        })

        curr++
        elm = document.getElementById("dot-"+curr)
        if (ind == DOTS){
            let button = document.getElementById(`sub-${layer}`)
            button.innerHTML = `<button class="sub-row" onclick="submitRow(${layer})" id="button-${layer}">Submit</button>`
            // document.getElementById(`button-${layer}`).addEventListener("click", );
            // console.log( getEventListeners(document.(`button-${layer}`)).listeners)
            console.log("removing")
            blocked=true
            // document.removeEventListener("colored", handleColor)
        } else if (curr <= ROWNUM*DOTS) {
            
            elm.classList.add("highlight")
        }

        
        // console.log(curr)
    }
}

function submitRow(row){
    console.log("Submitted ", row)
    console.log(boardArr)
    finished++

    //row - 1  * DOTS + din
    let dpre = (row-1)*DOTS
    let right = 0

    let socketInfo = {}

    for (let index = 1; index < DOTS+ 1; index++) {
        let grill = document.getElementById(`gdot-${dpre+index}`)
        let chosen = boardArr[row-1][index-1]
        let expected = hiddenArr[index-1]
        console.log(expected, chosen)
        if (chosen == expected){
            right++
            grill.classList.add(CORRECT)
            socketInfo[dpre+index] = CORRECT
        }else{
            grill.classList.add(WRONG)
            socketInfo[dpre+index] = WRONG
        }
    }

    if (right==DOTS){
        endGame(won=true)
    }

    socket.emit("submit", {
        room: myLobby,
        user:sessionStorage.getItem("id"),
        info:socketInfo,
        prefix:"p2-",
    })

    score += right * row

    document.getElementById("tries").innerHTML = totalTries-finished
    document.getElementById("score").innerHTML = score

    let button = document.getElementById(`sub-${row}`)
    button.innerHTML = ""
    // document.addEventListener("colored", handleColor)
    blocked=false


    if (finished==totalTries){
        endGame()
    }
}

function insertListeners(prefix=""){
    document.addEventListener("undo", handleUndo)
    document.addEventListener("colored", handleColor)
    document.addEventListener("submit", handleMultSubmit)
}

function handleMultSubmit(e){
    for (const [key, value] of Object.entries(e.detail.info)) {
        document.getElementById(`${e.detail.prefix}gdot-${key}`).classList.add(value)
    }
}

function startGame(){

    // document.getElementById("waiting-room").remove()
    started = true
    setboard()
    let timer = document.getElementById("time")
    startTimer(mins, timer)
    console.log(boardArr)
    let elm = document.getElementById("dot-"+curr)
    elm.classList.add("highlight")

    insertListeners()

}

function endGame(won=false){
    if(won==true){
        document.getElementById("status").innerHTML = "<h1>You guessed the combination!</h1>"
    }else{
        document.getElementById("status").innerHTML = "<h1>You lost :(</h1>"
    }

    done=true
    
    document.removeEventListener("undo", handleUndo)
    document.removeEventListener("colored", handleColor)
    console.log(document.getElementById(`row-${ROWNUM+1}`).classList, document.getElementById(`row-${ROWNUM+1}`))
    document.getElementById(`hrow-${ROWNUM+1}`).classList.remove("hidden")
}

function redClick(){
    var event = new CustomEvent("colored", {"detail":{color:"red", prefix:""}});
    document.dispatchEvent(event);
}

function blueClick(){
    var event = new CustomEvent("colored",{"detail": {color:"blue", prefix:""}});
    document.dispatchEvent(event);
}

function greenClick(){
    var event = new CustomEvent("colored", { "detail": {color:"green", prefix:""} });
    document.dispatchEvent(event);
}

function cyanClick(){
    var event = new CustomEvent("colored", { "detail": {color:"cyan", prefix:""} });
    document.dispatchEvent(event);
}

function orangeClick(){
    var event = new CustomEvent("colored", { "detail": {color:"orange", prefix:""} });
    document.dispatchEvent(event);
}

function yellowClick(){
    var event = new CustomEvent("colored", { "detail": {color:"yellow", prefix:""} });
    document.dispatchEvent(event);
}

function navyClick(){
    var event = new CustomEvent("colored", { "detail": {color:"navy", prefix:""} });
    document.dispatchEvent(event);
}

function grayClick(){
    var event = new CustomEvent("colored", { "detail": {color:"gray", prefix:""} });
    document.dispatchEvent(event);
}

function undo(){
    var event = new CustomEvent("undo", {"detail" : {prefix:""}});
    document.dispatchEvent(event);
}

function startTimer(duration, display, action=endGame) {
    var timer = duration, minutes, seconds;
    console.log("timer fn called")
    let timerFn = setInterval(function () {

        if (waiting==true){
            return
        }

        if (done==true || timer==0){
            clearInterval(timerFn)
        }
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        // console.log(minutes,seconds)
        display.innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
            action();
            clearInterval(timerFn)
        }
    }, 1000)
}

function startMultGame(){

    // socket.emit('startGame');
    // document.getElementById("waiting-room").remove()
    document.getElementById("p2-gboard").classList.remove("hidden")
    let overlay = document.getElementById("waiting-room")
    if(overlay){
        document.getElementById("app").removeChild(overlay)
    }
    // websocketConn()

    setboard()
    setboard("p2-")
    // document.getElementById("sides").classList.add("half")
    document.getElementById("palette").classList.add("squish")
    startGame()
    insertListeners("p2-")
}

function websocketConn(){
    socket = io('http://localhost:5173', {
        transports: ['websocket'], 
        upgrade: false
    });

    const userID = sessionStorage.getItem("id")

    if (userID){
        //TODO: Add verification
        console.log("emiting new user")
        socket.emit('new user', userID);
    }else{
        //redirect user to login
        window.location.href = "/"
    }

    socket.on("option", () => {
        if (started == false){
            socket.emit("accept", true)
            waiting = true
        }else{
            socket.emit("reject", false)
        }
    })

    socket.on("assigned", (lobby) => {
        myLobby = lobby
        console.log("i got assigned to lobby: ", myLobby)

        // const request = new XMLHttpRequest();
        // request.open("POST", "/set-code");
        // request.setRequestHeader('Content-Type', 'application/json');
        // request.send(JSON.stringify({
        //     room:myLobby,
        //     user:sessionStorage.getItem("id")
        // }))

        // socket.emit("redirect", "/set-code")
        document.getElementById("waiting-room").innerHTML = renderColors()

        waiting=false

        letChoose()
        // window.location.href = "/set-code"
        // startMultGame()
    })

    socket.on("ready", () => {
        startMultGame()
    })

    socket.on("add color", (detail) => {
        //ignore my own move
        if (!(detail.user == sessionStorage.getItem("id"))){
            //raise event with new prefix
            console.log("raising ", detail.dot)
            var event = new CustomEvent("colored", { "detail": {color:detail.color, prefix:"p2-", dot:detail.dot} });
            document.dispatchEvent(event);
        }
        console.log("rcvd ", detail)
    })

    socket.on("undo", (detail) => {
        if (!(detail.user == sessionStorage.getItem("id"))){
            //raise event with new prefix
            console.log("raising ", detail.dot)
            var event = new CustomEvent("undo", { "detail": {prefix:"p2-", dot:detail.dot, color:detail.color} });
            document.dispatchEvent(event);
        }
    })

    socket.on("hiddenArr", (detail) => {
        hiddenArr = detail.hiddenArr
        console.log(hiddenArr, detail)
    })

    socket.on("submit", (detail) => {
        if (!(detail.user == sessionStorage.getItem("id"))){
            //raise event with new prefix
            console.log("raising ", detail)
            var event = new CustomEvent("submit", { "detail": {prefix:"p2-", info:detail.info} });
            document.dispatchEvent(event);
        }
    })
}

// module.exports = {
//     websocketConn,
//     socket,
//     startTimer
// }