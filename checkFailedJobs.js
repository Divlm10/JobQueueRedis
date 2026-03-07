import {redis} from "./redisClient.js";

async function check(){
    const jobs=await redis.lrange("failed_jobs",0,-1);//start from start to last=>get all elements from failed list
    console.log("Failed jobs:",jobs);
}

check();