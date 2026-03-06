// Worker represents a background process.
import { getJob } from "./queue.js";

async function worker(){
    console.log("Worker started...");

    while(true){//worker never stops
        const job=await getJob();//rpop from list

        if(!job){//no job in queue
            console.log("Queue empty,waiting...");
            await new Promise(r=> setTimeout(r,3000));//poll redis every 3 seconds
            continue;
        }
        console.log("Processing job:",job);//else job in queue
        //simulate work
        await new Promise(r=>setTimeout(r,2000));
        console.log("Job completed:",job.id);
    }
}

worker();