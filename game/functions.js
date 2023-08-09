const ROWNUM = 10
const DOTS = 4
var boardArr = []
let history = []
let curr = 1;
let finished = 0;
let totalTries = 10;
const CORRECT = "correct";
const WRONG = "wrong";
const timeTop = "05:00"
const mins = 5*60
let score = 0
let done=false

let hiddenArr = ["green", "green", "green", "green"]

function setboard(){
    let board = document.getElementById("gboard")

    let rows = ""
    
    for (let rin = 0; rin < ROWNUM + 0; rin++) {

        boardArr.push([])
        let dots = `<div class="game-row" id="row-${rin+1}">
        <div class="grow-cont" id="row-${rin+1}">`
        for (let din = 0; din < DOTS + 0; din++) {
            let dot = `<div class="play-dot" id="dot-${DOTS*rin + din +1}"></div>`
            dots += dot

            boardArr[rin][din] = "-"
        }

        dots += "</div>"
        
        grill = `<div class="grill" id="grillb-${rin+1}"></div>
        <div class="sub-cont" id="sub-${rin+1}"></div>
        `
       
        dots += grill
        dots += "</div>"
        

        rows += dots
    }

    //SETUP HIDDEN ROW ------ 
    rows += `<br><div class="game-row grayed" id="row-${ROWNUM+1}"><div class="grow-cont hidden" id="hrow-${ROWNUM+1}">`
    for (let din = 0; din < DOTS + 0; din++) {
        let dot = `<div class="play-dot ${hiddenArr[din]}" id="dot-${DOTS*ROWNUM + din +1}"></div>`
        rows += dot
    }
    rows += "</div>"
    rows += "</div>"

    // rows += "</div>"
    board.innerHTML = rows

    for (let index = 0; index < ROWNUM+0; index++) {
        let elm = document.getElementById(`grillb-${index+1}`)
        grillstr = ""
        for (let din = 0; din < DOTS + 0; din++) {
            grilld = `<div class="grill-dot" id="gdot-${DOTS*index + din +1}"></div>`
            grillstr += grilld
        }
        elm.innerHTML += grillstr
        
    }

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

function submitRow(row){
    console.log("Submitted ", row)
    console.log(boardArr)
    finished++

    //row - 1  * DOTS + din
    let dpre = (row-1)*DOTS
    let right = 0
    for (let index = 1; index < DOTS+ 1; index++) {
        let grill = document.getElementById(`gdot-${dpre+index}`)
        let chosen = boardArr[row-1][index-1]
        let expected = hiddenArr[index-1]
        console.log(expected, chosen)
        if (chosen == expected){
            right++
            grill.classList.add(CORRECT)
        }else{
            grill.classList.add(WRONG)
        }
    }

    if (right==DOTS){
        endGame(won=true)
    }

    score += right * row

    document.getElementById("tries").innerHTML = totalTries-finished
    document.getElementById("score").innerHTML = score

    let button = document.getElementById(`sub-${row}`)
    button.innerHTML = ""
    document.addEventListener("colored", handleColor)

    if (finished==totalTries){
        endGame()
    }
}

function handleUndo(n){
    //dont undo if first box, or back row
    console.log("undo", curr)
    if(!(Math.ceil((curr -1 )/4) == finished )){  
        let elm = document.getElementById("dot-"+curr)
        let box = history.pop()
        let button = document.getElementById(`sub-${box[0]+1}`)
        button.innerHTML = ""
        boardArr[box[0]][box[1]] = "-"
        elm.classList.remove("highlight")
        curr--
        elm = document.getElementById("dot-"+curr)
        elm.classList.remove(box[2])
        elm.classList.add("highlight")
        document.addEventListener("colored", handleColor)
    }

}

function handleColor(e){
        if (curr <= ROWNUM*DOTS){
            let elm = document.getElementById("dot-"+curr)
            // console.log(e.detail, e)
            elm.classList.remove("highlight")
            elm.classList.add(e.detail)

            let layer = Math.ceil(curr/DOTS)

            let ind = curr
            if (!(ind % DOTS == 0)){
                ind = ind %DOTS
            }else{
                ind = DOTS
            }

            //Minus 1 for indexes
            history.push([layer-1, ind-1, e.detail])

            console.log("setting ",layer,ind)
            boardArr[layer-1][ind-1] = e.detail

            curr++
            elm = document.getElementById("dot-"+curr)
            if (ind == DOTS){
                let button = document.getElementById(`sub-${layer}`)
                button.innerHTML = `<buttton class="sub-row" onclick="submitRow(${layer})">Submit</button>`
                console.log("removing")
                document.removeEventListener("colored", handleColor)
            } else if (curr <= ROWNUM*DOTS) {
                
                elm.classList.add("highlight")
            }

            
            // console.log(curr)
        }
}

function insertListeners(elm){
    document.addEventListener("undo", handleUndo)
    document.addEventListener("colored", handleColor)
}

function startGame(){

    setboard()
    let timer = document.getElementById("time")
    startTimer(mins, timer)
    console.log(boardArr)
    let elm = document.getElementById("dot-"+curr)
    elm.classList.add("highlight")

    insertListeners(elm)

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
    var event = new CustomEvent("colored", {"detail":"red"});
    document.dispatchEvent(event);
}

function blueClick(){
    var event = new CustomEvent("colored", { "detail": "blue" });
    document.dispatchEvent(event);
}

function greenClick(){
    var event = new CustomEvent("colored", { "detail": "green" });
    document.dispatchEvent(event);
}

function cyanClick(){
    var event = new CustomEvent("colored", { "detail": "cyan" });
    document.dispatchEvent(event);
}

function orangeClick(){
    var event = new CustomEvent("colored", { "detail": "orange" });
    document.dispatchEvent(event);
}

function yellowClick(){
    var event = new CustomEvent("colored", { "detail": "yellow" });
    document.dispatchEvent(event);
}

function navyClick(){
    var event = new CustomEvent("colored", { "detail": "navy" });
    document.dispatchEvent(event);
}

function grayClick(){
    var event = new CustomEvent("colored", { "detail": "gray" });
    document.dispatchEvent(event);
}

function undo(){
    var event = new CustomEvent("undo");
    document.dispatchEvent(event);
}

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    let timerFn = setInterval(function () {

        if (done==true || timer==0){
            clearInterval(timerFn)
        }
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            endGame();
            clearInterval(timerFn)
        }
    }, 1000)
}