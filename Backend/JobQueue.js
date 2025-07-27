const Queue = require('bull')
const executeJava = require('./executeJava.js')
const executeCpp = require('./executeCpp.js')
const executePy = require('./executePy.js')
const jobQueue = new Queue('jobQueue')
const NUM_WORKERS = 5
const Job = require('./Models/Job');
jobQueue.process(NUM_WORKERS,async ({data})=>{
    console.log(data)
    const {id:jobid} = data
    const job = await Job.findById(jobid)
    if(job===undefined){
        throw Error('job not found')
    }
    console.log('job fetched',job)
    try{
        let output
        job["StartedAt"] = new Date()
        if(job.language==='py'){
            output = await executePy(job.filepath)
        }
        else if(job.language==='java'){
            output = await executeJava(job.filepath)
        }
        else if(job.language==='cpp'){
            output = await executeCpp(job.filepath)
        }
        else{
            return res.status(401).json({message:"Unknown Language"})
        }
        job["CompletedAt"] = new Date()
        job["status"] = "Success"
        job["output"] = output
        await job.save()
    }
    catch(err){
        job["CompletedAt"] = new Date()
        job["status"] = "Error"
        job["output"] = JSON.stringify(err)
        await job.save()
    }
    return true
})
const addJobToQueue = async (jobid)=>{
    await jobQueue.add({id:jobid})
}
jobQueue.on("failed",(job,err)=>{
    console.log(job.data.id,"failed ",err.message)
})
module.exports = addJobToQueue;