// CustomerPilot — Smart Keyword Control Engine & Grounding Matrix
// Covers all 10 core business categories with SEO, AEO, GEO, and Strict Blacklist definitions.

export interface CategoryPreset {
  id: string;
  label: string;
  gbpCategory: string;
  audiencePersona: "All_Neutral" | "Female_Only" | "Male_Only" | "Family_Kids" | "Couples_Friends";
  serviceMode: string;
  seoEntities: string[];      // Allowed: SEO (Products / Entities / Services)
  aeoAnswers: string[];       // Allowed: AEO (Voice / Answers / Practical Solutions)
  geoContext: string[];       // Allowed: GEO (Context, Vibe, Occasion, Price Sentiment)
  blacklist: string[];        // Strictly Not Allowed (Blacklist)
}

export interface KeywordProfile {
  categoryKey: string;
  businessName: string;
  gbpPrimaryCategory: string;
  city: string;
  localityLandmarks: string[];
  audiencePersona: "All_Neutral" | "Female_Only" | "Male_Only" | "Family_Kids" | "Couples_Friends";
  serviceMode: string;
  allowedSeoEntities: string[];
  allowedAeoAnswers: string[];
  allowedGeoContext: string[];
  strictlyNotAllowed: string[];
}

export const MASTER_KEYWORD_PRESETS: Record<string, CategoryPreset> = {
  hotels: {
    id: "hotels",
    label: "Hotels & Stays",
    gbpCategory: "Hotel",
    audiencePersona: "All_Neutral",
    serviceMode: "Check-in + Stay",
    seoEntities: ["Clean rooms", "AC cooling", "Clean washrooms", "Comfortable bed", "Free Wi-Fi", "Ample parking", "Room service", "Breakfast buffet", "Lift facility"],
    aeoAnswers: ["Late night check-in available", "Safe for solo female travelers", "Couple friendly stay", "Early check-in support", "Near railway station / bus stand", "24-hour front desk"],
    geoContext: ["Budget friendly family stay", "Peaceful business trip hotel", "Value for money tariff", "Quick overnight transit stay", "Walkable from main market"],
    blacklist: ["Swimming pool", "Bar / Alcohol", "Gym / Spa", "In-house restaurant / Kitchen", "Pet friendly", "Unmarried couples", "Resort view"]
  },
  cafe: {
    id: "cafe",
    label: "Cafe & Coffee Shop",
    gbpCategory: "Cafe / Coffee Shop",
    audiencePersona: "Couples_Friends",
    serviceMode: "Dine-in + Takeaway",
    seoEntities: ["Cold coffee", "Hazelnut frappe", "Cappuccino", "Cheese fries", "Grilled sandwich", "White sauce pasta", "Mojito", "Garlic bread", "Waffles"],
    aeoAnswers: ["Fast Wi-Fi for laptop work", "Plug points at tables", "Open late evening", "No disturbance / Quiet seating", "Quick pocket-friendly snacks", "100% pure veg cafe"],
    geoContext: ["Aesthetic vibe for couples", "Best evening hangout with friends", "Cozy work-from-cafe spot", "Good background music playlist", "Affordable student pricing"],
    blacklist: ["Hookah / Sheesha", "Smoking zone", "Non-veg / Egg items", "Alcohol / Beer", "Full lunch/dinner thali", "Live band", "Outdoor rooftop"]
  },
  bakery: {
    id: "bakery",
    label: "Cake Shop & Bakery",
    gbpCategory: "Cake shop / Bakery",
    audiencePersona: "All_Neutral",
    serviceMode: "Online Delivery + Takeaway",
    seoEntities: ["Chocolate truffle cake", "Dutch truffle", "Custom theme cake", "Live cake making", "Fresh fruit cake", "Red velvet", "Rasmalai cake", "Photo print cake", "Pinata cake"],
    aeoAnswers: ["100% eggless cake", "Midnight cake delivery on time", "Urgent 1-2 hour delivery", "Freshly baked in front of eyes", "Less cream / balanced sweetness", "Damage-free safe box packing"],
    geoContext: ["Kids 1st birthday custom design", "2-tier wedding anniversary cake", "Surprise gift delivery in area", "Soft spongy base", "Reasonable rate compared to market"],
    blacklist: ["Bread / Pav", "Cookies / Biscuits", "Muffins / Cupcakes", "Khari / Toast / Puffs", "Savory snacks / Patties", "Dine-in table seating", "Egg cakes"]
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant (Family & Dine-in)",
    gbpCategory: "Restaurant",
    audiencePersona: "Family_Kids",
    serviceMode: "Dine-in + Parcel",
    seoEntities: ["Paneer butter masala", "Dal makhani", "Garlic naan", "Amritsari kulcha", "Special unlimited thali", "Chaas", "Gulab jamun", "Crispy starter"],
    aeoAnswers: ["Pure vegetarian kitchen", "Jain food available", "Fast parcel / takeaway service", "Large group seating available", "Clean family AC hall", "Hygienic open kitchen"],
    geoContext: ["Authentic dhaba-style taste", "Generous portion size for 3-4 people", "Best weekend family dinner spot", "Homestyle less-oily food", "Quick table service even in Sunday rush"],
    blacklist: ["Non-veg / Chicken / Mutton / Fish", "Gujarati items", "South Indian items", "Alcohol / Bar", "Buffet system", "Live music", "Home delivery"]
  },
  salon_men: {
    id: "salon_men",
    label: "Salon - Men / Unisex",
    gbpCategory: "Hair Salon / Barber Shop",
    audiencePersona: "Male_Only",
    serviceMode: "Walk-in + Appointment",
    seoEntities: ["Skin fade haircut", "Beard trim & shaping", "Hair spa", "Head massage", "De-tan facial", "Hair color / Global highlights", "Keratin / Smoothening", "Kids haircut"],
    aeoAnswers: ["Sterilized tools & fresh disposable towel", "Walk-in without long waiting", "Experienced hair stylist", "No forced product upselling", "Exact haircut as shown in reference photo"],
    geoContext: ["Affordable men's grooming rates", "Good AC cooling & clean floor", "Polite staff behavior", "Relaxing Sunday salon visit", "Best unisex styling in area"],
    blacklist: ["Ladies bridal makeup", "Saree draping", "Ladies waxing", "Body spa / Thai massage", "Tattoo / Piercing", "Nail extensions"]
  },
  beauty_parlour: {
    id: "beauty_parlour",
    label: "Beauty Parlor (Ladies Only)",
    gbpCategory: "Beauty Salon / Make-up Artist",
    audiencePersona: "Female_Only",
    serviceMode: "Appointment + Walk-in",
    seoEntities: ["HD Bridal makeup", "Party makeup", "Rica waxing", "O3+ facial / Hydra facial", "Painless threading", "Hair smoothening / Botox", "Manicure & Pedicure", "Nail art"],
    aeoAnswers: ["100% female staff & full privacy", "Light hand painless threading", "Original branded skin products used", "Long-lasting non-cakey makeup base", "Transparent rate card with no hidden charges"],
    geoContext: ["Natural wedding look for photos", "Quick waxing for working women", "Hygienic bedsheets & disposable kit", "Friendly parlor didi/staff"],
    blacklist: ["Men's haircut", "Beard shave / Gents grooming", "Male staff", "Unisex seating", "Laser clinic surgery", "Mehendi service"]
  },
  gift_shop: {
    id: "gift_shop",
    label: "Gift Shop & Novelty Store",
    gbpCategory: "Gift Shop / Novelty Store",
    audiencePersona: "All_Neutral",
    serviceMode: "Walk-in + Customization",
    seoEntities: ["Customized photo mug", "LED photo frame", "Birthday hampers", "Home decor showpieces", "Soft toys / Teddy bear", "Couple watches & perfumes", "Return gifts for kids", "Corporate gift sets"],
    aeoAnswers: ["Same-day urgent customization", "Free attractive gift wrapping", "Bulk return gifts at wholesale rate", "Clear HD photo printing quality", "Unique items under ₹500 / ₹1000"],
    geoContext: ["Last-minute anniversary gift solution", "Best local store for kids birthday gifts", "Helpful owner suggests good options", "Trendy Instagram-style gift collection"],
    blacklist: ["Fresh flowers / Bouquets", "Real cake / Bakery items", "Gold / Silver jewelry", "Clothing / Garments", "Home delivery", "Stationery / School books"]
  },
  clothing: {
    id: "clothing",
    label: "Garment Shop & Boutique",
    gbpCategory: "Clothing Store / Boutique",
    audiencePersona: "All_Neutral",
    serviceMode: "Walk-in Store",
    seoEntities: ["Cotton kurtis", "Party wear gowns", "Co-ord sets", "Sarees", "Denim jeans", "Casual shirts", "Soft cotton kids wear", "Boys ethnic set"],
    aeoAnswers: ["All sizes (S to XXL/Plus size) available", "Easy 7-day size exchange policy", "No color bleed or fabric shrinkage after wash", "Clean trial rooms with good mirrors", "Fixed reasonable pricing"],
    geoContext: ["Latest festive/Diwali collection", "Patient staff shows multiple designs without irritation", "Daily office wear & college casuals", "Value for money family shopping"],
    blacklist: ["Custom stitching / Tailoring", "Rental clothes", "Footwear / Shoes", "Menswear", "Bargaining / Discount sale"]
  },
  supermarket: {
    id: "supermarket",
    label: "SuperMarket & Grocery Store",
    gbpCategory: "Supermarket / Grocery Store",
    audiencePersona: "Family_Kids",
    serviceMode: "Walk-in + WhatsApp Delivery",
    seoEntities: ["Monthly ration / Grocery", "Fresh morning vegetables & fruits", "Dairy products", "Imported snacks & chocolates", "Dry fruits", "Household cleaning supplies", "Frozen foods"],
    aeoAnswers: ["WhatsApp list home delivery within 2 hours", "Discount below MRP on all items", "Fast billing counters without long queues", "Easy two-wheeler & car parking outside", "Fresh stock with long expiry dates"],
    geoContext: ["Well-organized aisles & clean trolleys", "All daily needs under one roof", "Polite staff helps carry bags to vehicle", "Smooth UPI & Card payment"],
    blacklist: ["Fresh vegetables/fruits", "Non-veg / Meat / Eggs", "Medicines / Pharmacy", "Electronics / Clothes", "Free home delivery"]
  },
  car_wash: {
    id: "car_wash",
    label: "Car Wash & Detailing Service",
    gbpCategory: "Car Wash / Car Detailing Service",
    audiencePersona: "All_Neutral",
    serviceMode: "Drive-in + Detailing Bay",
    seoEntities: ["Snow foam wash", "Deep interior vacuum cleaning", "Underbody high-pressure wash", "Dashboard & tyre polish", "Rubbing & wax polishing", "Ceramic coating", "AC vent cleaning", "Bike foam wash"],
    aeoAnswers: ["Quick 30-minute car wash", "Scratch-free clean microfiber cloths used", "Hard water stain removal", "Mats & seat corners thoroughly vacuumed", "Customer waiting room with AC/Fan"],
    geoContext: ["Value for money washing package", "Car looks showroom-new after monsoon mud", "Honest staff checks every corner before handover", "Easy entry/exit on main road"],
    blacklist: ["Engine mechanical repair", "Denting & painting", "Wheel alignment & balancing", "Tyre puncture", "Car accessories / Music system", "Doorstep home car wash"]
  }
};

