if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();

const blogRouter = require('./routes/blog')

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => {console.error(error)})

app.use(express.urlencoded({extended: true}));

app.use('/posts', blogRouter)


app.listen(3000, () => {console.log('listening on port 3000')})