const express = require('express');

const router = express.Router();


//Posts
router.get('/', (req, res) => {
    res.json({message: "here is all the posts!"})
})

//CRUD Operations
router.get('/:postId', (req, res) => {
    res.json({message: "here is a singular post!"})
})

router.post('/', (req, res) => {
    res.json({message: "Created a new post!"})
})

router.put('/:postId', (req, res) => {
    res.json({message: "Updated a post!"})
})

router.delete('/:postId', (req, res) => {
    res.json({message: "Deleted a post!"})
})


//Comments
router.get('/:postId/comments', (req, res) => {
    res.json({message: `Here is all the comments for this post!`})
})

router.get('/:postId/comments/commentId', (req, res) => {
    res.json({message: `Here is a singular comment for this post!`})
})

module.exports = router;