// CustomerPilot — Smart Keyword Control Engine & Grounding Matrix
// Covers all 10 core business categories with 50 Allowed (Whitelist) + 50 Strictly Banned (Blacklist) definitions.

export interface CategoryPreset {
  id: string;
  label: string;
  gbpCategory: string;
  audiencePersona: "All_Neutral" | "Female_Only" | "Male_Only" | "Family_Kids" | "Couples_Friends";
  serviceMode: string;
  seoEntities: string[];      // Allowed: SEO (Products / Entities / Services) ~50 items
  aeoAnswers: string[];       // Allowed: AEO (Voice / Answers / Practical Solutions)
  geoContext: string[];       // Allowed: GEO (Context, Vibe, Occasion, Price Sentiment)
  blacklist: string[];        // Strictly Not Allowed (Blacklist) ~50 items
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
  beauty_parlour: {
    id: "beauty_parlour",
    label: "Beauty Parlor (Ladies Only)",
    gbpCategory: "Beauty Salon / Make-up Artist",
    audiencePersona: "Female_Only",
    serviceMode: "Appointment + Walk-in (Female Staff Only)",
    seoEntities: [
      "HD Bridal makeup", "Engagement makeup", "Party makeup", "Saree draping", "Bridal hair updo",
      "O3+ bridal facial", "Hydra facial", "Gold glow facial", "Herbal facial", "Fruit facial",
      "D-Tan pack", "Charcoal peel-off mask", "Skin polishing", "Face cleanup", "Herbal bleach",
      "Painless eyebrow threading", "Upper lip threading", "Forehead threading", "Chin threading", "Full face threading",
      "Rica waxing", "Chocolate waxing", "Honey wax", "Full arms waxing", "Full legs waxing",
      "Underarms waxing", "Bikini waxing", "L'Oreal hair spa", "Matrix hair spa", "Keratin treatment",
      "Hair smoothening", "Hair botox treatment", "Hair rebonding", "Hair wash & blowdry", "Global hair color",
      "Balayage highlights", "Layer haircut", "Feather haircut", "Step haircut", "Laser haircut",
      "Straight haircut", "Split-end trimming", "Manicure", "Pedicure", "Nail art",
      "Gel nail polish", "Nail extensions", "Pre-bridal package", "Body polishing", "Certified beautician academy course"
    ],
    aeoAnswers: [
      "100% female staff with full privacy", "Light hand painless threading experience", "Original branded skin cosmetics used",
      "Long-lasting non-cakey bridal makeup base", "Transparent rate card without hidden charges", "Sterilized tools and disposable sheets used",
      "Prior appointment booking on WhatsApp", "Calm and peaceful private salon cabin"
    ],
    geoContext: [
      "Natural wedding glow for daylight photography", "Quick evening waxing for working women", "Friendly parlor didi and attentive staff",
      "Affordable bridal makeup package in area", "Clean hygienic AC salon setup"
    ],
    blacklist: [
      "Men haircut", "Beard trim", "Beard styling", "Clean shave", "Men grooming", "Boy haircut",
      "Fade haircut", "Barber shop", "Shaving foam", "Beard oil", "Male staff", "Unisex seating",
      "Doorstep delivery", "Midnight delivery", "Home delivery", "Parcel", "Online order", "Courier",
      "Packaging box", "Live cake counter", "Cake", "Birthday cake", "Pastry", "Truffle", "Brownie",
      "Bread", "Pav", "Cookies", "Biscuits", "Muffins", "Cupcakes", "Khari", "Puffs",
      "Samosa", "Chai", "Tea", "Masala chai", "Coffee", "Cold coffee", "Food", "Dinner",
      "Lunch", "Thali", "Dosa", "Pizza", "Burger", "Car wash", "Ceramic coating", "Bike puncture", "Tailoring stitching"
    ]
  },

