const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    isPublished: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('Post', postSchema);