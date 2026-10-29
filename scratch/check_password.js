const bcrypt = require('bcryptjs');
const hash = "$2b$10$VUtNb6R01QPylMxsBjgUxuRtKBkMJ.OWTzgSWsDqOPPX8OxfTRcCO";

const candidates = [
  "admin",
  "Admin@123",
  "Admin123",
  "Admin123!",
  "admin123",
  "CustomerPilot@2026",
  "CustomerPilot123",
  "password",
  "Password@123",
  "123456",
  "12345678",
  "superadmin",
  "SuperAdmin@123",
  "cpilot2026",
  "cpilot_superadmin_2026"
];

for (const p of candidates) {
  if (bcrypt.compareSync(p, hash)) {
    console.log("MATCH FOUND:", p);
    process.exit(0);
  }
}
console.log("No match among standard candidates.");
