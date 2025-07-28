const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const isWindows = process.platform === "win32";

// Helper function to clean file paths from error output
function cleanErrorMsg(msg) {
  if (!msg) return "";

  // Regex to match Windows or Unix-like full file paths ending with .cpp or .h or .hpp (common C++ files)
  // It matches patterns like: D:\folder\file.cpp: or /home/user/file.cpp:
  const pathRegex = /([A-Z]:)?[\\/][\w\\/. -]*\b([\w\d_-]+\.(cpp|c|h|hpp))\b:/gi;

  // Replace full path with just filename and the following colon
  return msg.replace(pathRegex, (_, drive, filename) => filename + ":");
}

const executeCpp = (filepath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = isWindows
    ? path.join(outputPath, `${jobId}.exe`)
    : path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const compileCmd = `g++ "${filepath}" -o "${outPath}"`;
    const runCmd = isWindows
      ? `"${outPath}"`
      : `cd "${outputPath}" && ./${jobId}.out`;

    exec(`${compileCmd} && ${runCmd}`, (error, stdout, stderr) => {
      if (error || stderr) {
        // Prefer error from stderr or error object, clean from file paths
        const rawError = stderr || (error && error.message) || "Unknown error";
        return reject(cleanErrorMsg(rawError));
      }

      resolve(stdout);
    });
  });
};

module.exports = executeCpp;