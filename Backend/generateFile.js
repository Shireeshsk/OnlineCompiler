const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const dirCodes = path.join(__dirname, "codes");

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

/**
 * Extract the Java class/interface/enum name from the source code.
 * Checks public declarations first, then any declaration if no public found.
 * Returns the first found name or null if none.
 */
function extractJavaFileName(javaCode) {
    const code = javaCode.trim();

    const publicPatterns = [
        /public\s+class\s+(\w+)/,
        /public\s+interface\s+(\w+)/,
        /public\s+enum\s+(\w+)/,
    ];

    for (const pattern of publicPatterns) {
        const match = code.match(pattern);
        if (match) return match[1];
    }

    const generalPatterns = [
        /class\s+(\w+)/,
        /interface\s+(\w+)/,
        /enum\s+(\w+)/,
    ];

    for (const pattern of generalPatterns) {
        const match = code.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Generates a file from given code and language format.
 * For Java, saves file as <ClassName>.java or fallback UUID.java
 * Returns full absolute filepath.
 */
const generateFile = async (format, code) => {
    let className = null;
    if (format.toLowerCase() === "java") {
        className = extractJavaFileName(code);
    }

    const filename = className ? `${className}.${format}` : `${uuid()}.${format}`;
    const filepath = path.join(dirCodes, filename);

    await fs.promises.writeFile(filepath, code);
    return filepath;
};

module.exports = generateFile;
