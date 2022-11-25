const express = require('express');
const async = require('async');
const Post = require('../models/postModel')
const Comment = require('../models/commentModel');

const router = express.Router();


//Posts
router.get('/', (req, res, next) => {
    Post.where('title')
    .exec((err, allPosts) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        res.json({posts: allPosts});
    })
})

//CRUD Operations
router.get('/:postId', (req, res, next) => {
    Post.findById(req.params.postId, (err, post) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        res.json({post});
    })
})

router.post('/', (req, res, next) => {
    const newPost = new Post({
        title: req.body.title,
        body: req.body.description,
        timestamp: new Date(),
        comments: [],
        isPublished: false
    })

    newPost.save((err) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        res.sendStatus(200);
    });
})

router.put('/:postId', (req, res, next) => {

    Post.findById(req.params.postId, (err, thePost) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        const newPost = new Post({
            _id: req.params.postId,
            title: req.body.title,
            body: req.body.description,
            timestamp: new Date(),
            comments: typeof thePost.comments === "undefined" ? [] : thePost.comments,
            isPublished: thePost.isPublished
        })

        Post.findByIdAndUpdate(req.params.postId, newPost, (err) => {
            if (err) {
                res.sendStatus(500);
                return next(err);
            }
    
            res.sendStatus(200);
        })
    });

})

router.delete('/:postId', (req, res, next) => {
    Post.findByIdAndDelete(req.params.postId, (err) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }
        res.sendStatus(200);
    })
})


//Comments
router.get('/:postId/comments', (req, res) => {
    res.json({message: `Here is all the comments for this post!`})
})

router.post('/:postId/comments', (req, res) => {
    res.json({message: "Created a new comment!"})
})

router.get('/:postId/comments/commentId', (req, res) => {
    res.json({message: `Here is a singular comment for this post!`})
})

module.exports = router;