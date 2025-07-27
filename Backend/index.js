const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const generateFile = require('./generateFile.js')
const Job = require('./Models/Job.js')
const addJobToQueue =require('./JobQueue.js')
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
mongoose.connect("mongodb://localhost:27017/CodeCompiler")
.then(()=>    console.log("Successfully connected to MongoDB Database!"))
.catch((err)=>console.log("DataBase not connected : ",err))
app.get('/status',async (req,res)=>{
    const jobid = req.query.id
    console.log("status requested ",jobid)
    if(jobid==undefined){
        return res.status(400).json({success:false,error:"missing id query param"})
    }
    try{
        const job = await Job.findById(jobid)
        if(job==undefined){
            return res.status(404).json({success:false,error:"invalid job id"})
        }
        return res.status(200).json({success:true,job});
    }
    catch(err){
        return res.status(400).json({success:false,error:JSON.stringify(err)})
    }
})
app.post('/run',async (req,res)=>{
    const {language="java",code} = req.body
    if(code===undefined){
        return res.status(400).json({message:"empty code body"})
    }
    let job
    try{
        const filepath = await generateFile(language,code)
        job = await new Job({language,filepath}).save()
        console.log(job)
        const jobid = job["_id"]
        addJobToQueue(job._id)
        res.status(201).json({success:"true",jobid})
    }
    catch(err){
        return res.status(500).json({success:false,err:JSON.stringify(err)})
    }
})
app.listen(5000,()=>{
    console.log(`listening on port 5000`)
})