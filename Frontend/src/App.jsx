import { useState } from "react"
import axios from 'axios'
export default function App() {
  const [code,setCode] = useState('')
  const [output,setOutput] = useState('')
  const [language,setLanguage] = useState('')
  const [status,setStatus] = useState('')
  const [jobid,setJobid] = useState('')
  async function handleSubmit(){
    const payload = {
      language:language,
      code:code
    }
    try{
      // setJobid('')
      setStatus('')
      setOutput('')
      const {data} = await axios.post("http://localhost:5000/run",payload)
      console.log(data)
      setOutput(data.jobid)
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
            if(jobStatus==='Pending')return
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
        <select value={language} onChange={(e)=>setLanguage(e.target.value)}>
          <option value="cpp">Cpp</option>
          <option value="java">Java</option>
          <option value="py">Python</option>
        </select>
      </div>
      <textarea rows='20' cols='75' onChange={(e)=>setCode(e.target.value)}></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>JobID : {jobid}</p>
      <p>{output}</p>
    </div>
  )
}
