const { sanitizeDestinationUrl, detectMultipleUrls } = require("../src/lib/url-sanitizer");

console.log("=== Running QR URL Sanitization & Concatenation Guard Assertions ===");

// 1. Assert detection of multiple URLs
console.log("\n[Assertion 1: detectMultipleUrls]");
const multi1 = "https://chat.whatsapp.com/HDIqDkVYITQGomcU8Nbz65https://chat.whatsapp.com/KQVLHbVIFru9AGI39oPYxT?s=cl&p=a&iam=2";
if (!detectMultipleUrls(multi1)) {
  console.error("FAILED: detectMultipleUrls did not flag multi-link string");
  process.exit(1);
}
console.log("✅ detectMultipleUrls successfully identified concatenated links");

// 2. Assert auto-clean of concatenated URL extracts latest intent
console.log("\n[Assertion 2: sanitizeDestinationUrl extracts latest link from concatenation]");
const resMulti = sanitizeDestinationUrl(multi1, { requireWhatsApp: true });
if (!resMulti.isValid || resMulti.cleanUrl !== "https://chat.whatsapp.com/KQVLHbVIFru9AGI39oPYxT") {
  console.error("FAILED: Did not extract clean Temp2 URL. Got:", resMulti);
  process.exit(1);
}
if (!resMulti.hadMultipleUrls) {
  console.error("FAILED: hadMultipleUrls flag was not set to true");
  process.exit(1);
}
console.log("✅ Successfully auto-cleaned concatenated URL to clean canonical WhatsApp link:", resMulti.cleanUrl);

// 3. Assert single clean link passes unchanged
console.log("\n[Assertion 3: Clean single link passes unchanged]");
const cleanLink = "https://chat.whatsapp.com/KQVLHbVIFru9AGI39oPYxT";
const resClean = sanitizeDestinationUrl(cleanLink, { requireWhatsApp: true });
if (!resClean.isValid || resClean.cleanUrl !== cleanLink) {
  console.error("FAILED: Clean link mutated unexpectedly:", resClean);
  process.exit(1);
}
console.log("✅ Clean single link accepted perfectly:", resClean.cleanUrl);

// 4. Assert non-WhatsApp link rejected when requireWhatsApp=true
console.log("\n[Assertion 4: Non-WhatsApp link rejected in WhatsApp mode]");
const nonWa = "https://example.com/not-whatsapp";
const resNonWa = sanitizeDestinationUrl(nonWa, { requireWhatsApp: true });
if (resNonWa.isValid) {
  console.error("FAILED: Non-WhatsApp link was accepted in requireWhatsApp mode");
  process.exit(1);
}
console.log("✅ Non-WhatsApp link properly rejected with error:", resNonWa.error);

// 5. Assert arbitrary invalid domain rejected in general mode
console.log("\n[Assertion 5: Invalid junk rejected in general mode]");
const junk = "https://notadomain";
const resJunk = sanitizeDestinationUrl(junk);
if (resJunk.isValid) {
  console.error("FAILED: Junk domain without dot was accepted");
  process.exit(1);
}
console.log("✅ Invalid junk string properly rejected with error:", resJunk.error);

// 6. Assert general valid URL accepted
console.log("\n[Assertion 6: General valid website URL accepted]");
const generalUrl = "https://customerpilot.in/menu.pdf";
const resGeneral = sanitizeDestinationUrl(generalUrl);
if (!resGeneral.isValid || resGeneral.cleanUrl !== generalUrl) {
  console.error("FAILED: General valid URL was not accepted:", resGeneral);
  process.exit(1);
}
console.log("✅ General valid URL accepted:", resGeneral.cleanUrl);

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("🎉 ALL 6 SANITIZATION & CONCATENATION GUARDS PASSED WITH 100% SUCCESS!");
console.log("═══════════════════════════════════════════════════════════════");
