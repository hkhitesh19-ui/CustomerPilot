import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = 'https://customerpilot.in/api/pricing/plans'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        plans = data.get('data', {}).get('plans', [])
        print(f"Total active plans in live VPS: {len(plans)}\n")
        print("--- Verified Live Plans on Hostinger VPS ---")
        for p in plans:
            pk = p.get('planKey')
            if any(k in pk for k in ['gear', 'review', 'loyalty', 'card', 'autoreply', 'enterprise']):
                print(f"[{pk}] {p.get('name')} -> ₹{p.get('price')} ({p.get('days')} days)")
except Exception as e:
    print("Error querying API:", e)