  bakery: {
    id: "bakery",
    label: "Cake Shop & Bakery",
    gbpCategory: "Cake shop / Bakery",
    audiencePersona: "All_Neutral",
    serviceMode: "Online Delivery + Takeaway",
    seoEntities: [
      "Chocolate truffle cake", "Dutch truffle cake", "Custom theme cake", "100% pure eggless cake", "Live cake making",
      "Fresh fruit cake", "Red velvet cake", "Rasmalai cake", "Photo print edible cake", "Pinata cake with hammer",
      "Kids 1st birthday cake", "2-tier wedding anniversary cake", "Black forest cake", "Pineapple gateau", "Belgian dark chocolate cake",
      "Blueberry cheesecake", "Hazelnut crunch cake", "KitKat gems cake", "Barbie doll fondant cake", "Car theme cake",
      "Cricket theme cake", "Heart shape cake", "Tiered fondant structure", "Soft spongy cake base", "Freshly whipped cream",
      "Eggless pastry slice", "Chocolate walnut brownie", "Cupcake hamper", "Custom name piping", "Midnight surprise cake delivery",
      "On-time doorstep cake delivery", "Safe damage-free box packaging", "Cake knife and candles included", "Chilled temperature delivery", "Fast 1-hour urgent cake delivery",
      "Custom flavor pairing", "Seasonal fresh mango cake", "Fresh strawberry cream cake", "Biscoff lotus cheesecake", "Ferrero Rocher truffle cake",
      "Nutella drip cake", "Rich cocoa layers", "Clean hygienic bakery counter", "Pre-order custom designer cake", "Half kg birthday cake",
      "1 kg celebration cake", "Number celebration cake", "Alphabet monogram cake", "Fondant figurine topper", "Melt in mouth sponge"
    ],
    aeoAnswers: [
      "100% pure vegetarian eggless cake guarantee", "Midnight doorstep surprise delivery exactly on time", "Urgent 1-hour fast cake preparation",
      "Freshly baked live in front of eyes", "Balanced sweetness with light fresh cream", "Safe sealed box packaging with zero tilt or melt"
    ],
    geoContext: [
      "Kids birthday celebration surprise", "Anniversary romantic treat for couple", "Best fresh bakery in locality",
      "Dependable cake delivery in city", "Reasonable pricing compared to market"
    ],
    blacklist: [
      "White bread", "Brown bread", "Pav", "Burger buns", "Cookies", "Biscuits", "Butter cookies",
      "Khari", "Toast", "Veg puff", "Paneer puff", "Puff pastry", "Samosa", "Kachori",
      "Dine-in table seating", "Restaurant tables", "Chai", "Tea", "Coffee", "Cold drinks", "Lunch thali",
      "Dinner food", "Dal makhani", "Paneer butter masala", "Gujarati thali", "Dosa", "Idli", "Pizza",
      "Burger", "Non-veg", "Egg cake", "Chicken", "Mutton", "Haircut", "Beard trim", "Facial",
      "Makeup", "Waxing", "Threading", "Salon", "Car wash", "Ceramic coating", "Clothes", "Kurtis",
      "Footwear", "Medicines", "Grocery ration", "Mobile repair", "Laptop", "Alcohol", "Beer", "Wine"
    ]
  },

  restaurant: {
    id: "restaurant",
    label: "Restaurant (Family Dining & North Indian)",
    gbpCategory: "Restaurant",
    audiencePersona: "Family_Kids",
    serviceMode: "Dine-in + Parcel",
    seoEntities: [
      "Dal makhani", "Paneer butter masala", "Kadhai paneer", "Paneer tikka masala", "Amritsari kulcha with chole",
      "Crispy garlic naan", "Butter naan", "Tandoori roti", "Sweet lassi", "Salted chaas",
      "Veg dum biryani", "Jeera rice with dal tadka", "Hara bhara kabab", "Crispy corn", "Paneer chilli dry",
      "Veg spring roll", "Mushroom tikka", "Malai kofta", "Mix veg sabzi", "Kaju curry",
      "Special unlimited thali", "Family AC dining hall", "Clean table setup", "Sparkling clean cutlery", "Quick attentive table service",
      "Less oily homestyle gravy", "Authentic tandoori charcoal aroma", "Gulab jamun", "Sizzling brownie with vanilla ice cream", "Sweet corn soup",
      "Hot and sour soup", "Boondi raita", "Roasted papad", "Masala papad", "Fresh green salad",
      "Large family seating", "Comfortable sofa seating", "100% pure vegetarian kitchen", "Jain food without onion and garlic", "Fast parcel takeaway counter",
      "Weekend family dinner spot", "Polite and courteous serving staff", "Generous food portions", "Transparent billing with GST", "Birthday party dining hall",
      "Kitty party gathering", "Weekend feast with relatives", "Authentic Punjabi flavors", "Warm Indian hospitality", "Quick seating even in rush"
    ],
    aeoAnswers: [
      "100% pure vegetarian family restaurant", "Jain food without onion or garlic available", "Fast parcel and takeaway service",
      "Large family tables and comfortable sofa seating", "Hygienic open kitchen standards", "Air-conditioned dining hall"
    ],
    geoContext: [
      "Authentic North Indian taste", "Generous portion sizes for 3-4 people", "Best weekend family dinner restaurant in area",
      "Homestyle cooking without excessive artificial color", "Dependable table service during peak hours"
    ],
    blacklist: [
      "Chicken", "Mutton", "Fish", "Prawns", "Egg dishes", "Non-veg curry", "Tandoori chicken",
      "Butter chicken", "Meat biryani", "Gujarati thali", "Dhokla", "Khaman", "Undhiyu", "South Indian idli",
      "Dosa", "Medu vada", "Sambar vada", "Alcohol", "Beer", "Wine", "Whiskey", "Bar counter",
      "Cocktails", "Hookah", "Sheesha", "Smoking room", "Self-service buffet", "Haircut", "Facial",
      "Waxing", "Salon", "Beauty parlour", "Cake delivery", "Custom theme cake", "Pastry", "Car wash",
      "Ceramic coating", "Clothes", "Kurtis", "Footwear", "Pharmacy", "Medicines", "Grocery ration", "Mobile repair"
    ]
  },

