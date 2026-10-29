async function test() {
  const res = await fetch("http://localhost:3000/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId: "cmso8yolu0001w01wd6d2o4bo" }),
  });
  console.log("STATUS:", res.status);
  const data = await res.json().catch(async () => await res.text());
  console.log("RESPONSE:", JSON.stringify(data, null, 2));
}

test();
