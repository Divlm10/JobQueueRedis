import {getJob,addJob} from "./queue.js";

async function worker(){
    console.log("Worker started..");

    while(true){
        const job= await getJob();//rpop

        if(!job){
            console.log("Queue empty,waiting...");
            await new Promise(r=>setTimeout(r,2000));//poll for 2 seconds when empty
            continue;
        }
        //jobs exist
        console.log("Processing job:", job.id);

        try{
            //simulate work
            await new Promise(r=>setTimeout(r,2000));
            //simulate random failure
            const success=Math.random() > 0.5;//half fail
            if(!success){
                throw new Error("Job failed");
            }
            //success
            console.log("Job completed:",job.id);
        }
        catch(err){
            console.log("Job failed:",job.id);
            
            job.retries++;//inc

            if(job.retries <= job.maxRetries){
                //within limit=>retry
                console.log(`Retrying Job ${job.id} (${job.retries}/${job.maxRetries})`);
                await addJob(job);
            }
            else{//exceeded
                console.log(`Job ${job.id} permanently failed`);
            }
        }
    }
}

worker();