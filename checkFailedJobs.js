import {redis} from "./redisClient.js";

async function check(){
    const jobs=await redis.lrange("failed_jobs",0,-1);
    console.log("Failed jobs:",jobs);
}

check();