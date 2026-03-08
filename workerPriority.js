import { redis } from "./redisClient.js";
import { addJob,addFailedJobs } from "./queue.js";

const HIGH_QUEUE="high_queue";
const NORMAL_QUEUE="normal_queue";
const LOW_QUEUE="low_queue";

async function getPriorityJob(){
    //check high priority first
    let job=await redis.rpop(HIGH_QUEUE);
    if(!job){
        //highqueue empty
        job=await redis.rpop(NORMAL_QUEUE);
    }
    if(!job){
        //normal queue also empty
        job=await redis.rpop(LOW_QUEUE);
    }
    return job;
};

async function worker(){
    const workerId= Math.floor(Math.random()*1000);
    console.log(`Priority Worker ${workerId} started...`);
    while(true){
        const job=await getPriorityJob();
        if(!job){
            console.log("No jobs in any queue, waiting...");
            await new Promise(r => setTimeout(r,2000));//poll redis every 2 seconds
            continue;
        }
        console.log(`Worker ${workerId} processing job ${job.id}`);//job exists
        await redis.hset(`job:${job.id}`,{
            status:"processing"
        });

        try{
            //simulate work
            await new Promise(r=>setTimeout(r,2000));
            const success=Math.random() >0.5;
            if(!success){
                throw new Error("Job failed");
            }
            console.log(`Worker ${workerId} completed job ${job.id}`);
            await redis.hset(`Job:${job.id}`,{
                stauts:"completed"
            });

        }
        catch(err){
            console.log(`Worker ${workerId} failed job ${job.id}`);

            job.retries++;

            if(job.retries <= job.maxRetries){
                console.log(`Retrying job ${job.id} (${job.retries}/${job.maxRetries})`);

                await redis.hset(`job:${job.id}`,{
                    status:"retrying",
                    retries: job.retries
                });

                await addJob(job);//push back to normal queue
            }
            else{
                console.log(`Retrying job ${job.id} (${job.retries}/${job.maxRetries})`);

                await redis.hset(`job:${job.id}`,{
                    status:"retrying",
                    retries: job.retries
                });
                await addFailedJobs(job);//move to DLQ
            }
        }
    }
}
worker();