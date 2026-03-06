import {redis} from "./redisClient.js";

const QUEUE_NAME="job_queue";

/*
Add job to queue
PRODUCER pushing a job.
*/

export async function addJob(job){
    //convert job obj to string before storing
    // const jobData=JSON.stringify(job);
    // //insert job at front of list
    // await redis.lpush(QUEUE_NAME,jobData);
    await redis.lpush(QUEUE_NAME,job);
    console.log("Job added to queue:",job); 
}

/*
Fetch job from queue
WORKER consuming a job.
*/

export async function getJob(){
    //remove job from end of list=>FIFO behavior
    const job=await redis.rpop(QUEUE_NAME);
    if(!job){
        return null;
    }
    // return JSON.parse(job);
    return job || null;
}
