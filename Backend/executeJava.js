const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = (filepath) => {
  const filename = path.basename(filepath);
  const classNameMatch = filename.match(/^([a-zA-Z_]\w*)\.java$/);
  if (!classNameMatch) return Promise.reject(new Error("Invalid Java filename. Expected format: <ClassName>.java"));

  const className = classNameMatch[1];
  const compileCmd = `javac "${filepath}" -d "${outputPath}"`;
  const runCmd = `java -cp "${outputPath}" ${className}`;

  return new Promise((resolve, reject) => {
    exec(compileCmd, (compileError, compileStdout, compileStderr) => {
      compileError && reject({ error: compileError, stderr: compileStderr });
      compileStderr && console.warn("Compilation warnings:", compileStderr);

      exec(runCmd, (runError, runStdout, runStderr) => {
        runError && reject({ error: runError, stderr: runStderr });
        runStderr && console.warn("Runtime warnings/errors:", runStderr);

        resolve(runStdout);
      });
    });
  });
};

module.exports = executeJava;
