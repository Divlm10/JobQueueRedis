import {redis} from "./redisClient.js";

async function test(){
    await redis.set("name","Div");//key-value

    const value=await redis.get("name");

    console.log("Value from Redis:",value);
}

test();