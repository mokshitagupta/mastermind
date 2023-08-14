function renderColors(){
   return `
    <link rel="stylesheet" type="text/css" href="/style.css"/>
    <div id="set-code">

    <h4>You have <span id="clr-timer" >01:00</span> minutes to choose!</h4><br>
    <h3>Drag and drop the selection of colors 
    for your enemy to guess!<br> Make it a difficult one 😉</h3>

    <div id="clr-slots">

        <div data-draggable="target" id="slot-1" class="slot-div"></div>
        <div data-draggable="target" id="slot-2" class="slot-div"></div>
        <div data-draggable="target" id="slot-3" class="slot-div"></div>
        <div data-draggable="target" id="slot-4" class="slot-div"></div>

    </div>

    <div id="button-cont">

        <button draggable="true" color="red" class="red code-btn grabbable"></button>
        <button draggable="true" color="blue" class="blue code-btn grabbable"></button>
        <button draggable="true" color="green" class="green code-btn grabbable"></button>
        <button draggable="true"  color="yellow-b"class="yellow-b code-btn grabbable"></button>

        <button draggable="true" color="orage" class="orange code-btn grabbable"></button>
        <button draggable="true" color="gray" class="gray code-btn grabbable"></button>
        <button draggable="true" color="cyan" class="cyan code-btn grabbable"></button>
        <button draggable="true" color="navy" class="navy code-btn grabbable"></button>
    </div>

    <div class="submit-colors">
        <p id="validation"></p>
        <button onclick="validateColors()">Submit and Play!</button>
    </div>
    </div>
    `
}

function validateColors(){
    let done= true
    let choice=[]
    for (let index = 1; index <= 4; index++) {
        const element = document.getElementById("slot-"+index)

        if (element.classList.length == 1){
            done=false
            break
        }

        let chosen = element.classList[1]
        if (chosen == "yellow-b"){
            chosen="yellow"
        }

        choice.push(chosen)
        
    }

    if (done==true){
        document.getElementById("validation").innerHTML= "Good choice!"
        console.log("Sending arr", socket)
        waiting=true
        socket.emit("hiddenArr", {
            user:sessionStorage.getItem("id"),
            choice:choice,
            room: parseInt(myLobby.replace("Room ", ""))
        })
    }else{
        document.getElementById("validation").innerHTML= "Please add all 4 colors to be guessed."
    }
}

function selectRand(){
    let choices = ["red", "blue", "yellow", "orange", "green", "cyan", "gray", "navy"]
    let ret = []

    for (let index = 0; index < DOTS; index++) {
        ret.push(choices[Math.floor(Math.random() * choices.length)])
    }

    console.log("Sending arr", socket)
    socket.emit("hiddenArr", {
        user:sessionStorage.getItem("id"),
        choice:ret,
        room: parseInt(myLobby.replace("Room ", ""))
    })
}


function letChoose(){

    // console.log(document.getElementById("clr-timer"))

    startTimer(1*60, document.getElementById("clr-timer"), action=selectRand)

    function dragStart(e){
        console.log("dragging")
        dragging= e.target;
        e.dataTransfer.setData('text', '');
    }
    
    var dragging = null;
    const item = document.querySelectorAll('.code-btn');
    console.log(item)

    for (let index = 0; index < item.length; index++) {
        const element = item[index];
        console.log(element)
        element.addEventListener('dragstart', dragStart, false);  
    }

    document.addEventListener('dragover', function(e)
    {
        if(item)
        {
            e.preventDefault();
        }

    }, false);	

    document.addEventListener('drop', function(e)
    {
        //if this element is a drop target, move the item here 
        //then prevent default to allow the action (same as dragover)
        if(e.target.getAttribute('data-draggable') == 'target')
        {
            console.log("dropped")

            console.log(e.target.classList)
            if (e.target.classList.length > 1){
                e.target.classList = ["slot-div"]
            }
            e.target.classList.add(dragging.getAttribute("color"));
            
            e.preventDefault();
        }

    }, false);

    document.addEventListener('dragend', function(e)
    {
        dragging = null;

    }, false);

}




// module.exports={
//     renderColors,
// }