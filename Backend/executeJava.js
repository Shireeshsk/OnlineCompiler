const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Helper function to strip file paths from compiler/runtime error messages
function cleanErrorMsg(msg) {
  if (!msg) return "";

  // Regex to match Windows or Unix-like full file paths ending with '.java'
  const pathRegex = /([A-Z]:)?[\\/][\w\\\/. -]*\b([\w\d_-]+\.java)\b/g;

  // Replace full paths with only filenames
  return msg.replace(pathRegex, (_, drive, filename) => filename);
}

const executeJava = (filepath) => {
  const filename = path.basename(filepath);
  const classNameMatch = filename.match(/^([a-zA-Z_]\w*)\.java$/);
  if (!classNameMatch)
    return Promise.reject("Invalid Java filename. Expected format: <ClassName>.java");

  const className = classNameMatch[1];
  const compileCmd = `javac "${filepath}" -d "${outputPath}"`;
  const runCmd = `java -cp "${outputPath}" ${className}`;

  return new Promise((resolve, reject) => {
    exec(compileCmd, (compileError, compileStdout, compileStderr) => {
      if (compileError || compileStderr) {
        const rawMsg = compileStderr || compileError.message || "Compilation error";
        return reject(cleanErrorMsg(rawMsg));
      }

      exec(runCmd, (runError, runStdout, runStderr) => {
        if (runError || runStderr) {
          const rawMsg = runStderr || runError.message || "Runtime error";
          return reject(cleanErrorMsg(rawMsg));
        }

        resolve(runStdout);
      });
    });
  });
};

module.exports = executeJava;
