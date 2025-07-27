import { useState , useEffect } from "react"
import axios from 'axios'
import stubs from "./Stubs"
import moment from 'moment'
export default function App() {
  const [code,setCode] = useState('')
  const [output,setOutput] = useState('')
  const [language,setLanguage] = useState('cpp')
  const [status,setStatus] = useState('')
  const [jobid,setJobid] = useState('')
  const [jobDetails,setJobDetails] = useState(null)

  useEffect(()=>{
    setCode(stubs[language])
  },[language])

  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }
    let { SubmittedAt, StartedAt, CompletedAt } = jobDetails;
    let result = "";
    SubmittedAt = moment(SubmittedAt).toString();
    result += `Job Submitted At: ${SubmittedAt}  `;
    result += '\n'
    if (!StartedAt || !CompletedAt) return result;
    const start = moment(StartedAt);
    const end = moment(CompletedAt);
    const diff = end.diff(start, "seconds", true);
    result += `Execution Time: ${diff}s`;
    return result;
  };

  async function handleSubmit(){
    const payload = {
      language:language,
      code:code
    }
    try{
      setJobid('')
      setStatus('')
      setOutput('')
      setJobDetails(null)
      const {data} = await axios.post("http://localhost:5000/run",payload)
      console.log(data)
      setOutput(data.jobid)
      setJobid(data.jobid);     
      setStatus('Pending');       
      setOutput('Waiting for job to complete...');
      let intervalId
      intervalId = setInterval(async()=>{
          const {data:dataRes} = await axios.get("http://localhost:5000/status",{
            params:{id:data.jobid}
          })
          const {success,job,error}=dataRes
          console.log(dataRes)
          if(success){
            const {status:jobStatus,output:jobOutput} = job;
            setStatus(jobStatus)
            setJobDetails(job)
            if (jobStatus === 'Pending') {
              setOutput('Waiting for job to complete...');
              return;
            }
            setOutput(jobOutput)
            clearInterval(intervalId)
          }else{
            setStatus('Error: please retry!')
            console.error(error)
            setOutput(error)
            clearInterval(intervalId)
          }
          console.log(dataRes)
      },1000)
    }
    catch({response}){
      if(response){
        setOutput(response.data.stderr)
      }
      else{
        setOutput("Error in connecting to server!")
      }
    }
  }
  return (
    <div>
      <h1>Online Java Compiler</h1>
      <div>
        <label >Language : </label>
        <select value={language} onChange={(e)=>{
                                                  let response = window.confirm("WARNING: Switching the language , will remove your current code ")
                                                  setLanguage(e.target.value)}}>
          <option value="cpp">Cpp</option>
          <option value="java">Java</option>
          <option value="py">Python</option>
        </select>
      </div>
      <textarea rows='20' cols='75' value={code} onChange={(e)=>setCode(e.target.value)}></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobid && `JobID : ${jobid}`}</p>
      <p>{renderTimeDetails()}</p>
      <p>{output}</p>
    </div>
  )
}