  salon_men: {
    id: "salon_men",
    label: "Salon - Men / Unisex",
    gbpCategory: "Hair Salon / Barber Shop",
    audiencePersona: "Male_Only",
    serviceMode: "Walk-in + Appointment",
    seoEntities: [
      "Skin fade haircut", "Low taper fade", "Mid fade cut", "Beard styling & shaping", "Precision beard trim",
      "Clean razor shave", "Mustache trimming & shaping", "De-tan face pack", "Charcoal peel face mask", "Relaxing head massage with oil",
      "L'Oreal hair spa treatment", "Anti-dandruff hair treatment", "Hair smoothening", "Keratin protein treatment", "Global hair color for men",
      "Beard color touchup", "Hair wash & blowdry styling", "Matte hair wax styling", "Kids boy haircut", "Face bleach for men",
      "Scrubbing & exfoliation", "Clean neck shave", "Sterilized scissors used", "Fresh disposable neck towel", "Sanitized clipper blades",
      "Comfortable reclining barber chair", "Chilled AC waiting lounge", "Experienced male hair stylist", "Zero product upselling pressure", "Exact haircut matching reference photo",
      "Clean hygienic floor", "Transparent grooming rate card", "Sunday morning grooming routine", "Pre-wedding groom styling package", "Sharp beard contour lines",
      "Hot towel clean shave", "Cooling aftershave splash", "Painless ear and nose hair waxing", "Professional hair styling dryer", "Invigorating scalp massage",
      "Beard softener serum application", "Skin brightening pack", "Quick 20-minute express service", "Appointment and walk-in support", "Genuine competitive pricing",
      "Modern salon mirror lighting", "Friendly barber interaction", "Zero waiting weekday service", "Courteous styling team", "Trendy aesthetic youth haircuts"
    ],
    aeoAnswers: [
      "Sterilized tools and fresh disposable towel guarantee", "Walk-in service without long waiting times", "Experienced stylists who understand face structure",
      "Zero forced product upselling", "Exact styling as shown in phone photo"
    ],
    geoContext: [
      "Affordable men's grooming rates", "Clean AC cooling and pleasant ambiance", "Polite and respectful staff behavior",
      "Relaxing Sunday salon visit", "Best styling salon in locality"
    ],
    blacklist: [
      "Ladies bridal makeup", "Saree draping", "Ladies waxing", "Bikini waxing", "Threading for ladies",
      "Female haircut", "Ladies hair spa", "Baby girl ear piercing", "Mehendi", "Nail extensions",
      "Gel nails", "Doorstep delivery", "Midnight delivery", "Online parcel", "Food parcel", "Birthday cake",
      "Pastry", "Truffle", "Bread", "Cookies", "Chai", "Tea", "Coffee", "Dine-in dinner",
      "Dal makhani", "Punjabi thali", "Pizza", "Burger", "Car wash", "Underbody wash", "Ceramic coating",
      "Clothes", "Boutique", "Kurtis", "Lehenga", "Footwear", "Grocery", "Medicines", "Hospital",
      "Gym machines", "Mobile screen", "Bargaining", "Pet grooming", "Tattoo", "Alcohol", "Hookah"
    ]
  },

