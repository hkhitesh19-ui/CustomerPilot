async function test() {
  try {
    const res = await fetch("http://localhost:3000/dashboard/subscription");
    console.log("STATUS:", res.status);
  } catch (err) {
    console.error("CONNECTION ERROR:", err.message);
  }
}
test();
