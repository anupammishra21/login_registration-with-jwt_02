const express = require("express");
const app = express();
const path = require("path");
require('dotenv').config()

const bodyparser= require('body-parser')

app.set('view engine', 'ejs')
app.set('views','views')

_=require('underscore')

app.use(express.static(path.join(__dirname, 'public',)))

const expressSession = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')



app.use(expressSession({
    secret: "MYS3CR3TK3Y",
    cookie:{maxAge:60000},
    resave:false,
    saveUninitialized:true


}))


app.use(flash())
app.use((cookieParser()))

app.use(bodyparser.urlencoded({
    extended:true
}))


const jwt = require('./middleware/auth')
app.use(jwt.authJwt)

const logRegRouter = require('./routes/logReg.routes')

app.use(logRegRouter)

require(path.join(__dirname, '/config/database'))()


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running @ http://127.0.0.1:${process.env.PORT}`);

})
