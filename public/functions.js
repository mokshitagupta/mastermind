const createAcc = `
<form id="create-form" enctype="multipart/form-data" onsubmit="createSubmit(); return false;">
  <label for="username">Enter Username:</label>
  <input name="username" id="c-username" type="text"></input>

  <br>
  <label for="password">Enter Password:</label>
  <input name="password" id="c-password" type="password"></input>
  <p id="c-verif"></p>

  <input type="submit" value="Create account"></input>
  </form>
`

const login = `
<form action="/login" id="login-form" method="post" enctype="multipart/form-data" onsubmit="loginSubmit(); return false;">
  <label for="username">Enter Username:</label>
  <input name="username" id="l-username" type="text"></input>

  <br>
  <label for="password">Enter Password:</label>
  <input name="password" id="l-password" type="password"></input>
  <p id="l-verif"></p>

  <input type="submit" value="Login"></input>
  </form>
`

const errormsg = `
    Username must be 3-16 letters and numbers long, without any special characters <br> 
    Password must be 6-20 letters and numbers long, with at least 1 special character
       
`

function createSubmit(){
    const request = new XMLHttpRequest();
	// onreadystatechange removed for slide
    request.onreadystatechange	=	function(){
        if	(this.readyState	===	4	&&	this.status	===	200){
            resp = JSON.parse(this.response)
            console.log(resp)
            sessionStorage.setItem("id", resp.id)
            sessionStorage.setItem("cookie", resp.cookie)
            document.getElementById("c-verif").innerHTML = "Account creation was successful!"
            window.location.href = "/set-avatar"
        }
        if	(this.readyState	===	4	&&	this.status	===	401){
            document.getElementById("c-verif").innerHTML = errormsg
        }
        if	(this.readyState	===	4	&&	this.status	===	401){
            document.getElementById("c-verif").innerHTML = "Username is taken!"
        }
    }
	request.open("POST", "/create-acc");
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username:document.getElementById("c-username").value,
    password:document.getElementById("c-password").value}))
    // request.send(formData)
}

function loginSubmit(){
    const request = new XMLHttpRequest();
	// onreadystatechange removed for slide
    request.onreadystatechange	=	function(){
        if	(this.readyState	===	4	&&	this.status	===	402){
            document.getElementById("l-verif").innerHTML = "Incorrect login info!"
        }
        if	(this.readyState	===	4	&&	this.status	===	401){
            document.getElementById("l-verif").innerHTML = errormsg
        }
        if	(this.readyState	===	4	&&	this.status	===	200){
            resp = JSON.parse(this.response)
            console.log(resp)
            sessionStorage.setItem("id", resp.id)
            sessionStorage.setItem("cookie", resp.cookie)
            document.getElementById("l-verif").innerHTML = "Login Successful!"
            window.location.href = `/user/${resp.id}`
        }
    }
    
	request.open("POST", "/login");
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username:document.getElementById("l-username").value,
    password:document.getElementById("l-password").value}))
}

function generateUser(){
    const request = new XMLHttpRequest();
	// onreadystatechange removed for slide
	request.open("POST", "/gen-user");
    request.setRequestHeader('Content-Type', 'application/json');
    request.send()
}

function insertCreate(){
    console.log("user tried to create account")
    document.getElementById("onboarding").innerHTML = createAcc
}
  
function insertLogin(){
    console.log("user tried to login")
    document.getElementById("onboarding").innerHTML = login
}

function verifyCookies(key, val, path, redir="/"){
    const request = new XMLHttpRequest();
	// onreadystatechange removed for slide

    request.onreadystatechange	=	function(){
        if	(this.readyState	===	4	&&	this.status	===	200){
            console.log(this.response)   
            window.location.href = `/user/${sessionStorage.getItem("id")}` 
                    
        }

        if	(this.readyState	===	4	&&	this.status	===	401){
            window.location.href = "/"
        }
    }

    request.open("POST", path);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({id:sessionStorage.getItem("id"),
    cookie: sessionStorage.getItem("cookie"),
    [key]:val,
}))
    
}

//pic 1
function submitPinky(){
    verifyCookies("option", 1, "/set-avatar")
    console.log("user chose pinky")
}

//pic 2
function submitPurple(){
    verifyCookies("option", 2, "/set-avatar")
    console.log("user chose purple")
}

//pic 3
function submitYellow(){
    verifyCookies("option", 3, "/set-avatar")
    console.log("user chose yellow")
}