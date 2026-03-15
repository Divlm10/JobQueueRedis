import {redis} from "./redisClient.js";

const QUEUE_NAME="job_queue";
const FAILED_QUEUE="failed_jobs";//Dead letter Queue(DLQ)
const DELAYED_QUEUE="delayed_jobs";
//priority
const HIGH_QUEUE="high_queue";
const NORMAL_QUEUE="normal_queue";
const LOW_QUEUE="low_queue";

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
//blocking worker->block until a job appears(brpop)
export async function getJobBlocking(){
    const result = await redis.brpop(QUEUE_NAME);

    if(!result)return null;
    //returns [queueName,job]
    const job=result[1];
    return job;
}

export async function addFailedJobs(job){
    await redis.lpush(FAILED_QUEUE,job);
    console.log("Job moved to failed queue",job.id);
}

export async function saveJob(job){
    const key=`job:${job.id}`;//key for hashset

    await redis.hset(key,{
        status: "pending",  //start with pending
        retries: job.retries,
        type: job.type
    });
}

export async function addDelayedJob(job,delayMS){
    const runAt=Date.now() + delayMS;//score to add
    
    await redis.zadd(DELAYED_QUEUE,{
        score: runAt,
        // member: JSON.stringify(job) //convert obj to str
        member: job
    });

    console.log(`Job ${job.id} scheduled for ${delayMS}ms later`);
}

export async function addPriorityJob(job){
    const priority=job.priority || "normal";//extract from passed job or default to normal
    if(priority==="high"){
        await redis.lpush(HIGH_QUEUE,job);
    }
    else if(priority==="low"){
        await redis.lpush(LOW_QUEUE,job);
    }
    else{
        await redis.lpush(NORMAL_QUEUE,job);
    }

    await redis.hset(`job:${job.id}`,{
        status:"pending",
        retries:job.retries
    });

    console.log(`Job ${job.id} added with ${priority} priority`);
}