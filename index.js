const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const campModel = require('./models/campground')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Connection successfull !!")
    }).catch((err) => {
        console.log("error ")
        console.log(err)
    })

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.render('home.ejs')
})
app.get('/campgrounds', async (req, res) => {
    const camps = await campModel.find({})
    res.render('campgrounds/allcampg.ejs', { camps })
})
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await campModel.findById(id)
    res.render('campgrounds/singlecamp.ejs', { campground })
})
app.listen(3000, () => {
    console.log("Listening on port 3000")
})