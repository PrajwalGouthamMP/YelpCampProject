const ExpressError = require('./utils/ExpressError')
const { joiSchema, reviewSchema } = require('./joischema')
const campModel = require('./models/campground');
const Review = require('./models/review');

module.exports.ensureLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in first ! ')
        return res.redirect('/login')
    }
    else {
        next()
    }
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    const { error } = joiSchema.validate(req.body)


    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next()
    }
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await campModel.findById(id).populate('author')
    if (req.user && !campground.author.equals(req.user._id)) {
        req.flash('error', 'Only author can perform this operation')
        return res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }

}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'Only author can perform this operation')
        return res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }

}
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)


    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next()
    }
}
