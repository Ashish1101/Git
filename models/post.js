const mongoose = require('mongoose')
const schema = mongoose.Schema

const postSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'userPopulate'
    }, 
    title :{
        type: String,
        required : true
    }, 
    text: {
        type: String,
        required: true
    }, 
    date : {
        type: Date.UTC()
    }
})

const Post = mongoose.model('post', postSchema)

module.exports = Post