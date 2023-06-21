const URLmodel = require('../model/URLmodel.js');
const {customAlphabet}= require('nanoid');
const redis = require("redis");
const { promisify } = require("util");

//1. Connect to the redis server
const redisClient = redis.createClient(
  16834,
  "redis-16834.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("dW2yO03aBkWYV7Vr0AmK1d6Kj3nvzyCT", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const expiryTime=24*60*60;

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const shortURL = async (req,res)=>  {
    try {
        const longURL = req.body.longUrl;
        let cahcedData = await GET_ASYNC(`${longURL}`);
        if(cahcedData) {
            return res.status(200).json({status: true, "data": JSON.parse(cahcedData)});
        }
        const isPresent = await URLmodel.findOne({longUrl: longURL});
        if (isPresent) {
            const data = {
                longUrl: isPresent.longUrl,
                shortUrl: isPresent.shortUrl,
                urlCode: isPresent.urlCode
            } 
            res.status(200).json({status: true, "data": data})
        } else {
            const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789_-';
            const nanoid = customAlphabet(alphabet, 8);
            
            let urlCode = nanoid();
            while(1) {
                const isUrlCode = await URLmodel.findOne({urlCode: urlCode})
                if (isUrlCode ) {
                    const nanoid = customAlphabet(alphabet, 8);
                    urlCode = nanoid();
                }
                else {
                    break;
                }
            }
            const shortURL = `http://localhost:3000/${urlCode}`
            const data = {
                longUrl: longURL,
                shortUrl: shortURL,
                urlCode: urlCode
            } 
            await SET_ASYNC(`${data.urlCode}`,data.longUrl);
            await redisClient.expire(`${data.urlCode}`,expiryTime);

            await SET_ASYNC(`${data.longUrl}`,JSON.stringify(data));
            await redisClient.expire(`${data.longUrl}`,expiryTime);

            const createShortUrl = await URLmodel.create(data);
            res.status(201).json({status: true, "data": data})
        }

    } catch(err) {
        res.status(500).json({status: false, message: err.message});
    }
}

const showURL = async (req,res)=>  {
    try {
        const URLcode = req.params.urlCode;
        let cahcedData = await GET_ASYNC(`${URLcode}`);
        
        if(cahcedData) {
            return res.status(302).redirect(cahcedData);
        }
        const data = await URLmodel.findOne({urlCode: URLcode})
        if (!data) {
            return res.status(404).json({status: false, message: "Invalid URLcode"});
        }
        res.status(302).redirect(data.longUrl);
    } catch(err) {
        res.status(500).json({status: false, message:err.message});
    }
}

module.exports = { shortURL, showURL }
