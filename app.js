const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()
const fileUpload = require('express-fileupload')

    // error middelware
const errorMiddleware = require('./middlewares/errors')

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(fileUpload());




// import all routes
const product = require('./routes/product')
const auth = require('./routes/auth')
const order = require('./routes/order')
 

app.use('/api/v1', product)
app.use('/api/v1', auth)
app.use('/api/v1', order)


// middleware to handle errors
app.use(errorMiddleware);

module.exports = app