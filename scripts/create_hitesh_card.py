import sqlite3
import json
import os

try:
    import paramiko
except ImportError:
    paramiko = None

card_data = {
    "merchantId": "customerpilot-hq",
    "slug": "hitesh",
    "displayName": "Hitesh",
    "subCategories": "Software Developer • CustomerPilot.in Core Architecture • Full-Stack Engineer",
    "logoUrl": "/cplogo_horizontal.png",
    "coverUrl": None,
    "locationShort": "Vadodara",
    "locationState": "Gujarat, India",
    "businessHours": "Monday – Saturday: 10:00 AM – 7:00 PM IST",
    "deliveryInfo": "B2B Software Development & SaaS Architect",
    "whatsappNumber": "919033304707",
    "phoneNumber": "919033304707",
    "email": "support@customerpilot.in",
    "websiteUrl": "https://customerpilot.in",
    "instagramUrl": "https://www.instagram.com/customerpilot.in/",
    "facebookUrl": "https://www.facebook.com/customerpilot.in/",
    "youtubeUrl": None,
    "googleMapsUrl": "https://maps.google.com/?q=CustomerPilot+Vadodara",
    "googleRating": 5.0,
    "googleReviewsCnt": 690,
    "isActive": 1,
    "theme": json.dumps({
        "style": "emerald_executive",
        "designation": "Software Developer",
        "company": "CustomerPilot.in",
        "trialEndsAt": "2099-12-31T23:59:59.000Z"
    }),
    "orderingLinks": json.dumps([
        {
            "platform": "whatsapp",
            "label": "WhatsApp Chat",
            "sublabel": "Direct Message",
            "url": "https://wa.me/919033304707?text=Hi%20Hitesh%2C%20I%20want%20to%20discuss%20CustomerPilot%20software.",
            "color": "#16a34a"
        },
        {
            "platform": "website",
            "label": "CustomerPilot.in",
            "sublabel": "Official Website",
            "url": "https://customerpilot.in",
            "color": "#0ea5e9"
        },
        {
            "platform": "catalog",
            "label": "10 Supercharged Services",
            "sublabel": "Explore Features",
            "url": "https://customerpilot.in/services",
            "color": "#8b5cf6"
        },
        {
            "platform": "directions",
            "label": "Merchant Support Desk",
            "sublabel": "Contact Desk",
            "url": "https://customerpilot.in/contact",
            "color": "#f59e0b"
        }
    ])
}

def update_db(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping {db_path}, not found")
        return
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 1. Check if card with slug 'hitesh' exists
    existing = c.execute("SELECT id FROM DigitalBusinessCard WHERE slug='hitesh'").fetchone()
    now_ms = int(os.environ.get("TIMESTAMP_MS", "1795115000000"))
    
    if existing:
        card_id = existing[0]
        c.execute("""
            UPDATE DigitalBusinessCard SET
                displayName=?, subCategories=?, logoUrl=?, coverUrl=?, locationShort=?, locationState=?,
                businessHours=?, deliveryInfo=?, whatsappNumber=?, phoneNumber=?, email=?, websiteUrl=?,
                instagramUrl=?, facebookUrl=?, googleMapsUrl=?, googleRating=?, googleReviewsCnt=?,
                isActive=?, theme=?, orderingLinks=?, updatedAt=?
            WHERE id=?
        """, (
            card_data["displayName"], card_data["subCategories"], card_data["logoUrl"], card_data["coverUrl"],
            card_data["locationShort"], card_data["locationState"], card_data["businessHours"], card_data["deliveryInfo"],
            card_data["whatsappNumber"], card_data["phoneNumber"], card_data["email"], card_data["websiteUrl"],
            card_data["instagramUrl"], card_data["facebookUrl"], card_data["googleMapsUrl"], card_data["googleRating"],
            card_data["googleReviewsCnt"], card_data["isActive"], card_data["theme"], card_data["orderingLinks"],
            now_ms, card_id
        ))
        print(f"[{db_path}] Updated existing card 'hitesh' (ID: {card_id})")
    else:
        new_id = f"card_hitesh_dev_{now_ms}"
        c.execute("""
            INSERT INTO DigitalBusinessCard (
                id, merchantId, slug, displayName, subCategories, logoUrl, coverUrl, locationShort, locationState,
                businessHours, deliveryInfo, whatsappNumber, phoneNumber, email, websiteUrl, instagramUrl, facebookUrl,
                googleMapsUrl, googleRating, googleReviewsCnt, isActive, theme, orderingLinks, viewsCount, contactSaves, sharesCount,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
        """, (
            new_id, card_data["merchantId"], card_data["slug"], card_data["displayName"], card_data["subCategories"],
            card_data["logoUrl"], card_data["coverUrl"], card_data["locationShort"], card_data["locationState"],
            card_data["businessHours"], card_data["deliveryInfo"], card_data["whatsappNumber"], card_data["phoneNumber"],
            card_data["email"], card_data["websiteUrl"], card_data["instagramUrl"], card_data["facebookUrl"],
            card_data["googleMapsUrl"], card_data["googleRating"], card_data["googleReviewsCnt"], card_data["isActive"],
            card_data["theme"], card_data["orderingLinks"], now_ms, now_ms
        ))
        print(f"[{db_path}] Created brand new card 'hitesh' (ID: {new_id})")

    # Also update 'hitesh-kumar' to have the same developer details
    c.execute("""
        UPDATE DigitalBusinessCard SET
            displayName=?, subCategories=?, logoUrl=?, locationShort=?, locationState=?,
            businessHours=?, deliveryInfo=?, whatsappNumber=?, phoneNumber=?, email=?, websiteUrl=?,
            googleRating=?, googleReviewsCnt=?, isActive=?, theme=?, orderingLinks=?, updatedAt=?
        WHERE slug='hitesh-kumar'
    """, (
        card_data["displayName"], card_data["subCategories"], card_data["logoUrl"],
        card_data["locationShort"], card_data["locationState"], card_data["businessHours"], card_data["deliveryInfo"],
        card_data["whatsappNumber"], card_data["phoneNumber"], card_data["email"], card_data["websiteUrl"],
        card_data["googleRating"], card_data["googleReviewsCnt"], card_data["isActive"],
        card_data["theme"], card_data["orderingLinks"], now_ms
    ))
    print(f"[{db_path}] Also synchronized 'hitesh-kumar'")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    # Local update
    update_db("prisma/dev.db")
    update_db("/var/www/CustomerPilot/prisma/dev.db")

    # VPS update if paramiko is available locally
    if paramiko:
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD") or "Nilsky@202627", timeout=30)
            sftp = ssh.open_sftp()
            with sftp.file('/tmp/create_hitesh_card.py', 'w') as f:
                f.write(open(__file__, 'r').read())
            sftp.close()
            stdin, stdout, stderr = ssh.exec_command("python3 /tmp/create_hitesh_card.py")
            print("VPS Output:")
            print(stdout.read().decode('utf-8', errors='replace'))
            print(stderr.read().decode('utf-8', errors='replace'))
            ssh.close()
        except Exception as e:
            print("VPS error:", e)
