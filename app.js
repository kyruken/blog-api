require('dotenv').config()

const express = require('express');
const app = express();

const blogRouter = require('./routes/blog')


app.use('/posts', blogRouter)


app.listen(3000, () => {console.log('listening on port 3000')})