/**
 * Resolves appropriate master preset for any arbitrary merchant category string.
 */
export function getKeywordPresetForCategory(category?: string | null): CategoryPreset {
  const c = (category || "").toLowerCase();

  if (c.includes("hotel") || c.includes("resort") || c.includes("lodge") || c.includes("stay") || c.includes("room")) {
    return MASTER_KEYWORD_PRESETS.hotels;
  }
  if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro")) {
    return MASTER_KEYWORD_PRESETS.cafe;
  }
  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    return MASTER_KEYWORD_PRESETS.bakery;
  }
  if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("spa") || c.includes("bridal") || c.includes("ladies salon")) {
    return MASTER_KEYWORD_PRESETS.beauty_parlour;
  }
  if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming")) {
    return MASTER_KEYWORD_PRESETS.salon_men;
  }
  if (c.includes("gift") || c.includes("toy") || c.includes("novelty") || c.includes("frame")) {
    return MASTER_KEYWORD_PRESETS.gift_shop;
  }
  if (c.includes("cloth") || c.includes("garment") || c.includes("boutique") || c.includes("saree") || c.includes("dress") || c.includes("wear")) {
    return MASTER_KEYWORD_PRESETS.clothing;
  }
  if (c.includes("supermarket") || c.includes("grocery") || c.includes("kirana") || c.includes("mart") || c.includes("store")) {
    return MASTER_KEYWORD_PRESETS.supermarket;
  }
  if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    return MASTER_KEYWORD_PRESETS.car_wash;
  }

  // Default to Restaurant or General
  return MASTER_KEYWORD_PRESETS.restaurant;
}

