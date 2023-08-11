const express = require('express')
// import { createServer as createViteServer } from 'vite'
const db =  require('./db.js')
const profile = require("./profile.js")
const socketIO = require('socket.io');
const bcrypt = require("bcrypt")
const http = require('http');
const { Server } = require("socket.io");


const saltRounds = 10
var usernameRegex = /^[a-zA-Z0-9]{3,16}/;
var pswdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;

const PORT = process.env.PORT || 5173;

// [ [ [x,y], [x,y], [x,y] ] ]
let lobbies = []
let lobbyLookup = {}
let MAXCAP = 2
let LOBBY_PREFIX = "Room "

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

function createCookie(username){
    const characters ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ret=""
    for (let i=0; i < 21; i++){
        ret += characters.charAt(Math.random() * characters.length)
    }

    db.dbInsert({username:username, cookie:ret})

    return ret

}

function getLobby(playeri, soc){

    let player = soc.id
    if (player in lobbyLookup){
        console.log("player already exists")
        let ret;
        for (let i =0; i < lobbyLookup[player].length; i++){
            if (!(lobbyLookup[player][i][0] == player)){
                ret = lobbyLookup[player][i]
            }
        }
        return [lobbies.length - 1, ret]
    }

    if (lobbies.length == 0){
        console.log("creating first lobby")
        lobbies.push([[player, soc]])
    } else{
        let last = lobbies[lobbies.length - 1]
        if (last.length < MAXCAP){
            console.log("putting in existing lobby")
            lobbies[lobbies.length - 1].push([player,soc])
            lobbyLookup[player] = lobbies.length - 1
            return [lobbies.length - 1, lobbies[lobbies.length - 1][0] ]
        }else{
            console.log("creating new lobby")
            lobbies.push([[player,soc]])
        }
    }

    lobbyLookup[player] = lobbies.length - 1
    return [lobbies.length - 1, null]
}

function lobbyRemove(id){
    
    let ind = lobbyLookup[id]
    if(!ind){
        return
    }
    console.log(id, lobbies, ind, lobbyLookup)
    delete lobbyLookup[id]
    for (let i=0; i< lobbies[ind]; i++){
        let el = lobbies[ind][i][0]
        if(el == id){
            lobbies[ind].splice(i, 1)
        }
    }
    console.log(lobbies, ind, lobbyLookup)
    if(lobbies[ind].length ==0){
        lobbies.splice(ind, 1)
    }
}

function verifyCookie(id, cookie){
    return db.dbFind("cookie", cookie)
    .then((entry) => {
        console.log(entry)
        if(!entry){
            return false
        } else{
            if (entry.username == id){
                return true
            }else{
                return false
            }
        }
    })
}

function waitForResponse(socket, eventName, alt) {
    return new Promise((resolve, reject) => {
        socket.on(eventName, data => {
            resolve(data);
        });

        socket.on(alt, data => {
            resolve(data);
        });
    });
}

