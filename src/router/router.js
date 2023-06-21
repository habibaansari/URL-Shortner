const express=require('express');
const urlController=require('../Controllers/URLController');
const mid=require('../middlewares/middleware');
const Router=express.Router();

//Short the url
Router.post('/url/shorten',mid.validURL,urlController.shortURL);


//Urlcode redirection
Router.get('/:urlCode',mid.validPathParam,urlController.showURL);

//No urlCode
Router.get('/',(req,res)=>{
    return res.status(400).send({status:false,message:"Please provide path params"});
})

module.exports=Router;