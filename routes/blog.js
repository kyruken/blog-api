const express = require('express');
const async = require('async');
const jwt = require('jsonwebtoken');
const Post = require('../models/postModel')
const Comment = require('../models/commentModel');


const router = express.Router();

//Blogs
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

router.post('/', verifyToken, (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            res.send(err);
            res.sendStatus(403);
        } else {
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
        }
    })
})

router.put('/:postId', verifyToken, (req, res, next) => {

    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            res.sendStatus(403);
        }
    
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
                //When we connect a frontend, we need to change isPublished
                //to take in a req.body.isPublished 
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
})

router.delete('/:postId', (req, res, next) => {

    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            res.sendStatus(403);
        }

        Post.findByIdAndDelete(req.params.postId, (err) => {
            if (err) {
                res.sendStatus(500);
                return next(err);
            }
            res.sendStatus(200);
        })
    })
})


//Comments
router.get('/:postId/comments', (req, res, next) => {
    Post.findById(req.params.postId, (err, thePost) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        res.json({comments: thePost.comments});
    })
})

router.post('/:postId/comments', (req, res, next) => {
    Post.findById(req.params.postId, (err, thePost) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        const newComment = new Comment({
            username: req.body.username,
            comment: req.body.comment,
            timestamp: new Date()
        })

        newComment.save();

        thePost.comments.push(newComment);
        thePost.save((err) => {
            if (err) {
                res.sendStatus(500);
                return next(err);
            }

            res.sendStatus(200);
        })
    })
    
})

router.get('/:postId/comments/:commentId', (req, res, next) => {
    Comment.findById(req.params.commentId, (err, theComment) => {
        if (err) {
            res.sendStatus(500);
            return next(err);
        }

        res.json({comment: theComment});
    })
})

router.delete('/:postId/comments/:commentId', (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            res.sendStatus(403);
        }

        Post.findById(req.params.postId, (err, thePost) => {
            if (err) {
                res.sendStatus(500);
            }
            for (let x = 0; x < thePost.comments.length; x++) {
                if(thePost.comments[x]._id.toString() === req.params.commentId.toString()) {
                    thePost.comments.splice(x, 1);
                    break;
                }
            }
            
            thePost.save();
        });
    
        Comment.findByIdAndDelete(req.params.commentId, (err) => {
            if (err) {
                res.sendStatus(500);
                return next(err);
            }
            res.sendStatus(200);
        });    
    })
})

// Format of Authorization: Bearer <token>
function verifyToken(req, res, next) {
    //Get authorization header value
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        //We split into an array, [Bearer, <token>], then choose bearer[1] to get the token
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;