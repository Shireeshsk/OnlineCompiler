const Queue = require('bull')
const jobQueue = new Queue('job-queue')
const Job = require('./Models/Job.js')
const NUM_WORKERS = 5

jobQueue.process(NUM_WORKERS,async (data)=>{
    console.log(data)
})
const addJobToQueue = async (jobid)=>{
    await jobQueue.add(jobid)
    jobQueue.getJobCounts().then(counts => {
        console.log('Job counts:', counts);
    });
}
module.exports = addJobToQueue