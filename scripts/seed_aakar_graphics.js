const path = require('path');
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${path.join(__dirname, '../prisma/dev.db')}`;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAakar() {
  console.log("=== SEEDING AAKAR GRAPHICS MERCHANT & DIGITAL BUSINESS CARD ===");

  const email = "sujay.aakar@gmail.com";
  const rawPassword = "Aakar@2026";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const now = new Date();

  // 1. Create or update User
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "user_aakargraphics_01",
        email,
        name: "Sujay Patel",
        password: hashedPassword,
        role: "merchant",
        createdAt: now,
        updatedAt: now
      }
    });
    console.log("Created User:", user.id, user.email);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: "Sujay Patel", password: hashedPassword, updatedAt: now }
    });
    console.log("Updated existing User:", user.id, user.email);
  }

  // 2. Create or update Merchant
  let merchant = await prisma.merchant.findFirst({
    where: { OR: [{ id: "merchant_aakargraphics_01" }, { email }] }
  });

  const merchantData = {
    userId: user.id,
    name: "Aakar Graphics",
    ownerName: "Sujay Patel & Ankita Patel",
    businessType: "printing_and_graphics",
    category: "Digital • Large Format • Offset Print & LED Board",
    city: "Vadodara",
    address: "FF-106, Saraswati Complex, Opp. Manjalpur Atithi Gruh, GIDC Road, Manjalpur, Vadodara - 390 011. Gujarat, India.",
    businessTiming: "Monday – Saturday: 9:30 AM – 8:30 PM (Sunday Closed)",
    whatsappPhone: "919033434750",
    email: email,
    logoUrl: "/uploads/aakar_graphics_logo.jpg",
    coverUrl: "/uploads/aakar_graphics_visiting_card.jpg",
    plan: "GROWTH",
    status: "active",
    onboardingCompleted: true,
    currentStep: 5,
    baselineRating: 4.9,
    baselineReviewCount: 84,
    googleReviewLink: "https://maps.google.com/?q=Aakar+Graphics+Saraswati+Complex+Manjalpur+Vadodara",
    enabledModules: "google_reviews,whatsapp_marketing,digital_card,dynamic_qr,smart_pos",
    showPoweredBy: false,
    ctaEnabled: true,
    updatedAt: now
  };

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        id: "merchant_aakargraphics_01",
        ...merchantData,
        createdAt: now
      }
    });
    console.log("Created Merchant:", merchant.id, merchant.name);
  } else {
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: merchantData
    });
    console.log("Updated Merchant:", merchant.id, merchant.name);
  }

  // 3. Create or update DigitalBusinessCard
  const orderingLinks = JSON.stringify([
    {
      platform: "whatsapp",
      label: "WhatsApp Order / Inquiry",
      sublabel: "Instant Quote & Artwork Share",
      url: "https://wa.me/919033434750?text=Hi%20Aakar%20Graphics%2C%20I%20want%20to%20inquire%20about%20printing%20services.",
      color: "#16a34a"
    },
    {
      platform: "phone",
      label: "Call Sujay Patel",
      sublabel: "+91 90334 34750",
      url: "tel:+919033434750",
      color: "#0284c7"
    },
    {
      platform: "phone",
      label: "Call Ankita Patel",
      sublabel: "+91 98988 80107",
      url: "tel:+919898880107",
      color: "#0ea5e9"
    },
    {
      platform: "website",
      label: "Official Website",
      sublabel: "www.aakargraphics.in",
      url: "https://www.aakargraphics.in",
      color: "#2563eb"
    },
    {
      platform: "email",
      label: "Email Official Inquiry",
      sublabel: "sujay.aakar@gmail.com",
      url: "mailto:sujay.aakar@gmail.com?subject=Printing%20Requirement%20Inquiry%20-%20Aakar%20Graphics",
      color: "#6366f1"
    },
    {
      platform: "catalog",
      label: "Printing Services Portfolio",
      sublabel: "Digital • Offset • Flex • LED 3D Letters",
      url: "https://www.aakargraphics.in",
      color: "#8b5cf6"
    },
    {
      platform: "directions",
      label: "Visit Print Studio (Directions)",
      sublabel: "FF-106 Saraswati Complex, Manjalpur",
      url: "https://maps.google.com/?q=FF-106+Saraswati+Complex+Opp+Manjalpur+Atithi+Gruh+GIDC+Road+Manjalpur+Vadodara",
      color: "#f59e0b"
    }
  ]);

  const themeMeta = JSON.stringify({
    style: "sapphire_blue",
    owners: "Sujay Patel & Ankita Patel",
    secondaryPhone: "+91 98988 80107",
    tagline: "AG Printing Solutions",
    email: email,
    subscribed: true,
    company: "Aakar Graphics",
    designation: "Printing Solutions Specialist"
  });

  const cardData = {
    displayName: "Aakar Graphics",
    subCategories: "Digital • Large Format • Offset Print & LED Board",
    logoUrl: "/uploads/aakar_graphics_logo.jpg",
    coverUrl: "/uploads/aakar_graphics_visiting_card.jpg",
    locationShort: "Manjalpur, Vadodara",
    locationState: "Gujarat, India",
    businessHours: "Mon – Sat: 9:30 AM – 8:30 PM",
    deliveryInfo: "Fast Delivery & Installation Across Gujarat",
    whatsappNumber: "919033434750",
    phoneNumber: "+91 90334 34750",
    email: email,
    websiteUrl: "https://www.aakargraphics.in",
    instagramUrl: "https://www.instagram.com/aakargraphics/",
    facebookUrl: "https://www.facebook.com/aakargraphics/",
    googleMapsUrl: "https://maps.google.com/?q=FF-106+Saraswati+Complex+Opp+Manjalpur+Atithi+Gruh+GIDC+Road+Manjalpur+Vadodara",
    googleRating: 4.9,
    googleReviewsCnt: 84,
    isActive: true,
    theme: themeMeta,
    orderingLinks: orderingLinks,
    updatedAt: now
  };

  let card = await prisma.digitalBusinessCard.findFirst({
    where: { OR: [{ slug: "aakargraphics" }, { merchantId: merchant.id }] }
  });

  if (!card) {
    card = await prisma.digitalBusinessCard.create({
      data: {
        id: "card_aakargraphics_01",
        merchantId: merchant.id,
        slug: "aakargraphics",
        ...cardData,
        createdAt: now
      }
    });
    console.log("Created DigitalBusinessCard:", card.id, card.slug);
  } else {
    card = await prisma.digitalBusinessCard.update({
      where: { id: card.id },
      data: {
        slug: "aakargraphics",
        merchantId: merchant.id,
        ...cardData
      }
    });
    console.log("Updated DigitalBusinessCard:", card.id, card.slug);
  }

  // 4. Create or update dynamic QrCode record
  let qr = await prisma.qrCode.findFirst({
    where: { slug: "aakargraphics" }
  });

  const qrData = {
    merchantId: merchant.id,
    label: "Aakar Graphics Digital Business Card",
    currentDest: "https://customerpilot.in/c/aakargraphics",
    redirectMode: "DIRECT",
    tier: "PRO",
    isActive: true,
    updatedAt: now
  };

  if (!qr) {
    qr = await prisma.qrCode.create({
      data: {
        id: "qr_aakargraphics_01",
        slug: "aakargraphics",
        ...qrData,
        createdAt: now
      }
    });
    console.log("Created QrCode record:", qr.id, qr.slug);
  } else {
    qr = await prisma.qrCode.update({
      where: { id: qr.id },
      data: qrData
    });
    console.log("Updated QrCode record:", qr.id, qr.slug);
  }

  console.log("=== AAKAR GRAPHICS PROVISIONING COMPLETED SUCCESSFULLY ===");
}

seedAakar()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
