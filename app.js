const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const {
    User
} = require('./models/main')
const fetch = require('node-fetch')
const flash = require('connect-flash')
const cookie = require('cookie-parser')
const session = require('express-session')
const {
    check,
    validationResult
} = require('express-validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./verify')

app.get('/', (req, res) => {
    res.send('hello this is me')
})

//setting up database
const url = 'mongodb+srv://test:test@lpudevapp-uj2xp.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(url, {
        useFindAndModify: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('Connected to database'))
    .catch(err => console.log(err))

//setting up the json parse method
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))



app.use(cookie())
app.use(session({
    secret: 'hello',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

app.set('view engine', 'ejs')

app.get('/signup', (req, res) => {
    res.render('form')
})

app.get('/login', (req,res) => {
    res.render('login', {flashMessages:'You are registered successfully'})
})


app.post('/signup', (req, res) => {
    // check('name', 'Name is required').isEmpty()
    // check('email', 'Email is required').isEmpty().isEmail()
    // check('password', 'password is required').isEmpty()

    // const error = validationResult(req)

    // if (error) {
    //     return res.redirect('/signup')
    // } else {
        User.findOne({
                email: req.body.email
            })
            .then(user => {
                if (user) {
                    req.flash('error', 'Email Already Exists')
                    return res.redirect('/signup')
                }

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                bcryptjs.genSalt(10, (err, salt) => {
                    if (err) {
                        throw err
                    }

                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err

                        newUser.password = hash

                        newUser.save().then(user => {
                                req.flash('success', 'You are registered')
                                res.redirect('/login')
                            })
                            .catch(err => console.log(err))
                    })
                })

            }).catch(err => console.log(err))
    

})

app.post('/login', (req, res) => {
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (!user) {
                req.flash('error', 'Email not Registered')
                res.redirect('/signup')
            }

            bcryptjs.compare(req.body.password, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        req.flash('error', 'Password Incorrect')
                        res.redirect('/login')
                    }

                    const Payload = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password
                    }

                    const token = jwt.sign(Payload , 'SecretKey', {expiresIn:'1h'})
                    res.header('auth-token', token).json({token:token})

                })
                .catch(err => console.log(err))
        }).catch(err => console.log(err))
})

 const Post = require('./models/post')

 app.post('/story', auth ,  (req, res) => {
     const post = new Post({
         user: req.user.id,
         title:req.body.title,
         text: req.body.text
     })

     post.save().then(post => res.json(post)).catch(err => console.log(err))
 })

// app.get('/github/' , (req, res) => {
//     let query = req.query
//     fetch('https://api.github.com/users/'+query)
//     .then(res => res.json())
//     .then(json => res.render('github', {data:json}));
// })

// app.get('/github', (req, res) => {
//     fetch('https://api.github.com/users/Ashish1101')
//     .then(data => data.json())
//     .then(jsonData => res.json(`user ${jsonData.login} is created at ${jsonData.created_at} and has ${jsonData.public_repos} and has public reposatory ${jsonData.followers} followers`))
//     // .then(jsonData => console.log(jsonData))
// })

console.log("hello new branch")

app.listen(port, () => console.log(`server is up on ${port}`))
