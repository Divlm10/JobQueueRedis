import {redis} from "./redisClient.js";

async function check(){
    const jobId=process.argv[2];
    const job=await redis.hgetall(`job:${jobId}`);//retrieves all fields inside the hash into job variable
    console.log(job);
}
check();