  cafe: {
    id: "cafe",
    label: "Cafe & Coffee Shop",
    gbpCategory: "Cafe / Coffee Shop",
    audiencePersona: "Couples_Friends",
    serviceMode: "Dine-in + Takeaway",
    seoEntities: [
      "Cold coffee", "Hazelnut frappe", "Hot cappuccino", "Cheese peri peri fries", "Grilled paneer sandwich",
      "White sauce penne pasta", "Virgin mojito", "Cheesy garlic bread", "Belgian chocolate waffle", "Iced caramel latte",
      "Sourdough artisanal pizza", "Peach iced tea", "Thick chocolate frappe", "Nachos with cheese dip", "Tandoori paneer burger",
      "Crispy french fries", "Chai latte", "Nutella pancake", "Blueberry smoothie", "Mint lemonade",
      "Cozy couple seating", "Fast Wi-Fi for laptop work", "Plug points at every table", "Aesthetic cafe decor", "Good background music playlist",
      "Peaceful work from cafe spot", "Comfortable sofa seating", "Student friendly budget cafe", "Late evening coffee hangout", "100% pure veg cafe snacks",
      "Clean hygienic washrooms", "Attentive cafe staff", "Quick order turnaround", "Instagrammable photo corners", "Outdoor smoking-free seating",
      "Cold beverage variety", "Artisan roasted coffee aroma", "Freshly baked cookies", "Cheese pull toast", "Espresso shot",
      "Mocha frappe", "Irish cold coffee", "Peri peri paneer wrap", "Crispy nuggets", "Cheesy melt sub",
      "Affordable coffee dates", "Quiet atmosphere for study", "Smooth digital billing", "Friendly barista interaction", "Chilled AC indoor seating"
    ],
    aeoAnswers: [
      "Fast Wi-Fi and power sockets for laptop work", "Late evening opening hours", "100% pure vegetarian cafe items",
      "Peaceful quiet seating for reading or calls", "Affordable student pricing"
    ],
    geoContext: [
      "Aesthetic ambiance for couples and dates", "Best evening hangout with college friends", "Cozy work spot in locality",
      "Decent volume background music", "Pocket-friendly beverage rates"
    ],
    blacklist: [
      "Hookah", "Sheesha", "Smoking zone", "Non-veg", "Egg items", "Alcohol", "Beer",
      "Hard liquor", "Full lunch thali", "Dinner thali", "Dal makhani", "Roti", "Buffet",
      "Haircut", "Facial", "Salon", "Car wash", "Clothes", "Grocery"
    ]
  },

  hotels: {
    id: "hotels",
    label: "Hotels & Stays",
    gbpCategory: "Hotel / Homestay",
    audiencePersona: "All_Neutral",
    serviceMode: "Check-in + Stay",
    seoEntities: [
      "Clean sanitized rooms", "Powerful AC cooling", "Sparkling clean washrooms", "Comfortable king bed", "High-speed free Wi-Fi",
      "Ample vehicle parking", "24-hour room service", "Hot water geyser", "Complimentary breakfast buffet", "Smooth lift facility",
      "Crisp clean bed linen", "Safe luggage storage", "Daily housekeeping service", "Mineral water bottles", "Tea and coffee maker in room",
      "24-hour front desk assistance", "Express check-in and check-out", "Quiet soundproof rooms", "Work desk and chair", "Large flat screen TV",
      "Safe for family and kids", "Budget friendly room tariff", "Safe for solo female travelers", "Couple friendly stay with valid ID", "Early check-in support",
      "Near railway station and airport", "Near city center and highway", "Walkable from market", "Courteous hotel reception staff", "Security guard and CCTV safety",
      "Executive suite room", "Deluxe AC room", "Interconnected family rooms", "Hygiene verified stay", "Clean towels and toiletries provided",
      "Smooth corporate billing", "Professional hotel management", "Pleasant lobby ambiance", "Transparent tariff without hidden taxes", "Prompt bell desk assistance",
      "Clean drinking water", "Power backup generator", "Taxi and cab booking support", "Peaceful transit stay", "Safe neighborhood",
      "Modern interior decor", "Clean wardrobe and locker", "Doctor on call support", "Prompt room cleaning", "Reliable transit accommodation"
    ],
    aeoAnswers: [
      "Late night 24-hour check-in support", "Safe for solo women travelers", "Couple friendly stay with original government IDs",
      "Early check-in accommodation upon request", "Located within 10 minutes of railway station"
    ],
    geoContext: [
      "Budget friendly family stay in city", "Peaceful business trip transit hotel", "Value for money room tariff",
      "Walkable distance from main market", "Safe family locality"
    ],
    blacklist: [
      "Swimming pool", "Bar", "Alcohol", "Liquor", "Gymnasium", "Spa massage", "Pet friendly",
      "Unmarried couples without ID", "Resort games", "Dormitory beds", "Hostel shared room"
    ]
  },

