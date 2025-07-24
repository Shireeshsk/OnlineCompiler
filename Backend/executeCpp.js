const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const isWindows = process.platform === "win32";

const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.exe`); // use .exe on Windows for clarity

  return new Promise((resolve, reject) => {
    // Compile command
    const compileCmd = `g++ "${filepath}" -o "${outPath}"`;

    // Run command depends on OS
    const runCmd = isWindows
      ? `"${outPath}"`
      : `cd "${outputPath}" && ./${jobId}.out`;

    // On Windows, cd && run in one command might be tricky, so run directly by path
    // On Unix, change directory and run works as is

    exec(
      `${compileCmd} && ${runCmd}`,
      (error, stdout, stderr) => {
        if (error) return reject({ error, stderr });
        if (stderr) return reject(stderr);
        resolve(stdout);
      }
    );
  });
};

module.exports = executeCpp;
