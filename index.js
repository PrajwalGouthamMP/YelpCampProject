const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const campgroundsRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews')
const userRoute = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash')
const userModel = require('./models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Connection successfull !!")
    }).catch((err) => {
        console.log(err)
    })

const sessionConfig = {
    secret: "Thisisatopsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(userModel.authenticate()))
passport.serializeUser(userModel.serializeUser())
passport.deserializeUser(userModel.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.engine('ejs', ejsMate)
app.get('/', (req, res) => {
    res.render('home.ejs')
})
// app.get('/fakeuser', async (req, res) => {
//     const newUser = new userModel({
//         email: "prajwalmp@gmail.com",
//         username: "Prajwal MP"
//     })
//     const userregistered = await userModel.register(newUser, 'pgmp@123')
//     res.send(userregistered)
// })


app.use('/campgrounds', campgroundsRoute)
app.use('/campgrounds/:id/reviews', reviewsRoute)
app.use('/', userRoute)
app.use(express.static(path.join(__dirname, '/statics')))



app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'We do not serve here !!'))
})
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong !! " } = err
    res.status(status).render('error.ejs', { err })
})
app.listen(3000, () => {
    console.log("Listening on port 3000")
})