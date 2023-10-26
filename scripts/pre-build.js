const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const env = args[0] || "dev";

const filePath = path.join(__dirname, "..", "configs", `${env}.urls.ts`);
const destPath = path.join(__dirname, "..", "src", "config", "urls.config.ts");

if (!fs.existsSync(filePath)) {
  console.log("File not found");
  return;
}

// copy file
try {
  fs.copyFileSync(filePath, destPath);
  console.log(`File copied to ${destPath}`);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
