const https = require("https");

https.get("https://www.spotbay.in/", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("HTML length:", data.length);

    // Look for font links, next font, google font, etc.
    const googleFonts = data.match(/https:\/\/fonts\.(googleapis|gstatic)\.com[^\s"'\)]+/g) || [];
    console.log("Google Fonts:", googleFonts);

    const cssLinks = data.match(/href="([^"]+\.css[^"]*)"/g) || [];
    console.log("CSS Links:", cssLinks);

    const inlineStyles = data.match(/font-family:[^;}"']+/gi) || [];
    console.log("Font Families in HTML:", inlineStyles);

    // Also search for Next.js font variables like --font-geist, --font-inter, etc.
    const fontVars = data.match(/--font-[a-zA-Z0-9_-]+/g) || [];
    console.log("Font CSS Variables:", [...new Set(fontVars)]);
  });
}).on("error", (err) => console.error(err));