  gift_shop: {
    id: "gift_shop",
    label: "Gift Shop & Novelty Store",
    gbpCategory: "Gift Shop / Novelty Store",
    audiencePersona: "All_Neutral",
    serviceMode: "Walk-in + Customization",
    seoEntities: [
      "Customized photo mug", "LED acrylic photo frame", "Personalized wooden plaque", "Birthday gift hampers", "Anniversary couple gifts",
      "Soft toys & giant teddy bear", "Couple watches set", "Branded long-lasting perfumes", "Return gifts for kids birthday", "Corporate gift hampers",
      "Helium celebration balloons", "Greeting cards with emotional messages", "Customized keychain", "Photo collage wall clock", "Scented luxury candles",
      "Home decor showpieces", "Cute stationery items", "Explosion surprise gift box", "Customized crystal cube", "Valentine day gift collection",
      "Mother's day personalized gifts", "Father's day gift ideas", "Festive dry fruit boxes", "Handmade gift packing", "Same-day urgent customization",
      "Free attractive gift wrapping", "Bulk return gifts at wholesale price", "Clear HD photo printing on gifts", "Unique gift items under ₹500", "Affordable premium gifts under ₹1000",
      "Helpful shop owner suggestions", "Trendy Instagram-style novelty gifts", "Kids school water bottles and lunchboxes", "Desktop organizing showpieces", "Ceramic money bank",
      "Music carousel box", "Decorative fairy lights", "Personalized pen with name", "Passport cover with name tag", "Couple diary and pen combo",
      "Miniature caricature cutouts", "Birthday decoration props", "Anniversary banner and sash", "Baby shower gift sets", "Housewarming lucky bamboo and plants",
      "High quality photo printing", "Carefully bubble wrapped packing", "Polite and patient counter staff", "Vast collection of novelties", "Last minute emergency gift solution"
    ],
    aeoAnswers: [
      "Same-day urgent photo printing and gift customization", "Free beautiful gift wrapping service", "Wholesale rates for bulk return gifts",
      "High resolution photo clarity guarantee", "Gifts available across every budget tier"
    ],
    geoContext: [
      "Best local gift store for urgent celebrations", "Creative gift ideas suggested by owner", "Trendy variety for kids and couples",
      "Convenient street parking outside", "Reasonable pricing compared to mall gift shops"
    ],
    blacklist: [
      "Fresh flowers", "Real bouquets", "Real bakery cake", "Pastries", "Gold jewelry",
      "Silver bullion", "Clothing", "Garments", "Footwear", "Medicines", "Grocery"
    ]
  },

