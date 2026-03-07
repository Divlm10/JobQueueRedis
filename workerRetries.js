import { redis } from "./redisClient.js";
import {getJob,addJob, addFailedJobs} from "./queue.js";

async function worker(){
    console.log("Worker started..");

    while(true){
        const job= await getJob();//rpop

        const workerId=Math.floor(Math.random()*1000);

        if(!job){
            console.log("Queue empty,waiting...");
            await new Promise(r=>setTimeout(r,2000));//poll for 2 seconds when empty
            continue;
        }
        //jobs exist
        console.log(`Worker ${workerId} processing job ${job.id}`);
        await redis.hset(`job:${job.id}`,{
            status:"processing"
        });

        try{
            //simulate work
            await new Promise(r=>setTimeout(r,2000));
            //simulate random failure
            const success=Math.random() > 0.5;//half fail
            if(!success){
                throw new Error("Job failed");
            }
            //success
            console.log(`Worker ${workerId} completed job ${job.id}`);
            await redis.hset(`job:${job.id}`,{
                status:"completed"
            });
        }
        catch(err){
            console.log(`Worker ${workerId} failed job ${job.id}`);
            
            job.retries++;//inc

            if(job.retries <= job.maxRetries){
                //within limit=>retry
                console.log(`Retrying Job ${job.id} (${job.retries}/${job.maxRetries})`);
                await redis.hset(`job:${job.id}`,{
                    status: "retrying",
                    retries: job.retries
                });

                await addJob(job);//lpush curr job in list
            }
            else{//exceeded
                // console.log(`Job ${job.id} permanently failed`);
                //handle Failed jobs
                console.log(`Job ${job.id} permanently Failed`);
                await redis.hset(`job:${job.id}`,{
                    status: "failed"
                });
                await addFailedJobs(job);//move to dlq
            }
        }
    }
}

worker();