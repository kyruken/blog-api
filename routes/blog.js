const express = require('express');
const async = require('async');
const jwt = require('jsonwebtoken');
const Post = require('../models/postModel')
const Comment = require('../models/commentModel');


const router = express.Router();

//Blogs
//verify token, if token isn't verified, give isPublished == true posts
//if token is verified(admin page), give all posts
router.get('/', verifyToken, (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            Post.where('title').where('isPublished').equals('true')
            .exec((err, publishedPosts) => {
                if (err) {
                    return res.sendStatus(500);
                }

                res.json({posts: publishedPosts});
            })
        } else {
            Post.where('title')
            .exec((err, allPosts) => {
                if (err) {
                    return res.sendStatus(500);
                }

                res.json({posts: allPosts});
            })
        }
    })
})

//CRUD Operations
router.get('/:postId', (req, res, next) => {
    Post.findById(req.params.postId, (err, post) => {
        if (err) {
            return res.sendStatus(500);
        }

        res.json({post});
    })
})

router.post('/', verifyToken, (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
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
                }
        
                res.sendStatus(200);
            });
        }
    })
})

router.put('/:postId', verifyToken, (req, res, next) => {

    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }
    
        Post.findById(req.params.postId, (err, thePost) => {
            if (err) {
                return res.sendStatus(500);
            }
    
            const newPost = new Post({
                _id: req.params.postId,
                title: req.body.title ? req.body.title : thePost.title,
                body: req.body.description ? req.body.description : thePost.description,
                timestamp: new Date(),
                comments: typeof thePost.comments === "undefined" ? [] : thePost.comments,
                isPublished: req.body.isPublished !== "undefined" ? req.body.isPublished : thePost.isPublished
            })
    
            Post.findByIdAndUpdate(req.params.postId, newPost, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
        
                res.sendStatus(200);
            })
        });

    })
})

router.delete('/:postId', verifyToken, (req, res, next) => {

    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }

        Post.findByIdAndDelete(req.params.postId, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        })
    })
})


//Comments
router.get('/:postId/comments', (req, res, next) => {
    Post.findById(req.params.postId)
    .populate('comments')
    .exec((err, data) => {
        if (err) {
            return res.sendStatus(500);
        }

        res.json({comments: data.comments});
    })
})

router.post('/:postId/comments', (req, res, next) => {
    Post.findById(req.params.postId, (err, thePost) => {
        if (err) {
            return res.sendStatus(500);
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
                return res.sendStatus(500);
            }

            res.sendStatus(200);
        })
    })
    
})

router.get('/:postId/comments/:commentId', (req, res, next) => {
    Comment.findById(req.params.commentId, (err, theComment) => {
        if (err) {
            return res.sendStatus(500);
        }

        res.json({comment: theComment});
    })
})

router.delete('/:postId/comments/:commentId', verifyToken, (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }

        Post.findById(req.params.postId, (err, thePost) => {
            if (err) {
                return res.sendStatus(500);
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
                return res.sendStatus(500);
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
    }
    //used to be res.sendStatus(403), but I want blog page to be able to get
    //posts if an error occurs
    next();
}

module.exports = router;