async function createServer() {
    const app = express()
    app.use(express.json())

    const server = http.createServer(app);
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user just connected.');
        socket.on('disconnect', () => {
            lobbyRemove(socket.id)
            console.log('A user has disconnected.');
        })

        socket.on('new user', (id) => {
            console.log(`${id} has joined`);
            let val = getLobby(id, socket)
            const lobby = val[0]
            const nbr = val[1]
            console.log(lobby, "proposed")
            const room = LOBBY_PREFIX+lobby

            if(nbr){
                socket.emit("option")
                nbr[1].emit("option")

                const retRoom = room

                Promise.all([
                    waitForResponse(socket, "accept", "reject"),
                    waitForResponse(nbr[1], "accept", "reject")
                ])
                .then(([r1, r2]) => {

                    if(r1 == true && r2 == true){
                        console.log("CONNECTING USERS", retRoom)
                        socket.join(retRoom)
                        nbr[1].join(retRoom)
                        socket.emit("assigned", retRoom)
                        nbr[1].emit("assigned", retRoom)
                    }else{
                    }
                })
                .catch(error => {
                    // Handle errors if waitForResponse or other async operations fail
                    console.error("Error:", error);
                });
            }      
        })

        socket.on('add color', (details) => {
            console.log(details)
            io.to(details.room).emit("add color", details)
        })

        socket.on('undo', (details) => {
            console.log(details)
            io.to(details.room).emit("undo", details)
        })

        socket.on('submit', (details) => {
            console.log(details)
            io.to(details.room).emit("submit", details)
        })
    });


    app.use('/',express.static("./public/index.html") )

    app.post('/create-acc', (req, res) => {
        console.log(req.body)
        utest = usernameRegex.test(req.body.username)
        ptest = pswdRegex.test(req.body.password)

        if (!utest || !ptest){
            res.status(401).send()
        }else{
            db.dbFind("username", req.body.username)
            .then((ret) => {
                if(ret){
                    res.status(402).send()
                }else {
                    bcrypt.genSalt(saltRounds)
                    .then((salt) => {
                        return bcrypt.hash(req.body.password, salt)
                    })
                    .then((hash) => {
                        db.increment()
                        .then((id) => {
                            console.log("assigned id: ", id)
                            entry = {
                                userNumber : id, 
                                username : req.body.username,
                                password: hash,
                            }
            
                            db.dbInsert(entry)
                            return id
                        })
                        .then((id) => {
                            res.send(JSON.stringify({success:true, id:id, cookie:createCookie(id)}))
                        })
                    })
                }
            })
            
            
        }
        
    })

    app.post('/login', (req, res) => {
        console.log(req.body)
        utest = usernameRegex.test(req.body.username)
        ptest = pswdRegex.test(req.body.password)

        if (!utest || !ptest){
            res.status(401).send()
        }else{
            db.dbFind("username", req.body.username)
            .then((entry) => {
                console.log(entry)
                if(!entry){
                    return res.status(402).send('Incorrect Info')
                }else{
                    bcrypt.compare(req.body.password, entry.password)
                    .then((result) => {
                        console.log("verification -->", result)
                        if (result == true){
                            res.send(JSON.stringify({success:true, id:entry.userNumber, cookie:createCookie(entry.userNumber)}))
                        }else {
                            res.status(402).send('Incorrect password')
                        }
                    })
            }
            })
            
        }
    })

    app.post('/gen-user', (req, res) => {
        console.log(req.body)
        res.send('Got a POST request')
    })

    app.get('/user/:id', (req, res) => {
        // console.log(req.params.id)
        db.dbFind("userNumber", parseInt(req.params.id))
        .then((entry) => {
            if(!entry){
                res.status(401).send()
            }
            res.send(profile.renderProfile(entry))
        })
        
    })

    app.get('/set-avatar', (req, res) => {
        console.log(req.params.id)
        db.dbFind("userNumber",parseInt(req.params.id) )
        .then(entry =>{
            res.send(profile.renderChoices(entry))
        })
        
    })

    app.use('/game',express.static("game") )

    app.post("/set-avatar", (req, res) => {
        console.log(req.body)
        verifyCookie(req.body.id,req.body.cookie)
        .then((verif) => {
            console.log(verif)
            if(verif == true){
                db.dbUpdate("userNumber", parseInt(req.body.id), "avatar", parseInt(req.body.option))
                db.dbFind("userNumber",parseInt(req.body.id) )
                res.status(200).send()
            }else{
                res.status(401).send()
            }
        })
    })
  
    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    // const vite = await createViteServer({
    //   server: { middlewareMode: true },
    //   appType: 'custom'
    // })
  
    // // Use vite's connect instance as middleware. If you use your own
    // // express router (express.Router()), you should use router.use
    // app.use(vite.middlewares)
    app.use(express.static('public'))
  
    server.listen(PORT)
}

// db.dbInsert({}).then((rt) => {
//     console.log(rt)
// })
createServer()