import { useState, useEffect } from "react";
import axios from "axios";
import stubs from "./Stubs";
import moment from "moment";
import "./App.css";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia, solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobid, setJobid] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  // Theme state: "light" or "dark"
  const [theme, setTheme] = useState("light");

  // Load stub code on language change
  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Mapping language keys to CodeMirror language extensions
  const languageExtensions = {
    cpp: cpp(),
    java: java(),
    py: python(),
  };

  // Mapping language keys to Prism syntax highlighter languages
  const prismLanguageMap = {
    cpp: "cpp",
    java: "java",
    py: "python",
  };

  // Render job timing details
  const renderTimeDetails = () => {
    if (!jobDetails) return "";

    let { SubmittedAt, StartedAt, CompletedAt } = jobDetails;
    let result = "";

    SubmittedAt = moment(SubmittedAt).toString();
    result += `Job Submitted At: ${SubmittedAt}`;
    result += "\n";

    if (!StartedAt || !CompletedAt) return result;

    const start = moment(StartedAt);
    const end = moment(CompletedAt);
    const diff = end.diff(start, "seconds", true);

    result += `Execution Time: ${diff.toFixed(3)}s`;

    return result;
  };

  // Submit code to backend and poll status/output
  async function handleSubmit() {
    const payload = {
      language: language,
      code: code,
    };

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
              return;
            }
            setOutput(jobOutput);
            clearInterval(intervalId);
          } else {
            setStatus("Error: please retry!");
            setOutput(error);
            clearInterval(intervalId);
          }
        } catch (err) {
          setStatus("Error fetching job status");
          setOutput("Error occurred while getting job status.");
          clearInterval(intervalId);
        }
      }, 1000);
    } catch ({ response }) {
      if (response) {
        setOutput(response.data.stderr || "Error: Unknown server error");
      } else {
        setOutput("Error in connecting to server!");
      }
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

      {/* CodeMirror editor replacing textarea */}
      <CodeMirror
        value={code}
        height="350px"
        extensions={[languageExtensions[language]]}
        onChange={setCode}
        theme={theme === "light" ? "light" : "dark"}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          syntaxHighlighting: true,
          indentOnInput: true,
          autocompletion: false,
          bracketMatching: true,
          closeBrackets: true,
          defaultKeymap: true,
        }}
      />

      <br />
      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>

      <p>Status: {status}</p>
      <p>{jobid && `JobID : ${jobid}`}</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{renderTimeDetails()}</pre>

      {/* Output section with syntax highlighting */}
      <div className="output-window" aria-live="polite">
        <SyntaxHighlighter
          language={prismLanguageMap[language]}
          style={theme === "light" ? solarizedlight : okaidia}
          wrapLines={true}
          showLineNumbers={false}
          customStyle={{ margin: 0, padding: "12px 18px", borderRadius: "8px" }}
        >
          {output}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
