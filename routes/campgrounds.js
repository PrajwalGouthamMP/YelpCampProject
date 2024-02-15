const express = require('express')
const route = express.Router()
const campModel = require('../models/campground')
const wrapAsync = require('../utils/wrapAsync')
const ExpressError = require('../utils/ExpressError')
const { joiSchema } = require('../joischema')
const validateCampground = (req, res, next) => {
    const { error } = joiSchema.validate(req.body)


    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next()
    }
}

route.get('/', wrapAsync(async (req, res) => {
    const camps = await campModel.find({})
    res.render('campgrounds/allcampg.ejs', { camps })
}))
route.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    console.log(req.body)
    const campground = new campModel(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)

}))
route.get('/new', (req, res) => {
    res.render("campgrounds/newcamp.ejs")
})
route.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await campModel.findById(id).populate('reviews')
    res.render('campgrounds/singlecamp.ejs', { campground })
}))
route.put('/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params
    await campModel.findByIdAndUpdate(id, req.body.campground)
    res.redirect(`/campgrounds/${id}`)
}))
route.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    await campModel.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))
route.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params
    const campground = await campModel.findById(id)
    res.render("campgrounds/editcamp.ejs", { campground })
}))
module.exports = route