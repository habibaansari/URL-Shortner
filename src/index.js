const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./router/router');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb+srv://adarshpriyadarshi001:5mwf8qpAYZ4glK7H@cluster0.3cmmxwt.mongodb.net/group11Database?retryWrites=true&w=majority', 
{useNewUrlParser: true})
.then(()=>{console.log('connected to Database');})
.catch((err)=>{console.log(err.message)})


app.use('/',router);

const port = process.env.PORT || 3000;

app.listen(port,()=>{console.log(`App is running on port http://localhost:${port}`)});
