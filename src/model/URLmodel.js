const mongoose  = require('mongoose');

const urlModel=new mongoose.Schema({
    urlCode:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    longUrl:{
        type:String,
        required:true
    },
    shortUrl:{
        type:String,
        required:true,
        unique:true
    }

},{timestamps:true});

module.exports=mongoose.model('UrlData',urlModel);