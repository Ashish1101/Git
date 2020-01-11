const jwt = require('jsonwebtoken')
const {
    User,
    Story
} = require('./models/main')

const auth = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) return res.status(401).send('Access Denied')

    try {
        const verified = jwt.verify(token, 'SecretKey')
        req.user = verified
        next()
    } catch (e) {
        res.status(400).send('User not logged in')
    }
}

module.exports = auth