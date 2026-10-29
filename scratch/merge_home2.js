const fs = require("fs");
const path = require("path");

const home2Path = path.join(__dirname, "../src/app/home2/page.tsx");
const mainPagePath = path.join(__dirname, "../src/app/page.tsx");

const home2Content = fs.readFileSync(home2Path, "utf8");
fs.writeFileSync(mainPagePath, home2Content, "utf8");
console.log("Successfully merged home2 into main src/app/page.tsx");
