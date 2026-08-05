async function testPayloads() {
  const EVOLUTION_API_URL = 'http://200.97.170.53:8080';
  const EVOLUTION_API_KEY = 'Evo_Api_Key_Secure_998877!';
  const instance = 'CP_M919033304707';
  const toPhone = '919033456106';

  const payloads = [
    // Payload 1: standard evolution v1/v2 payload
    {
      name: 'Format 1: textMessage object',
      body: {
        number: toPhone,
        options: { delay: 500, presence: 'composing' },
        textMessage: { text: 'Test Format 1: textMessage' }
      }
    },
    // Payload 2: simple text at top level
    {
      name: 'Format 2: text at top level',
      body: {
        number: toPhone,
        text: 'Test Format 2: top level text'
      }
    },
    // Payload 3: message object with text
    {
      name: 'Format 3: message object',
      body: {
        number: toPhone,
        message: { text: 'Test Format 3: message' }
      }
    }
  ];

  for (const p of payloads) {
    try {
      console.log(`\nTesting ${p.name}...`);
      const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
        body: JSON.stringify(p.body)
      });
      const text = await res.text();
      console.log(`HTTP Status: ${res.status}`);
      console.log(`Response: ${text}`);
    } catch (e: any) {
      console.error(`Error for ${p.name}:`, e.message);
    }
  }
}

testPayloads().catch(console.error);
