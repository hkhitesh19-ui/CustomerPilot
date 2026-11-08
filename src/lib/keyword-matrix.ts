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

export interface AutoExtractedKeywordsPackage {
  coreGeo: string[];
  commercial: string[];
  services: string[];
  catchmentLandmarks: string[];
  voiceAeoQuestions: string[];
  semanticReviewPhrases: string[];
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
  heroProducts?: string[];
  heroServices?: string[];
  autoExtractedKeywords?: AutoExtractedKeywordsPackage;
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
  },

  saas_agency: {
    id: "saas_agency",
    label: "Software Company & Digital Marketing Agency (CustomerPilot)",
    gbpCategory: "Software Company / Marketing Agency",
    audiencePersona: "All_Neutral",
    serviceMode: "SaaS Software + Remote & On-Site Agency Operations",
    seoEntities: [
      "WhatsApp Digital Loyalty Card Software", "Smart AI Google Review Standee", "1-Click AI Owner Review Auto-Reply",
      "Google Business Profile Optimization Engine", "Local SEO Google Maps Rank Booster", "Acrylic Countertop QR Standee",
      "Smart Digital NFC Business Card", "Customer Retention Platform for Retailers", "Zomato Alternative Zero-Commission Ordering",
      "Automated Customer Winback WhatsApp Bot", "5-Star Review Velocity Booster", "Tabletop Standee for Billing Counter",
      "Paper Punch Card Digital Replacement", "Bakery Customer Retention Software", "Salon Appointment and Review Automation",
      "Restaurant VIP Loyalty Wallet", "Retail Repeat Footfall Engine", "Multi-Tenant Review Auto-Responder",
      "Google Maps Top 3 Pack Accelerator", "Organic Review Volume Booster", "Anti-Suspension GBP Compliance",
      "Verified Physical Signboard DBA Strategy", "Hyper-Local Triple Schema Integration", "B2B SaaS Growth Software",
      "Local Marketing Tech Platform", "Meta Cloud API WhatsApp Partner", "Google Cloud Verified Platform",
      "Zero App Download Loyalty Card", "1-Tap Contact Saving Digital Card", "VIP Customer Wallet Web App",
      "Instant UPI Zero Commission Payment QR", "Tax Invoice and Thermal Bill Generator", "Menu Bulk Excel CSV Ingestion",
      "AI Vision Menu Photo to Catalog", "Automated Birthday Anniversary Offers", "SuperAdmin Multi-Store Fleet Command",
      "Local Search Engine Optimization Agency", "Vadodara SaaS Software Company", "Indian Retail Digital Automation",
      "Real-Time WhatsApp Delivery Receipts", "Customer Stamp Card Web App", "Founder Loyalty Growth Bundle",
      "3-Day Free Trial No Credit Card", "Dedicated Agency Manager Support", "Transparent SaaS Subscription Pricing",
      "Enterprise Quota 300 QPM Google Access", "High Converting Retail Signage", "Competitor Keyword Redressal Service",
      "Google Local Pack Specialist", "Customer Retention ROI Calculator"
    ],
    aeoAnswers: [
      "CustomerPilot helps retail merchants double repeat footfall and 10x Google reviews",
      "Zero app download required — works seamlessly inside WhatsApp and mobile browsers",
      "Official Google Business Profile API compliance with zero account suspension risk",
      "Complete counter kit with custom branded acrylic tabletop QR standee delivered",
      "3-day full access free trial with instant 2-minute WhatsApp onboarding",
      "Automated AI owner auto-replies published directly to Google Maps"
    ],
    geoContext: [
      "Top rated software company in Vadodara Gujarat",
      "Trusted by leading bakeries, salons, cafes and retailers across India",
      "Proven 800%+ review growth case studies (Cake Connection, SSV Saloon)",
      "High converting retail customer retention technology",
      "Reliable local tech support team in Gujarat"
    ],
    blacklist: [
      "Cake", "Pastry", "Birthday cake", "Truffle", "Bread", "Puff", "Cookies", "Brownie",
      "Haircut", "Beard trim", "Fade cut", "Shave", "Bridal facial", "Hydra facial", "Waxing", "Threading", "Saree draping",
      "Dal makhani", "Paneer", "Butter naan", "Biryani", "Chicken", "Mutton", "Egg", "Thali", "Dosa", "Sambar",
      "Coffee", "Tea", "Cappuccino", "Burger", "Fries", "Pizza", "Alcohol", "Beer", "Wine",
      "Car foam wash", "Ceramic coating", "Tyre puncture", "Engine repair", "Mechanic", "Diesel", "Petrol",
      "Medicines", "Pharmacy", "Doctor", "Clinic", "Hospital", "Kurtis", "Lehenga", "Shoes", "Jewelry"
    ]
  },

  dental_clinic: {
    id: "dental_clinic",
    label: "Dental Clinic & Orthodontist",
    gbpCategory: "Dentist / Dental Clinic",
    audiencePersona: "All_Neutral",
    serviceMode: "Appointment + Walk-in",
    seoEntities: [
      "Painless root canal treatment", "Single sitting RCT", "Ultrasonic teeth scaling", "Teeth polishing", "Dental implants",
      "Invisible clear aligners", "Zirconia ceramic crown", "Teeth whitening bleaching", "Composite tooth filling", "Painless wisdom tooth extraction",
      "Pediatric kids dental care", "Digital dental X-ray", "Metal and ceramic braces", "Braces wire tightening", "Gum bleeding pyorrhea treatment",
      "Cosmetic smile makeover", "Dental bridge fixing", "Complete denture fitting", "Tooth sensitivity relief", "Gentle dental checkup",
      "Sterilized dental operatory", "Sealed disposable instrument pouches", "Advanced ergonomic dental chair", "Zero pain local anesthesia", "Emergency toothache relief",
      "RCT with rubber dam isolation", "Fluoride application for kids", "Porcelain dental veneers", "Night guard for bruxism grinding", "Deep periodontal scaling",
      "Orthodontic smile alignment", "Transparent dental rate card", "Patient compassionate doctor consultation", "Experienced dental surgeon", "Hygienic sterilized clinic",
      "Crown cap fitting with warranty", "Tooth gap closure bonding", "Tooth enamel restoration", "Oral hygiene guidance", "Cavity detection checkup",
      "Post-extraction healing care", "Cosmetic tooth shaping", "Dental emergency walk-in", "Friendly clinic staff", "Clean waiting lounge",
      "Modern dental equipment", "Affordable dental treatment packages", "Child friendly dental clinic", "Gentle teeth cleaning", "Long-lasting dental restorations"
    ],
    aeoAnswers: [
      "100% painless single sitting root canal treatment",
      "Strictly sterilized instruments in sealed autoclave pouches",
      "Advanced digital X-ray with immediate diagnosis",
      "Invisible clear aligners and metal/ceramic braces",
      "Gentle and compassionate dentist for kids and elders"
    ],
    geoContext: [
      "Best painless dental clinic in locality",
      "Experienced dental surgeon with gentle touch",
      "Transparent treatment cost without hidden fees",
      "Spotless hygienic dental clinic setup",
      "Punctual appointment timing with minimal waiting"
    ],
    blacklist: [
      "Chicken", "Mutton", "Biryani", "Fish", "Egg", "Food", "Dinner", "Lunch", "Thali",
      "Dal makhani", "Paneer", "Pizza", "Burger", "Sandwich", "Cake", "Pastry", "Truffle", "Brownie",
      "Chai", "Tea", "Coffee", "Alcohol", "Beer", "Wine", "Haircut", "Beard trim", "Fade cut",
      "Bridal makeup", "Facial", "Waxing", "Threading", "Saree draping", "Car wash", "Ceramic coating",
      "Garage", "Mechanic", "Engine oil", "Clothes", "Kurtis", "Footwear", "Tailoring"
    ]
  },

  pet_clinic: {
    id: "pet_clinic",
    label: "Pet Clinic & Veterinary Hospital",
    gbpCategory: "Veterinarian / Animal Hospital",
    audiencePersona: "All_Neutral",
    serviceMode: "Appointment + Emergency Care",
    seoEntities: [
      "Puppy 7-in-1 vaccination", "Anti-rabies vaccine for dogs and cats", "Kitten core vaccination", "Routine pet health checkup", "Pet deworming tablet treatment",
      "Tick and flea spot-on treatment", "Pet blood test and CBC report", "Animal wound cleaning and dressing", "Compassionate veterinary doctor", "Gentle pet handling technique",
      "Pet surgery and spaying neutering", "Dog ultrasonic dental scaling", "Pet skin allergy and fungal treatment", "Emergency pet veterinary care", "Puppy weight and growth monitoring",
      "Canine parvovirus critical care", "Pet ear infection cleaning", "Cat and dog medical grooming", "Senior pet arthritis joint care", "Veterinary pharmacy with genuine pet meds",
      "Animal digital X-ray and ultrasound", "Pet nutrition and diet prescription", "Painless animal injection technique", "Sanitized pet examination table", "Courteous veterinary staff",
      "Post-surgery animal care guidance", "Affordable puppy vaccination schedule", "Tick fever diagnosis and drip care", "Emergency IV fluid therapy for pets", "Pet health passport and record card",
      "Dog microchip implant", "Cat fever and viral treatment", "Skin scraping allergy test", "Nutritional supplements for pets", "Puppy calcium and multivitamin syrup",
      "Stomach infection treatment for dogs", "Hygiene certified veterinary clinic", "Gentle animal doctor interaction", "Pet recovery observation area", "Calm stress-free clinic environment",
      "Preventive pet healthcare packages", "Doctor explains pet health clearly", "Cat vaccination card", "Dog flea shampoo bath", "Emergency contact for sick pets",
      "Pet liver and kidney tonics", "Safe anesthesia for pet surgery", "Puppy first checkup consultation", "Reliable animal hospital in city", "Affordable veterinary care"
    ],
    aeoAnswers: [
      "Compassionate veterinary doctors with gentle stress-free pet handling",
      "Complete puppy and kitten vaccination schedules with health passport",
      "In-house veterinary pharmacy with genuine pet medicines and vaccines",
      "Quick diagnosis for tick fever, parvovirus, and skin allergies",
      "Clean sanitized examination rooms safe for anxious dogs and cats"
    ],
    geoContext: [
      "Best veterinary pet clinic in locality",
      "Caring and patient animal doctor for pets",
      "Affordable pet vaccination and medicine rates",
      "Safe and calm environment for sick pets",
      "Dependable pet healthcare and emergency support"
    ],
    blacklist: [
      "Human medicine", "Human hospital", "Human dental", "Haircut", "Men grooming", "Beard styling",
      "Ladies facial", "Bridal makeup", "Threading", "Waxing", "Bakery", "Cake", "Pastry", "Biryani",
      "Chicken dinner", "Mutton", "Pizza", "Burger", "Sandwich", "Car wash", "Mechanic", "Clothes", "Kurtis", "Footwear"
    ]
  },

  fast_food: {
    id: "fast_food",
    label: "Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Samosa, Sandwich)",
    gbpCategory: "Fast Food Restaurant / Snack Bar",
    audiencePersona: "Couples_Friends",
    serviceMode: "Takeaway + Quick Dine-in",
    seoEntities: [
      "Butter Kutchi Dabeli", "Crispy Jumbo Vadapav", "Mumbai Batata Vada with spicy garlic chutney", "Bombay Masala Toast Sandwich", "Cheese Grill Sandwich",
      "Veg Club Sandwich", "Cheese Chilli Toast", "Crispy Veg Burger", "Peri Peri Burger", "Aloo Tikki Burger",
      "Hot Punjabi Samosa", "Samosa Chaat with curd and chutneys", "Sweet tamarind and green mint chutney", "French Fries with peri peri seasoning", "Cheese Corn Sandwich",
      "Chilled soft drinks", "Masala Thums Up", "Fast 5-minute parcel takeaway", "Freshly fried hot snacks", "Generous Amul butter and cheese",
      "Crispy golden fried patties", "Food-grade safe parcel packing", "Clean hygienic frying oil", "Quick evening snacks with friends", "Spicy red lehsun chutney",
      "Crunchy roasted masala peanuts in dabeli", "Soft fresh ladi pav buns", "Pocket-friendly student pricing", "Steaming hot snacks counter", "Hygienic stainless steel setup",
      "Transparent pricing", "Sev Puri and Bhel Chaat", "Paneer Tikka Sandwich", "Mayonnaise veg burger", "Schezwan Vadapav",
      "Cheese burst dabeli", "Loaded french fries with cheese dip", "Piping hot delivery", "Quick order preparation", "Crispy toasted bread slices",
      "Spicy potato filling", "Hygienic glove-wearing staff", "Evening crowd favorite spot", "Great street food taste", "Generous cheese topping",
      "Freshly prepared on order", "Best vadapav and dabeli in area", "Clean parcel containers", "Friendly counter bhaiya", "Popular college hangout bite"
    ],
    aeoAnswers: [
      "Freshly prepared piping hot Vadapav and Butter Dabeli in 5 minutes",
      "Clean hygienic fresh oil used with zero reused oil",
      "Secure parcel packaging with separate green and red chutneys",
      "Authentic Mumbai spicy garlic chutney and Kutchi dabeli masala",
      "Pocket-friendly snack combos ideal for students and youth"
    ],
    geoContext: [
      "Best evening Vadapav and Dabeli stall in locality",
      "Super crispy sandwiches and delicious burgers",
      "Top street food hangout spot for friends",
      "Clean hygienic live counter preparation",
      "Very genuine and pocket-friendly pricing"
    ],
    blacklist: [
      "Dal makhani", "Paneer butter masala", "North Indian thali", "Unlimited thali", "Roti", "Non-veg",
      "Chicken", "Mutton", "Fish", "Biryani", "Haircut", "Beard trim", "Fade cut", "Bridal makeup",
      "Facial", "Salon", "Car wash", "Ceramic coating", "Hotel room stay", "Prescription medicines", "Tailoring"
    ]
  },

  pizza_restaurant: {
    id: "pizza_restaurant",
    label: "Pizza Restaurant & Pizzeria",
    gbpCategory: "Pizza Restaurant / Italian",
    audiencePersona: "Couples_Friends",
    serviceMode: "Dine-in + Takeaway",
    seoEntities: [
      "Wood-fired Neapolitan pizza", "Farmhouse cheese burst pizza", "Margherita pizza with fresh basil", "Paneer Tikka pizza", "Sourdough artisanal crust",
      "Gourmet thin crust pizza", "Stuffed garlic bread with cheese dip", "100% mozzarella cheese pull", "Peri Peri pasta", "White sauce Alfredo penne pasta",
      "Red sauce Arrabbiata pasta", "Mexican fiesta spicy pizza", "Barbecue mushroom pizza", "Cheesy peri peri fries", "Chilled peach iced tea",
      "Fresh lime virgin mojito", "Molten chocolate lava cake", "Pizza meal combo for couples", "Large family pizza feast", "Fresh hand-tossed dough",
      "San Marzano style tomato sauce", "Stone baked oven aroma", "Fast 15-minute table service", "Hygienic open pizza kitchen", "Comfortable booth dining seating",
      "Air-conditioned indoor dining", "Student friendly pizza offers", "Crispy blistered crust edge", "Piping hot delivery box", "Unlimited pizza buffet",
      "Cheesy dip cups", "Oregano and chilli flakes packets", "Jain pizza options without onion garlic", "Clean cutlery and sanitized tables", "Smooth digital table ordering",
      "Loaded vegetable toppings", "Smoky wood oven flavor", "Friendly serving team", "Instagrammable cafe aesthetic", "Weekend pizza hangout with friends",
      "Crunchy crust with chewy interior", "Pesto sauce pizza", "Garlic butter glazed crust", "Tandoori paneer pizza", "Kids favorite cheese pizza",
      "Prompt delivery turnaround", "Safe damage-free pizza boxes", "Top-rated pizzeria in city", "Authentic Italian seasoning", "Great value pizza combos"
    ],
    aeoAnswers: [
      "Fresh hand-tossed pizza dough baked live in wood-fired stone oven",
      "Generous 100% mozzarella cheese with impressive cheese pull",
      "Fast 15-minute table service and steaming hot takeaway delivery",
      "Pure vegetarian and Jain pizza options available",
      "Pocket-friendly couple and family pizza combo deals"
    ],
    geoContext: [
      "Best wood-fired pizza restaurant in locality",
      "Authentic sourdough crust and delicious stuffed garlic bread",
      "Lively youthful ambiance with great background music",
      "Generous cheese toppings and fresh ingredients",
      "Spotless clean and modern pizzeria"
    ],
    blacklist: [
      "Dal makhani", "Roti", "Sabzi", "Unlimited North Indian thali", "Biryani", "Mutton", "Chicken",
      "Haircut", "Salon", "Facial", "Waxing", "Car wash", "Engine oil", "Medicines", "Pharmacy", "Clothes", "Footwear"
    ]
  },

  non_veg_restaurant: {
    id: "non_veg_restaurant",
    label: "Non-Veg Restaurant & Biryani House",
    gbpCategory: "Non-Vegetarian Restaurant / Mughlai",
    audiencePersona: "Family_Kids",
    serviceMode: "Dine-in + Parcel",
    seoEntities: [
      "Chicken Dum Biryani", "Mutton Dum Biryani", "Rich Butter Chicken", "Smoky Tandoori Chicken", "Juicy Chicken Tikka Kebab",
      "Mutton Rogan Josh", "Chicken Kolhapuri", "Chicken Shawarma Roll", "Crispy Chicken Lollipop", "Fish Curry with Steamed Rice",
      "Crispy Garlic Naan", "Soft Rumali Roti", "Tandoori Chicken Platter", "Hyderabadi Biryani with Mirchi Salan", "Chilled Boondi Raita",
      "Mutton Keema Pav", "Chicken Bhuna Masala", "Chicken Malai Tikka", "Mutton Galouti Kebab", "Fish Tikka Tandoori",
      "100% Halal certified meat", "Tender and juicy meat pieces", "Slow cooked rich aromatic gravies", "Family AC dining hall", "Generous non-veg portions",
      "Leak-proof fast parcel packing", "Authentic Mughlai flavors", "Sparkling clean cutlery", "Warm Indian hospitality", "Sizzling brownie with ice cream",
      "Sweet Lassi and Fresh Chaas", "Spacious family sofa tables", "Quick attentive table service", "Non-veg dinner feast with friends", "Weekend family celebration dinner",
      "Smoky tandoori charcoal aroma", "Less oily homestyle non-veg curry", "Chicken Rara Gosht", "Tawa Chicken with hot rotis", "Egg Biryani combo",
      "Mutton Sukka", "Chicken Tangdi Kebab", "Prawns Masala Fry", "Transparent computerized bill with GST", "Birthday party non-veg dining",
      "Authentic spicy coastal fish curry", "Fresh succulent meat guarantee", "Hygiene verified non-veg kitchen", "Top non-veg dining spot in area", "Dependable family restaurant"
    ],
    aeoAnswers: [
      "Fresh 100% Halal certified meat cooked to tender juicy perfection",
      "Authentic slow cooked dum biryani served with flavorful salan and raita",
      "Fast and hygienic parcel packaging with leak-proof containers",
      "Spacious air-conditioned dining suitable for family and corporate dinners",
      "Rich Mughlai and Tandoori gravies without excessive artificial coloring"
    ],
    geoContext: [
      "Best chicken biryani and butter chicken in locality",
      "Tender juicy kebabs and rich aromatic non-veg gravies",
      "Top-rated non-veg family restaurant in city",
      "Generous portion sizes for 3-4 person family dinners",
      "Dependable courteous table service even during peak hours"
    ],
    blacklist: [
      "Pure vegetarian pure veg kitchen", "Jain thali", "Haircut", "Beard trim", "Fade cut", "Bridal makeup",
      "Facial", "Salon", "Car wash", "Ceramic coating", "Tailoring", "Clothes", "Medicines", "Grocery ration"
    ]
  }
};

