const https = require("https");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function run() {
  const css1 = await fetchUrl("https://www.spotbay.in/_next/static/css/63897a5bf9456642.css");
  const css2 = await fetchUrl("https://www.spotbay.in/_next/static/css/026d059c552bd690.css");
  const allCss = css1 + "\n" + css2;

  const fontFaces = allCss.match(/@font-face\s*\{[^}]+\}/gi) || [];
  console.log("Font Faces Count:", fontFaces.length);
  fontFaces.forEach((f, i) => console.log(`Font-Face ${i}:`, f));

  const fontFamilies = allCss.match(/font-family:[^;]+/gi) || [];
  console.log("Unique Font Families in CSS:", [...new Set(fontFamilies)]);
}

run();
