import { addJob, saveJob } from "./queue.js";

// producer represents API server => POST /send-email

async function createJobs(){

    console.log("Creating job...");

    const job={
        id: Date.now(),
        type: "send-email",
        payload:{
            email:"user@example.com"
        },
        retries:0,
        maxRetries:3
    };
    await saveJob(job);//store job status
    await addJob(job);

    console.log("Job successfully sent to queue");
}

createJobs();