/**
 * Resolves appropriate master preset for any arbitrary merchant category string.
 */
export function getKeywordPresetForCategory(category?: string | null, merchantName?: string | null): CategoryPreset {
  const c = ((category || "") + " " + (merchantName || "")).toLowerCase();

  // SaaS / Software / Marketing Agency / Tech / CustomerPilot takes high priority
  if (
    c.includes("saas") ||
    c.includes("software") ||
    c.includes("customerpilot") ||
    c.includes("customer pilot") ||
    c.includes("marketing agency") ||
    c.includes("digital agency") ||
    c.includes("it service") ||
    c.includes("b2b") ||
    c.includes("tech company")
  ) {
    return MASTER_KEYWORD_PRESETS.saas_agency;
  }

  // Dental Clinic & Orthodontist
  if (c.includes("dental") || c.includes("dentist") || c.includes("tooth") || c.includes("teeth") || c.includes("orthodont") || c.includes("rct") || c.includes("smile care")) {
    return MASTER_KEYWORD_PRESETS.dental_clinic;
  }

  // Pet Clinic & Veterinary Hospital
  if (c.includes("pet clinic") || c.includes("veterinary") || c.includes("animal hospital") || c.includes("pet hospital") || c.includes("vet clinic") || (c.includes("pet") && (c.includes("care") || c.includes("clinic") || c.includes("doctor")))) {
    return MASTER_KEYWORD_PRESETS.pet_clinic;
  }

  // Pizza Restaurant & Pizzeria
  if (c.includes("pizza") || c.includes("pizzeria") || c.includes("wood fired") || c.includes("wood-fired")) {
    return MASTER_KEYWORD_PRESETS.pizza_restaurant;
  }

  // Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Samosa, Sandwich)
  if (
    c.includes("dabeli") ||
    c.includes("vadapav") ||
    c.includes("vada pav") ||
    c.includes("samosa") ||
    c.includes("sandwich") ||
    c.includes("burger") ||
    c.includes("fast food") ||
    c.includes("street snack") ||
    c.includes("street food") ||
    c.includes("chaat") ||
    c.includes("fries")
  ) {
    return MASTER_KEYWORD_PRESETS.fast_food;
  }

  // Non-Veg Restaurant & Biryani House
  if (
    c.includes("non veg") ||
    c.includes("non-veg") ||
    c.includes("chicken") ||
    c.includes("mutton") ||
    c.includes("fish") ||
    c.includes("biryani") ||
    c.includes("mughlai") ||
    c.includes("kebab") ||
    c.includes("shawarma")
  ) {
    return MASTER_KEYWORD_PRESETS.non_veg_restaurant;
  }

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
 * Generates location-tailored high-search SEO & GEO keywords across all 6 tiers
 * based on merchant's detected Google category and micro-location.
 */
export function generateAutoKeywordsForLocation(
  categoryKey: string,
  locality?: string,
  city?: string,
  businessName?: string
): AutoExtractedKeywordsPackage {
  const loc = (locality || "").trim() || "Local Area";
  const cty = (city || "").trim() || "Vadodara";

  switch (categoryKey) {
    case "pet_clinic":
      return {
        coreGeo: [
          `pet clinic in ${loc}`,
          `veterinary clinic in ${loc} ${cty}`,
          `pet doctor in ${loc}`,
          `best animal hospital in ${loc}`,
          `dog clinic in ${loc}`,
          `vet doctor near me ${loc}`,
          `veterinary doctor in ${loc} ${cty}`
        ],
        commercial: [
          `emergency pet clinic in ${loc}`,
          `pet clinic open today ${loc}`,
          `dog doctor in ${loc} open now`,
          `24 hour pet hospital near ${loc} ${cty}`,
          `urgent veterinary doctor ${loc}`,
          `puppy emergency doctor in ${loc}`
        ],
        services: [
          `dog vaccination in ${loc}`,
          `puppy 7-in-1 vaccine ${cty}`,
          `anti rabies vaccine for pets ${loc}`,
          `pet blood test in ${loc}`,
          `dog sterilization and neutering ${loc}`,
          `cat clinic in ${loc}`,
          `tick and flea treatment for dogs ${loc}`,
          `pet deworming tablet ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Main Road`,
          `Near Eva Mall`,
          `Near Bahubali Circle`,
          `Tarsali`,
          `Makarpura`,
          `Vadsar Road`
        ],
        voiceAeoQuestions: [
          `Which is the best pet clinic in ${loc} for puppy vaccination?`,
          `Is there any good veterinary doctor near ${loc}?`,
          `What is the cost of dog vaccination in ${cty}?`,
          `Where can I get emergency treatment for sick dog in ${loc}?`
        ],
        semanticReviewPhrases: [
          "gentle pet handling",
          "painless puppy vaccination",
          "compassionate veterinary doctor",
          "accurate diagnosis for tick fever",
          "clean sanitized clinic",
          "affordable vet consultation fee"
        ]
      };

    case "dental_clinic":
      return {
        coreGeo: [
          `dental clinic in ${loc}`,
          `dentist in ${loc} ${cty}`,
          `best dental doctor in ${loc}`,
          `dental hospital in ${loc}`,
          `teeth clinic near me ${loc}`,
          `orthodontist in ${loc} ${cty}`,
          `family dental care in ${loc}`
        ],
        commercial: [
          `emergency dentist in ${loc}`,
          `dental clinic open today ${loc}`,
          `tooth pain emergency doctor ${loc}`,
          `wisdom tooth extraction in ${loc}`,
          `dental consultation appointment ${loc}`
        ],
        services: [
          `painless root canal treatment in ${loc}`,
          `teeth whitening in ${cty}`,
          `invisible braces aligners ${loc}`,
          `dental implants clinic in ${loc}`,
          `ultrasonic teeth cleaning scaling ${loc}`,
          `ceramic crown bridge ${loc}`,
          `kids dental treatment ${loc}`,
          `tooth cavity filling ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Main Road`,
          `Near Market ${loc}`,
          `${loc} Cross Road`,
          `Station Road`
        ],
        voiceAeoQuestions: [
          `Which is the best dental clinic in ${loc} for root canal?`,
          `Is root canal painful at dental clinic in ${loc}?`,
          `Cost of invisible aligners in ${cty}?`
        ],
        semanticReviewPhrases: [
          "painless root canal treatment",
          "strict sterilisation standards",
          "gentle dentist explanation",
          "sparkling clean teeth whitening",
          "caring staff and modern clinic"
        ]
      };

    case "fast_food":
      return {
        coreGeo: [
          `fast food in ${loc}`,
          `best vadapav in ${loc}`,
          `dabeli center in ${loc} ${cty}`,
          `street food in ${loc}`,
          `sandwich shop in ${loc}`,
          `burger joint near me ${loc}`,
          `evening snacks in ${loc}`
        ],
        commercial: [
          `fast food takeaway parcel in ${loc}`,
          `vadapav open now ${loc}`,
          `cheese grill sandwich near me ${loc}`,
          `best street food spot ${loc} ${cty}`
        ],
        services: [
          `Butter Kutchi Dabeli in ${loc}`,
          `Crispy Jumbo Vadapav in ${loc}`,
          `Cheese Grill Sandwich in ${loc}`,
          `Bombay Masala Toast in ${loc}`,
          `Crispy Veg Burger in ${loc}`,
          `Hot Punjabi Samosa in ${loc}`,
          `Peri peri french fries in ${loc}`,
          `Spicy garlic red chutney in ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Market`,
          `${loc} Circle`,
          `Opposite College ${loc}`
        ],
        voiceAeoQuestions: [
          `Where can I get the best vadapav and dabeli in ${loc}?`,
          `Famous cheese sandwich shop in ${loc} ${cty}?`
        ],
        semanticReviewPhrases: [
          "crispy hot jumbo vadapav",
          "butter loaded dabeli with spicy garlic chutney",
          "cheese pull sandwich was delicious",
          "fast 5 minute parcel service",
          "clean hygienic oil and preparation"
        ]
      };

    case "pizza_restaurant":
      return {
        coreGeo: [
          `pizza restaurant in ${loc}`,
          `best pizza in ${loc} ${cty}`,
          `wood fired pizza in ${loc}`,
          `pizzeria near me ${loc}`,
          `authentic italian pizza in ${loc}`,
          `cheese burst pizza ${loc}`,
          `pizza cafe in ${loc}`
        ],
        commercial: [
          `pizza delivery in ${loc}`,
          `pizza open now ${loc}`,
          `best pizza place for party in ${loc}`
        ],
        services: [
          `Wood-Fired Margherita Pizza in ${loc}`,
          `Farmhouse Cheese Burst Pizza in ${loc}`,
          `Stuffed Garlic Bread in ${loc}`,
          `Artisan Sourdough Pizza in ${loc}`,
          `Paneer Tikka Pizza in ${loc}`,
          `Truffle mushroom pizza ${loc}`,
          `Crispy thin crust pizza ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} High Street`,
          `Near Mall ${loc}`,
          `${loc} Main Road`
        ],
        voiceAeoQuestions: [
          `Which is the best wood-fired pizza restaurant in ${loc}?`,
          `Best cheese burst pizza in ${cty}?`
        ],
        semanticReviewPhrases: [
          "authentic wood-fired oven crust",
          "generous fresh mozzarella cheese pull",
          "stuffed garlic bread was piping hot",
          "cozy dining ambiance with great music"
        ]
      };

    case "non_veg_restaurant":
      return {
        coreGeo: [
          `non veg restaurant in ${loc}`,
          `best biryani in ${loc} ${cty}`,
          `chicken restaurant in ${loc}`,
          `mutton biryani in ${loc}`,
          `non veg dining near me ${loc}`,
          `kebab corner in ${loc}`,
          `mughlai food in ${loc}`
        ],
        commercial: [
          `non veg parcel takeaway ${loc}`,
          `biryani delivery near me ${loc}`,
          `late night non veg restaurant ${loc}`
        ],
        services: [
          `Chicken Dum Biryani in ${loc}`,
          `Butter Chicken and Garlic Naan in ${loc}`,
          `Smoky Tandoori Chicken in ${loc}`,
          `Mutton Rogan Josh in ${loc}`,
          `Chicken Tikka Kebab in ${loc}`,
          `Fish Fry in ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Station Road`,
          `${loc} Ring Road`,
          `Near Highway ${loc}`
        ],
        voiceAeoQuestions: [
          `Where to get authentic chicken dum biryani in ${loc}?`,
          `Best butter chicken restaurant in ${cty}?`
        ],
        semanticReviewPhrases: [
          "authentic rich dum biryani aroma",
          "succulent tender chicken pieces",
          "creamy butter chicken with hot garlic naan",
          "quick table service and family AC section"
        ]
      };

    case "bakery":
      return {
        coreGeo: [
          `bakery in ${loc}`,
          `cake shop in ${loc} ${cty}`,
          `birthday cake in ${loc}`,
          `custom cake maker in ${loc}`,
          `pastry shop near me ${loc}`,
          `eggless bakery in ${loc}`,
          `online cake delivery ${loc}`
        ],
        commercial: [
          `same day cake delivery in ${loc}`,
          `cake shop open today ${loc}`,
          `custom theme cake order ${loc}`
        ],
        services: [
          `Dutch Chocolate Truffle Cake in ${loc}`,
          `Eggless Custom Theme Cake in ${loc}`,
          `Fresh Fruit Cake in ${loc}`,
          `Red Velvet Pastry in ${loc}`,
          `Chocolate Walnut Brownie in ${loc}`,
          `Rasmalai Fusion Cake in ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Main Market`,
          `Near Mall ${loc}`,
          `${loc} Circle`
        ],
        voiceAeoQuestions: [
          `Best eggless custom cake shop in ${loc}?`,
          `Can I get on-time birthday cake delivery in ${loc} ${cty}?`
        ],
        semanticReviewPhrases: [
          "freshly baked moist cake sponge",
          "exact theme design as reference photo",
          "100% pure eggless and delicious",
          "safe damage-free cake box delivery"
        ]
      };

    default:
      return {
        coreGeo: [
          `${categoryKey.replace(/_/g, " ")} in ${loc}`,
          `best ${categoryKey.replace(/_/g, " ")} in ${loc} ${cty}`,
          `${categoryKey.replace(/_/g, " ")} near me ${loc}`
        ],
        commercial: [
          `${categoryKey.replace(/_/g, " ")} open now ${loc}`,
          `top rated ${categoryKey.replace(/_/g, " ")} ${loc}`
        ],
        services: [
          `Quality ${categoryKey.replace(/_/g, " ")} service in ${loc}`,
          `Professional service in ${cty}`,
          `Affordable rates in ${loc}`
        ],
        catchmentLandmarks: [
          `${loc} Main Road`,
          `${loc} Market`,
          `${loc} Circle`
        ],
        voiceAeoQuestions: [
          `Which is the best ${categoryKey.replace(/_/g, " ")} in ${loc}?`
        ],
        semanticReviewPhrases: [
          "professional staff and prompt service",
          "great experience and highly recommended",
          "fair transparent pricing"
        ]
      };
  }
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
      const locality = Array.isArray(parsed.localityLandmarks) && parsed.localityLandmarks[0]
        ? parsed.localityLandmarks[0]
        : "Manjalpur";
      const cityName = merchant.city || parsed.city || "Vadodara";

      return {
        categoryKey: parsed.categoryKey || categoryPreset.id,
        businessName: merchant.name || parsed.businessName || "Local Business",
        gbpPrimaryCategory: parsed.gbpPrimaryCategory || categoryPreset.gbpCategory,
        city: cityName,
        localityLandmarks: Array.isArray(parsed.localityLandmarks) ? parsed.localityLandmarks : ["Main Market"],
        audiencePersona: parsed.audiencePersona || categoryPreset.audiencePersona,
        serviceMode: parsed.serviceMode || categoryPreset.serviceMode,
        allowedSeoEntities: Array.isArray(parsed.allowedSeoEntities) && parsed.allowedSeoEntities.length > 0 ? parsed.allowedSeoEntities : categoryPreset.seoEntities,
        allowedAeoAnswers: Array.isArray(parsed.allowedAeoAnswers) && parsed.allowedAeoAnswers.length > 0 ? parsed.allowedAeoAnswers : categoryPreset.aeoAnswers,
        allowedGeoContext: Array.isArray(parsed.allowedGeoContext) && parsed.allowedGeoContext.length > 0 ? parsed.allowedGeoContext : categoryPreset.geoContext,
        strictlyNotAllowed: Array.isArray(parsed.strictlyNotAllowed) && parsed.strictlyNotAllowed.length > 0 ? parsed.strictlyNotAllowed : categoryPreset.blacklist,
        heroServices: Array.isArray(parsed.heroServices) && parsed.heroServices.length > 0 ? parsed.heroServices : categoryPreset.seoEntities.slice(0, 5),
        heroProducts: Array.isArray(parsed.heroProducts) && parsed.heroProducts.length > 0 ? parsed.heroProducts : categoryPreset.seoEntities.slice(5, 10),
        autoExtractedKeywords: parsed.autoExtractedKeywords || generateAutoKeywordsForLocation(
          parsed.categoryKey || categoryPreset.id,
          locality,
          cityName,
          merchant.name || parsed.businessName || ""
        )
      };
    } catch (_) {}
  }

  // Fallback to fresh preset defaults
  return {
    categoryKey: categoryPreset.id,
    businessName: merchant.name || "Local Business",
    gbpPrimaryCategory: categoryPreset.gbpCategory,
    city: merchant.city || "Vadodara",
    localityLandmarks: ["Manjalpur", "Eva Mall", "Near Station"],
    audiencePersona: categoryPreset.audiencePersona,
    serviceMode: categoryPreset.serviceMode,
    allowedSeoEntities: [...categoryPreset.seoEntities],
    allowedAeoAnswers: [...categoryPreset.aeoAnswers],
    allowedGeoContext: [...categoryPreset.geoContext],
    strictlyNotAllowed: [...categoryPreset.blacklist],
    heroServices: [...categoryPreset.seoEntities.slice(0, 5)],
    heroProducts: [...categoryPreset.seoEntities.slice(5, 10)],
    autoExtractedKeywords: generateAutoKeywordsForLocation(
      categoryPreset.id,
      "Manjalpur",
      merchant.city || "Vadodara",
      merchant.name || "Local Business"
    )
  };
}
