const express = require('express')
// import { createServer as createViteServer } from 'vite'
const db =  require('./db.js')
const profile = require("./profile.js")
const bcrypt = require("bcrypt")
const saltRounds = 10

var usernameRegex = /^[a-zA-Z0-9]{3,16}/;
var pswdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;

const PORT = process.env.PORT || 3000;

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

async function createServer() {
    const app = express()
    app.use(express.json())


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
                    res.status(402).send('Incorrect Info')
                }
                bcrypt.compare(req.body.password, entry.password)
                .then((result) => {
                    console.log("verification -->", result)
                    if (result == true){
                        res.send(JSON.stringify({success:true, id:entry.userNumber, cookie:createCookie(entry.userNumber)}))
                    }else {
                        res.status(402).send('Incorrect password')
                    }
                })
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
  
    app.listen(5173)
}

// db.dbInsert({}).then((rt) => {
//     console.log(rt)
// })
createServer()