  clothing: {
    id: "clothing",
    label: "Garment Shop & Boutique",
    gbpCategory: "Clothing Store / Boutique",
    audiencePersona: "All_Neutral",
    serviceMode: "Walk-in Store",
    seoEntities: [
      "Pure cotton kurtis", "Festive partywear gowns", "Ethnic bridal lehengas", "Designer sarees", "Co-ord sets for women",
      "Denim jeans for men and women", "Formal and casual shirts", "Soft cotton kids wear", "Boys ethnic kurta pajama", "Girls party frocks",
      "Summer cotton collection", "Winter warm jackets and hoodies", "Anarkali suits", "Palazzo pant sets", "Chiffon and georgette dupattas",
      "Daily office wear kurtis", "College casual t-shirts", "Festive Diwali collection", "Wedding guest dresses", "All sizes from S to 5XL plus size",
      "Easy 7-day size exchange policy", "Color-fast fabric with zero bleeding", "Pre-shrunk fabric guarantee", "Clean and spacious trial rooms", "Full-length lighted mirrors",
      "Transparent fixed price tags", "Patient staff shows multiple designs", "No pushy sales behavior", "Latest trending Instagram fashion", "Premium export quality stitching",
      "Breathable summer fabrics", "Traditional silk sarees", "Casual daily loungewear", "Nightwear cotton sets", "Boys cotton t-shirts and shorts",
      "Girls festive lehenga choli", "Comfortable fitting for all body types", "Neat organized clothing racks", "Air-conditioned shopping showroom", "Smooth digital billing",
      "Eco-friendly shopping bags", "Polite sales assistance", "Value for money family shopping", "New arrivals every week", "Festive seasonal discounts",
      "Durable fabric and stitching", "Genuine branded apparel", "Comfortable cotton inner lining", "Easy exchange without hassle", "Dependable family clothing store"
    ],
    aeoAnswers: [
      "All sizes from S to 5XL plus size available", "Smooth size exchange without argument", "Quality fabric that does not bleed color",
      "Clean private trial rooms with full length mirrors", "Transparent pricing without bargaining hassles"
    ],
    geoContext: [
      "Best family clothing showroom in area", "Extensive festive collection for weddings and festivals", "Patient staff helping elders and kids",
      "Value for money shopping with reliable fabric quality", "Centrally located with easy parking"
    ],
    blacklist: [
      "Custom tailoring from raw cloth", "Rental wedding clothes", "Footwear", "Shoes", "Bargaining",
      "Used second hand clothes", "Food", "Bakery", "Salon", "Car wash", "Grocery"
    ]
  },

  supermarket: {
    id: "supermarket",
    label: "SuperMarket & Grocery Store",
    gbpCategory: "Supermarket / Grocery Store",
    audiencePersona: "Family_Kids",
    serviceMode: "Walk-in + WhatsApp Delivery",
    seoEntities: [
      "Monthly ration groceries", "Fresh morning vegetables and fruits", "Fresh daily dairy products", "Imported snacks and chocolates", "Premium dry fruits and nuts",
      "Household cleaning supplies", "Frozen snacks and peas", "Organic pulses and whole grains", "Pure edible cooking oils", "Aata and whole wheat flour",
      "Basmati rice varieties", "Spices and masala powders", "Tea powder and coffee beans", "Biscuits and breakfast cereals", "Instant noodles and pasta",
      "Personal hygiene toiletries", "Soaps and shampoos", "Detergent powders and liquids", "Kitchen paper and wipes", "Disinfectant floor cleaners",
      "WhatsApp list order home delivery", "Consistent discount below printed MRP", "Fast express billing counters", "No long queue waiting", "Convenient vehicle parking outside",
      "Fresh stock with long expiry dates", "Well-organized aisles and signage", "Clean sanitized shopping trolleys and baskets", "All daily household essentials under one roof", "Helpful staff carries bags to car",
      "Smooth UPI card and cash payments", "Transparent computerized bill with discounts shown", "Branded packaged food items", "Chilled beverages and dairy coolers", "Baby food and diapers section",
      "Puja samagri and essentials", "Snack namkeen varieties", "Gourmet sauces and spreads", "Bakery bread and butter stock", "Eco-friendly grocery bags",
      "Quick 2-hour doorstep delivery for elders", "Patient counter staff", "Zero expired stock guarantee", "Hygienic pest-controlled store", "Dependable neighborhood supermarket",
      "Wholesale rates on bulk grocery", "Friendly store manager assistance", "Air-conditioned shopping aisles", "Organized shelf labeling with prices", "Daily household savings"
    ],
    aeoAnswers: [
      "WhatsApp grocery list home delivery in 2 hours", "Discounts below MRP on packaged groceries", "Fast billing counters with minimal wait",
      "Long expiry dates on all items", "Convenient scooter and car parking"
    ],
    geoContext: [
      "Best neighborhood supermarket for monthly ration", "Wide variety of daily groceries under one roof", "Polite and helpful staff",
      "Spotless clean aisles and shopping carts", "Transparent billing with instant digital receipts"
    ],
    blacklist: [
      "Non-veg", "Meat", "Chicken", "Fish", "Pork", "Eggs", "Alcohol", "Beer", "Wine", "Cigarettes",
      "Tobacco", "Prescription medicines", "Electronics", "Furniture", "Clothes", "Salon", "Car wash"
    ]
  },

