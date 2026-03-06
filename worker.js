// Worker represents a background process.
import { getJob } from "./queue.js";
import { getJobBlocking } from "./queue.js";

async function worker(){
    console.log("Worker started...");

    while(true){//worker never stops
        // brute with polling
        const job=await getJob();//rpop from list

        if(!job){//no job in queue
            console.log("Queue empty,waiting...");
            await new Promise(r=> setTimeout(r,2000));//poll redis every 2 seconds
            continue;
        }
        //using blocking job
        // console.log("Waiting for job..")
        // const job=await getJobBlocking();//brpop from list


        console.log("Processing job:",job);//else job in queue
        //simulate work
        await new Promise(r=>setTimeout(r,2000));
        console.log("Job completed:",job.id);
    }
}

worker();