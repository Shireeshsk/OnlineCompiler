const { exec } = require("child_process");

// Helper to clean file paths and filenames from Python error messages
function cleanErrorMsg(msg) {
  if (!msg) return "";

  // This regex matches lines like:
  // File "C:\path\to\file.py", line 10, in <module>
  // and removes the entire 'File "..."' part including the filename and quotes,
  // so only "line 10, in <module>" remains.
  // We remove the 'File "..."' part with the preceding spaces/newline.
  return msg.replace(/^\s*File\s+"[^"]+",\s*/gm, "");
}

const executePy = (filepath) => {
  return new Promise((resolve, reject) => {
    exec(
      `python "${filepath}"`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          // Reject only the cleaned stderr error message, without file info
          return reject(cleanErrorMsg(stderr));
        }
        resolve(stdout);
      }
    );
  });
};

module.exports = executePy;