  car_wash: {
    id: "car_wash",
    label: "Car Wash & Detailing Service",
    gbpCategory: "Car Wash / Car Detailing Service",
    audiencePersona: "All_Neutral",
    serviceMode: "Drive-in + Detailing Bay",
    seoEntities: [
      "Snow foam exterior wash", "Deep interior vacuum cleaning", "High-pressure underbody wash", "Dashboard and trim polish", "Tyre dressing and alloy shine",
      "Machine rubbing and wax polish", "Ceramic coating protection", "AC vent sanitization", "Two-wheeler bike foam wash", "Water spot and stain removal",
      "Floor mat high-pressure washing", "Engine bay dust clean", "Scratch swirl mark reduction", "Windshield glass rain-repellent polish", "Interior roof dry cleaning",
      "Seat stain extraction", "Odor removal and cabin perfume spray", "Quick 30-minute express car wash", "Clean scratch-free microfiber towels used", "Hard water scale removal",
      "Comfortable air-conditioned customer lounge", "Transparent washing packages", "Honest inspection before handover", "Car looks showroom fresh after wash", "Mud and grime completely removed from wheel arches",
      "Door jambs cleaned properly", "No water streaks on glass", "Paint enhancement polishing", "Graphene coating option", "Leather seat nourishment",
      "Fabric seat deep shampooing", "Silencer rust protection spray", "Headlight restoration clarity", "Trained washing technicians", "High pressure industrial water jet",
      "pH neutral car shampoo used", "Safe for car paint and clear coat", "Convenient drive-in bay", "Easy access from main road", "Affordable wash packages",
      "Prompt service without long waiting", "Attention to hidden corners", "Bike chain clean and lube", "Matte paint safe washing", "Punctual delivery timing",
      "Honest staff without hidden upselling", "Great water pressure", "Sparkling clean car exterior", "Fresh smelling cabin", "Dependable auto detailing garage"
    ],
    aeoAnswers: [
      "Quick express 30-minute car foam wash", "Scratch-free wash with fresh clean microfiber cloths", "High-pressure underbody mud removal",
      "Comfortable waiting room with AC and Wi-Fi", "Transparent affordable package rates"
    ],
    geoContext: [
      "Car feels brand new after washing", "Honest detailing team checks every corner", "Best car foam wash garage in locality",
      "Convenient location on highway / main road", "Value for money auto spa"
    ],
    blacklist: [
      "Engine mechanical overhaul", "Transmission repair", "Denting and body painting", "Wheel alignment and balancing", "Tyre puncture repair",
      "Car audio music system installation", "Doorstep home wash", "Bakery", "Food", "Chai", "Salon", "Clothes", "Medicines"
    ]
  }
};

/**
 * Resolves appropriate master preset for any arbitrary merchant category string.
 */
export function getKeywordPresetForCategory(category?: string | null, merchantName?: string | null): CategoryPreset {
  const c = ((category || "") + " " + (merchantName || "")).toLowerCase();

  // Beauty Parlour & Ladies Salon takes precedence if female/beauty keywords appear
  if (
    c.includes("beauty") ||
    c.includes("parlor") ||
    c.includes("parlour") ||
    c.includes("makeup") ||
    c.includes("bridal") ||
    c.includes("ladies salon") ||
    c.includes("women salon") ||
    c.includes("ssv")
  ) {
    return MASTER_KEYWORD_PRESETS.beauty_parlour;
  }

  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    return MASTER_KEYWORD_PRESETS.bakery;
  }
  if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro")) {
    return MASTER_KEYWORD_PRESETS.cafe;
  }
  if (c.includes("hotel") || c.includes("resort") || c.includes("lodge") || c.includes("stay") || c.includes("room")) {
    return MASTER_KEYWORD_PRESETS.hotels;
  }
  if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming") || c.includes("saloon")) {
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

  // Default to Restaurant
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
  const categoryPreset = getKeywordPresetForCategory(merchant.category || merchant.businessType, merchant.name);

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
