const mongoose = require('mongoose')
const JobSchema = mongoose.Schema({
    language:{
        type:String,
        required:true,
        enum:["py","java","cpp"]
    },
    filepath:{
        type:String,
        required:true
    },
    SubmittedAt:{
        type:Date,
        default:Date.now
    },
    StartedAt:{
        type:Date,
    },
    CompletedAt:{
        type:Date
    },
    output:{
        type:String
    },
    status:{
        type:String,
        default:"Pending",
        enum:["Pending","Success","Error"]
    }
})
const Job = new mongoose.model('Job',JobSchema)
module.exports = Job;