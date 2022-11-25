const express = require('express');

const app = express();

const postRouter = require('./routes/post')

app.use('/posts', postRouter)


app.listen(3000, () => {console.log('listening on port 3000')})