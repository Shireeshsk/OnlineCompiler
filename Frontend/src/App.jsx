import { useState, useEffect } from "react";
import axios from "axios";
import stubs from "./Stubs";
import moment from "moment";
import "./App.css";
import Code from "./Code";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

import ReactMarkdown from "react-markdown";

export default function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobid, setJobid] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [executing, setExecuting] = useState(false);


  // Theme state: "light" or "dark"
  const [theme, setTheme] = useState("light");

  // Load stub code on language change
  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  // Apply theme class to body on theme change
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Language extensions for CodeMirror
  const languageExtensions = {
    cpp: cpp(),
    java: java(),
    py: python(),
  };

  // Prism language map (not needed for react-markdown but kept for reference)
  const prismLanguageMap = {
    cpp: "cpp",
    java: "java",
    py: "python",
  };

  // Unpack output if it is a JSON-stringified string wrapped in quotes
  // If parse fails, fallback to original output
  const getParsedOutput = () => {
    if (
      typeof output === "string" &&
      output.startsWith('"') &&
      output.endsWith('"')
    ) {
      try {
        return JSON.parse(output);
      } catch {
        return output;
      }
    }
    return output;
  };

  // Render job timing details
  const renderTimeDetails = () => {
    if (!jobDetails) return "";

    let { SubmittedAt, StartedAt, CompletedAt } = jobDetails;
    let result = "";

    SubmittedAt = moment(SubmittedAt).toString();
    result += `Job Submitted At: ${SubmittedAt}\n`;

    if (!StartedAt || !CompletedAt) return result;

    const start = moment(StartedAt);
    const end = moment(CompletedAt);
    const diff = end.diff(start, "seconds", true);

    result += `Execution Time: ${diff.toFixed(3)}s`;
    return result;
  };

  // Handle submit code
 async function handleSubmit() {
    const payload = { language, code };

    setExecuting(true); // set before starting
    
    try {
      setJobid("");
      setStatus("");
      setOutput("");
      setJobDetails(null);

      const { data } = await axios.post("http://localhost:5000/run", payload);

      setJobid(data.jobid);
      setStatus("Pending");
      setOutput("Waiting for job to complete...");

      let intervalId = setInterval(async () => {
        try {
          const { data: dataRes } = await axios.get("http://localhost:5000/status", {
            params: { id: data.jobid },
          });

          const { success, job, error } = dataRes;

          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            setJobDetails(job);

            if (jobStatus === "Pending") {
              setOutput("Waiting for job to complete...");
              return; // keep waiting, don't clear executing
            }
            setOutput(jobOutput);
            clearInterval(intervalId);
            setExecuting(false); // stop executing when job done
          } else {
            setStatus("Error: please retry!");

            let errorMsg = "";
            if (typeof error === "string") {
              errorMsg = error;
            } else if (error && typeof error === "object") {
              if (error.stderr) errorMsg = error.stderr;
              else if (error.message) errorMsg = error.message;
              else errorMsg = JSON.stringify(error);
            } else {
              errorMsg = "Unknown error";
            }

            setOutput(errorMsg);
            clearInterval(intervalId);
            setExecuting(false); // stop executing on error
          }
        } catch (err) {
          setStatus("Error fetching job status");
          setOutput("Error occurred while getting job status.");
          clearInterval(intervalId);
          setExecuting(false); // stop executing on error
        }
      }, 1000);
    } catch ({ response }) {
      if (response) {
        setOutput(response.data.stderr || "Error: Unknown server error");
      } else {
        setOutput("Error in connecting to server!");
      }
      setExecuting(false); // stop executing if initial submit fails
    }
  }


  return (
    <div className={`app-container ${theme}`}>
      <div className="header">
        <h1>Online Compiler</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <div className="controls">
        <label htmlFor="language-select">
          Language:&nbsp;
          <select
            id="language-select"
            value={language}
            onChange={(e) => {
              if (
                window.confirm(
                  "WARNING: Switching the language will remove your current code. Proceed?"
                )
              ) {
                setLanguage(e.target.value);
              }
            }}
          >
            <option value="cpp">Cpp</option>
            <option value="java">Java</option>
            <option value="py">Python</option>
          </select>
        </label>
      </div>

      {language == "cpp" && (
        <Code code={code} setCode={setCode} theme={theme} language={language} />
      )}
      {language == "py" && (
        <Code code={code} setCode={setCode} theme={theme} language={language} />
      )}
      {language == "java" && (
        <Code code={code} setCode={setCode} theme={theme} language={language} />
      )}

      <br />
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={executing}
      >
        Submit
      </button>

      <p>Status: {status}</p>
      <p>{jobid && `JobID : ${jobid}`}</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{renderTimeDetails()}</pre>

      {/* Output rendered as Markdown */}
      <div
        className="output-window"
        aria-live="polite"
        style={{ whiteSpace: "normal" }}
      >
        <ReactMarkdown
        // rehypePlugins={[rehypeHighlight]}  // Uncomment if you want code block syntax highlight inside markdown
        >
          {getParsedOutput()}
        </ReactMarkdown>
      </div>
    </div>
  );
}