/**
 * Builds or normalizes a merchant's active KeywordProfile from DB JSON or defaults.
 */
export function resolveMerchantKeywordProfile(merchant: {
  id?: string;
  name?: string;
  category?: string | null;
  businessType?: string | null;
  city?: string | null;
  address?: string | null;
  keywordProfile?: string | null;
}): KeywordProfile {
  const categoryPreset = getKeywordPresetForCategory(merchant.category || merchant.businessType);

  // If merchant has saved profile in DB, parse and merge
  if (merchant.keywordProfile) {
    try {
      const parsed = JSON.parse(merchant.keywordProfile);
      return {
        categoryKey: parsed.categoryKey || categoryPreset.id,
        businessName: merchant.name || parsed.businessName || "Local Business",
        gbpPrimaryCategory: parsed.gbpPrimaryCategory || categoryPreset.gbpCategory,
        city: merchant.city || parsed.city || "Vadodara",
        localityLandmarks: Array.isArray(parsed.localityLandmarks) ? parsed.localityLandmarks : ["Main Market"],
        audiencePersona: parsed.audiencePersona || categoryPreset.audiencePersona,
        serviceMode: parsed.serviceMode || categoryPreset.serviceMode,
        allowedSeoEntities: Array.isArray(parsed.allowedSeoEntities) && parsed.allowedSeoEntities.length > 0 ? parsed.allowedSeoEntities : categoryPreset.seoEntities,
        allowedAeoAnswers: Array.isArray(parsed.allowedAeoAnswers) && parsed.allowedAeoAnswers.length > 0 ? parsed.allowedAeoAnswers : categoryPreset.aeoAnswers,
        allowedGeoContext: Array.isArray(parsed.allowedGeoContext) && parsed.allowedGeoContext.length > 0 ? parsed.allowedGeoContext : categoryPreset.geoContext,
        strictlyNotAllowed: Array.isArray(parsed.strictlyNotAllowed) && parsed.strictlyNotAllowed.length > 0 ? parsed.strictlyNotAllowed : categoryPreset.blacklist,
      };
    } catch (_) {}
  }

  // Fallback to fresh preset defaults
  return {
    categoryKey: categoryPreset.id,
    businessName: merchant.name || "Local Business",
    gbpPrimaryCategory: categoryPreset.gbpCategory,
    city: merchant.city || "Vadodara",
    localityLandmarks: ["Main Market", "Near Station"],
    audiencePersona: categoryPreset.audiencePersona,
    serviceMode: categoryPreset.serviceMode,
    allowedSeoEntities: [...categoryPreset.seoEntities],
    allowedAeoAnswers: [...categoryPreset.aeoAnswers],
    allowedGeoContext: [...categoryPreset.geoContext],
    strictlyNotAllowed: [...categoryPreset.blacklist],
  };
}
