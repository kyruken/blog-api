const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    timestamp: {
        type: Date,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isPublished: {
        type: Boolean,
    }
})

module.exports = mongoose.model('Post', postSchema);