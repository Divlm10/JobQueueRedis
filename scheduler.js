import { redis } from "./redisClient.js";
import { addJob } from "./queue.js";

// This worker checks for jobs whose scheduled time has arrived.

const DELAYED_QUEUE="delayed_jobs";

async function scheduler(){
    console.log("Scheduler started...");
    while(true){
        //keeps working forever (every 2 sec)
        const now=Date.now();
        // const jobs=await redis.zremrangebyscore( //all jobs whose score <= currtime(now)
        //     DELAYED_QUEUE,
        //     0,    //0->now
        //     now
        // );
         const jobs = await redis.zrange(
            DELAYED_QUEUE,
            0,
            now,
            { byScore: true }
        );
        // const jobs=response.result;

        if(!jobs || jobs.length===0){
            await new Promise(r => setTimeout(r,2000));
            continue;
        }
        //loop thru all valid ready jobs
        for(const jobStr of jobs){
            // const job=JSON.parse(jobStr); //Convert Job String Back To get OG Object
            const job = jobStr;
            console.log(`Moving delayed job ${job.id} to queue`);
            
            await addJob(job);//push the job to main list queue=>LPUSH(job_queue,job)
            await redis.zrem(DELAYED_QUEUE,jobStr);//remove the job from delayed job queue=>avoid running again
        }
        //pause scheduler for 2 secs before next check
        await new Promise(r=>setTimeout(r,2000));
    }
}
scheduler();//call the function to start the scheduler