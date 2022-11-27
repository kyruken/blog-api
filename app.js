if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();

const User = require('./models/userModel');

const blogRouter = require('./routes/blog');

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => {console.error(error)})

app.use(express.urlencoded({extended: true}));

app.use('/posts', blogRouter)

app.post('/api/login', (req, res, next) => {
    User.findOne((err, user) => {
        if (err) {
            return next(err);
        }
        if (user.username !== req.body.username) {
            return res.json({message: "Wrong username"});
        }

        bcrypt.compare(req.body.password, user.password, (err, match) => {
            if (err) {
                return next(err);
            }

            if (match) {
                jwt.sign({user}, process.env.SECRET_KEY, {expiresIn: '1h'}, (err, token) => {
                    res.json({token});
                });
                
            } else {
                res.send('Wrong password');
            }
        })
    })
})

app.listen(3000, () => {console.log('listening on port 3000')})