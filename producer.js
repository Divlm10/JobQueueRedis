import { addJob, saveJob, addDelayedJob,addPriorityJob } from "./queue.js";

// producer represents API server => POST /send-email

async function createJobs(){

    // console.log("Creating job...");

    // const job={
    //     id: Date.now(),
    //     type: "send-email",
    //     payload:{
    //         email:"user@example.com"
    //     },
    //     retries:0,
    //     maxRetries:3
    // };
    // await saveJob(job);//store job status
    // await addDelayedJob(job,10000);//10 seconds delay
    // // await addJob(job);

    //PRIORITY JOBs
    await addPriorityJob({
        id:Date.now(),
        type:"A",
        retries:0,
        maxRetries:3
    },"low");

    await addPriorityJob({
        id:Date.now() + 1,
        type:"B",
        retries:0,
        maxRetries:3
    },"normal");

    await addPriorityJob({
        id: Date.now()+2,
        type:"C",
        retries:0,
        maxRetries:3
    },"high");

    console.log("Job successfully sent to queue");
}

createJobs();