const express = require('express');
const redis = require('redis');

const axios = require("axios");

const util = require("util")
const redisUrl = "redis://127.0.0.1:6379"
const client = redis.createClient(redisUrl)

client.connect();

client.on('connect', () => {
    console.log('connected');
});



//redis does not work with promises, we have to work with call backs, so we use promisify from utils

//client.set = util.promisify(client.set)



const app = express();
app.use(express.json());




app.post("/set",async (req,res)=>{

    const {key ,value} = req.body;
    
    console.log(key, value)


    //console.log(await client.set(key,value));
    //console.log(await client.get(key)); // 'bar'

    
    const response = await client.set(key,value);

    console.log(response);
   
    res.json(response)

})

app.get("/get",async(req,res)=>{

    const {key} = req.body;

    const value =  await client.get(key)

    res.json(value);
})


app.get("/posts/:id", async(req,res)=>{
    const { id } =req.params;


    const cachedPost= await client.get(`post-${id}`);

    if (cachedPost){
            return  res.json(JSON.parse(cachedPost))
    }

    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);

    client.set(`post-${id}`,JSON.stringify(response.data));

    return res.json(response.data)

})


app.listen(8080,()=>{
    console.log("Hey, now listening on port 8080");
})