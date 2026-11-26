// CustomerPilot — Dynamic Anti-Repetition Google Review Engine
// Generates diverse, authentic, human-like 5-star Google review drafts
// Grounded with Merchant Keyword Profile, 50 Allowed + 50 Blacklisted Entities,
// Gender & Grammar Persona, and Zero Food/Delivery Hallucination Guardrails.

import { resolveMerchantKeywordProfile, KeywordProfile } from "./keyword-matrix"

export interface ReviewDraftOptions {
  draft1: string // Quality & Core Experience (with allowed SEO keywords)
  draft2: string // Service & Vibes (conversational Hinglish with mild crowd marker)
  draft3: string // Short 1-Liner (punchy, high conversion)
}

interface FallbackReviewItem {
  draft1: string
  draft2: string
  draft3: string
}

// Category-specific rich pool of authentic Indian customer reviews
const BAKERY_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Super fresh chocolate truffle cake with rich cocoa layers. Delivered right on time for our celebration.",
    draft2: "Eggless fresh fruit cake ka taste badiya tha. Sunday rush ke baad bhi safe packing mili.",
    draft3: "Super fresh cake and safe packing. Live counter hygiene properly maintained thi, loved it!"
  },
  {
    draft1: "Tried their Rasmalai cake for a family birthday. Not overly sweet, perfect sponge texture and loaded with real dry fruits.",
    draft2: "Ordered on short notice on Saturday evening. Counter was crowded but the staff handed over my box in 10 minutes flat.",
    draft3: "100% pure eggless and melted in the mouth. Best bakery in the locality!"
  },
  {
    draft1: "Red velvet pastry and walnut brownie combo was unbelievable. Sponge super soft tha aur cream bilkul light thi.",
    draft2: "Shop pe thoda rush tha evening me, par counter boy was very polite. Safe sealed packaging mili.",
    draft3: "Delicious fresh pastries at very genuine rates. Highly recommended!"
  },
  {
    draft1: "Belgian dark chocolate cake ordered for our anniversary. Presentation photo se bhi zyada premium aayi.",
    draft2: "Delivery executive handled the cake box with care, zero damage to the design. Very dependable service.",
    draft3: "Rich chocolate flavor, elegant design and on-time doorstep delivery."
  },
  {
    draft1: "Pineapple gateau was juicy, fresh and light. Perfect sweetness balance for kids and elders alike.",
    draft2: "Sunday afternoon rush tha billing pe, par cake 5 minute me ready karke candles aur knife ke sath diya.",
    draft3: "Freshly baked cake, neat hygienic packaging and very courteous team."
  },
  {
    draft1: "Blueberry cheesecake slice and hazelnut crunch pastry taste me ekdum top-class the. Freshness unmatchable thi.",
    draft2: "Called to customize the name on top, unhone bina extra charges ke beautifully piping kar di.",
    draft3: "Authentic taste, soft fresh base and great variety of desserts."
  },
  {
    draft1: "Ordered customized fondant birthday cake. Design exactly jaisa reference picture bheja tha waisa hi banaya.",
    draft2: "Evening peak hours me thoda waiting tha par delivery boy delivered it safely without any tilt or melt.",
    draft3: "Spot-on custom cake design and heavenly taste. Made our celebration special!"
  },
  {
    draft1: "Cupcake hamper and dry fruit cookies super fresh the. Packaging premium aur gifting ke liye ideal thi.",
    draft2: "Counter staff guided nicely on eggless options. Smooth payment and polite interaction.",
    draft3: "Super fresh eggless treats and neat hygienic counter. Loved it!"
  }
]

const CAFE_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Hazelnut cold coffee super fresh thi aur evening vibes badiya hain. Seating comfortable hai.",
    draft2: "Cheese fries aur cappuccino taste me mast the. Thodi bheed thi Sunday ko par order quickly aa gaya.",
    draft3: "Pocket friendly cafe with great coffee and peaceful ambiance for laptop work."
  },
  {
    draft1: "Iced caramel latte paired with grilled paneer sandwich. Fresh bread, good cheese pull and perfectly balanced coffee.",
    draft2: "Weekend evening me cafe was completely packed, par music volume was decent and order 15 min me aa gaya.",
    draft3: "Great coffee aroma, chilled AC and comfortable seating. Total value for money."
  },
  {
    draft1: "Peri peri french fries were super crispy and the chocolate frappe was thick and rich.",
    draft2: "Counter pe staff polite tha aur Wi-Fi speed was genuinely fast for attending an urgent call.",
    draft3: "Crispy snacks, top notch cold beverages and cozy interior aesthetic."
  },
  {
    draft1: "Sourdough pizza and peach iced tea taste me bohot authentic the. Not oily, light on the stomach.",
    draft2: "Small cafe with great personality. Tables clean the aur order presentation kafi aesthetic tha.",
    draft3: "Peaceful spot with delicious artisanal pizzas and refreshing iced teas."
  }
]

const RESTAURANT_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Dal makhani aur butter naan ka taste proper authentic tha. Portions ache the aur garam khana mila.",
    draft2: "Family dinner ke liye shant mahaul hai. Weekend pe thodi waiting thi par service polite aur fast thi.",
    draft3: "Veg thali had authentic homestyle taste. Clean table, quick service and good pricing."
  },
  {
    draft1: "Paneer butter masala ki gravy rich aur creamy thi bina extra oil ke. Garlic naan was crisp and hot.",
    draft2: "Saturday night family dinner ke liye 15 mins waiting tha, par manager arranged comfortable seating quickly.",
    draft3: "Authentic North Indian food, generous portions and polite service."
  },
  {
    draft1: "Veg dum biryani served with chilled boondi raita was fragrant and flavorful. Rice grains long aur non-sticky the.",
    draft2: "Service staff was attentive throughout the meal. Clean crockery and quick billing.",
    draft3: "Delicious authentic biryani with great hygiene standards and fast table service."
  },
  {
    draft1: "Special unlimited thali me har sabzi ka taste unique tha. Sweets and hot rotis kept coming without asking.",
    draft2: "Rush kafi tha lunch time me, par serving staff polite aur attentive tha. AC cooling badiya thi.",
    draft3: "Authentic homestyle meal, sparkling clean tables and warm hospitality."
  }
]

const SALON_MEN_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Skin fade haircut bilkul photo jaisa diya. Rates genuine hain aur AC cooling badiya thi.",
    draft2: "Beard trim fast aur clean kiya. Thoda rush tha par fresh towel aur hygiene ka proper dhyan rakha.",
    draft3: "Relaxing head massage and clean setup. Staff polite hai aur service super quick."
  },
  {
    draft1: "Haircut and beard styling done with precision. Barber took time to understand the shape of my face.",
    draft2: "Sunday ko appointment ke bawajood 10 min wait tha, par service me koi rush nahi kiya. Sanitized scissors use kiye.",
    draft3: "Clean salon, professional hair stylists and genuine transparent pricing."
  },
  {
    draft1: "De-tan cleanup and charcoal mask treatment gave an instant fresh look. Skin feels thoroughly refreshed.",
    draft2: "Friendly staff with zero product upselling pressure. Comfortable massage chair and peaceful setup.",
    draft3: "Professional grooming services with high hygiene and courteous styling team."
  },
  {
    draft1: "Low fade haircut aur beard contour sharp diya. Finishing touch ekdum clean aur symmetric thi.",
    draft2: "Evening peak time me thoda waiting tha, par staff courteous tha aur wait comfortable AC lounge me tha.",
    draft3: "Top-notch men's grooming and hygienic haircut tools. Highly recommended!"
  }
]

// Strictly feminine, zero delivery, zero tea/cake, pure beauty parlor experience
const PARLOUR_LADIES_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Painless eyebrow threading aur upper lip karwaya. Didi ka hath bohot light hai aur parlor bilkul hygienic hai.",
    draft2: "O3+ facial ke baad skin pe instant natural glow aa gaya. Saturday rush tha par treatment me bilkul jaldi nahi ki.",
    draft3: "Super relaxing hair spa and painless threading. Staff bohot sweet hai aur rates transparent hain."
  },
  {
    draft1: "Family function se pehle hair spa aur D-tan cleanup karwaya. Hair super silky soft ho gaye aur skin glowing lag rahi hai.",
    draft2: "Parlour me female staff hai aur privacy ka full dhyan rakha. Disposable bedsheet aur sanitized tools use kiye the.",
    draft3: "Painless threading, relaxing facial massage and extremely courteous beauticians."
  },
  {
    draft1: "Pedicure and manicure service bohot relaxing thi. Sanitized tools use kiye aur dead skin properly clean ki.",
    draft2: "Staff gentle aur attentive tha. Ambiance calm tha aur AC cooling badiya thi, bina kisi product upselling ke.",
    draft3: "Very neat, hygienic setup with attentive beauticians. Totally recommended for women!"
  },
  {
    draft1: "Hydra facial aur Rica waxing karwaya. Waxing me bilkul rash nahi hua aur skin bohot soft lag rahi hai.",
    draft2: "Shaam ko appointments ki bheed thi par didi ne patiently time dekar facial massage kiya. Worth every rupee.",
    draft3: "Best ladies beauty parlor in area. Branded products used with genuine gentle care."
  },
  {
    draft1: "Engagement makeup aur saree draping karwaya tha. Makeup ekdum natural aur non-cakey tha, daylight me badiya lag raha tha.",
    draft2: "Ready hone me time exact estimate ke according laga. Hair updo dance ke baad bhi perfect set raha.",
    draft3: "Flawless long-lasting makeup and graceful saree draping. Loved the experience!"
  },
  {
    draft1: "Hair smoothening aur global hair color karwaya. Texture silky soft ho gaya aur shine natural aayi hai.",
    draft2: "Treatment ke time step-by-step care tips samjhaye. Staff polite tha aur seating comfortable thi.",
    draft3: "Professional hair care, original branded products and friendly female team."
  }
]

const SOUTH_INDIAN_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Crispy Mysore masala dosa with authentic piping hot sambar. Coconut chutney fresh aur flavorful thi.",
    draft2: "Sunday morning breakfast rush tha, par token counter se 10 min me fresh garam dosa hand over ho gaya.",
    draft3: "Authentic South Indian taste, crisp golden dosas and refreshing degree filter coffee."
  },
  {
    draft1: "Button idli and medu vada combo was steaming hot and super soft. Sambar ka spice balance perfect tha.",
    draft2: "Tables regularly sanitize ho rahe the. Self-service counter organized tha aur billing brisk thi.",
    draft3: "Mouth-melting soft idlis, crisp vadas and authentic traditional chutneys."
  }
]

const CAR_WASH_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Complete snow foam wash aur underbody pressure wash karwaya. Wheel arches se sara mud clean ho gaya.",
    draft2: "Thoda rush tha Sunday afternoon par waiting lounge me AC tha. Washing staff ne alloys ache se clean kiye.",
    draft3: "Scratch-free foam wash, sparkling glass finish and quick dependable vehicle care."
  },
  {
    draft1: "Deep interior vacuuming and dashboard conditioning made the car look showroom fresh. Odor completely gone.",
    draft2: "Boys were detail-oriented with mat cleaning and boot space. Transparent pricing bina hidden add-ons ke.",
    draft3: "Spotless interior detailing, shiny tyre polish and very courteous detailing crew."
  }
]

const CLINIC_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Doctor explained the root cause patiently bina unnecessary tests prescribe kiye. Treatment bilkul gentle tha.",
    draft2: "Appointment timing strictly follow hua. Clinic hygienic aur sterilized tha, staff polite hai.",
    draft3: "Experienced doctor, transparent diagnosis and compassionate healthcare support."
  }
]

const EDUCATION_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Faculty members are experienced and explain every concept with crystal clarity. Personal attention given to each student.",
    draft2: "Doubt solving sessions regular hoti hain aur study material structured hai. Test series se confidence boost hua.",
    draft3: "Excellent coaching institute, supportive faculty and result-oriented academic environment!"
  },
  {
    draft1: "Concept clarity aur syllabus completion dono time par hua. Batch size comfortable hai aur classrooms air-conditioned hain.",
    draft2: "Weekly tests aur performance analysis se weak areas quickly identify hue. Teachers very encouraging hain.",
    draft3: "Best coaching classes in the city for competitive exam preparation!"
  }
]

const DENTAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Painless single-sitting root canal karwaya. Doctor bohot gentle the aur sterilization standards top class the.",
    draft2: "Teeth scaling aur polishing ke baad zero sensitivity hui. Clinic spotlessly clean hai aur appointment time par start hua.",
    draft3: "Experienced dentist, completely painless treatment and very transparent pricing. Best dental clinic!"
  },
  {
    draft1: "Got composite tooth filling and dental checkup done. Doctor explained the X-ray findings patiently and clearly.",
    draft2: "Hygienic clinic with sealed disposable instruments. Staff was courteous and the procedure was completely comfortable.",
    draft3: "Gentle dental care, advanced high-tech clinic and zero waiting time. Highly recommended!"
  }
]

const PET_CLINIC_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Mera Labrador puppy ka 7-in-1 vaccination aur deworming karwaya. Vet doctor ne bohot gently handle kiya, pet bilkul calm raha poori visit mein.",
    draft2: "Clean hygienic clinic aur caring veterinary team. Doctor ne post-vaccination feeding aur care ke baare mein clearly samjhaya.",
    draft3: "Gentle vet doctor, clean clinic and genuine pet medicines. Best pet clinic for vaccinations!"
  },
  {
    draft1: "Meri billi ka skin allergy diagnosis accurately kiya aur effective treatment di. 3 din mein visible relief dikhi, cat bilkul comfortable ho gayi.",
    draft2: "Clinic sanitized hai aur staff polite hai. Emergency support bahut prompt tha, doctor ne immediately attend kiya.",
    draft3: "Compassionate vet care, stress-free for pets and transparent charges. Highly recommended!"
  },
  {
    draft1: "Mera German Shepherd ka tick fever diagnose karke IV drip aur medicines di. Doctor ne poora treatment patiently explain kiya.",
    draft2: "Weekend emergency mein bhi doctor available the. Clinic pe rush tha par pet ko immediately attend kiya aur mujhe calm kiya.",
    draft3: "Life-saving emergency pet care, 24/7 support and caring vet team. Best animal clinic!"
  },
  {
    draft1: "Golden Retriever ki spaying surgery successfully karwai. Anesthesia safe tha aur post-surgery recovery guide clear di doctor ne.",
    draft2: "Dedicated pet recovery area hai clinic mein. Staff ne surgery ke baad bhi follow-up call ki, great caring service.",
    draft3: "Safe pet surgery, expert vet doctors and excellent post-op care. Truly caring clinic!"
  },
  {
    draft1: "Kitten ka first core vaccination aur health checkup kiya. Doctor ne vaccination card di aur next schedule clearly bataya.",
    draft2: "Waiting room comfortable aur clean hai. Doctor ne kitten ko gently handle kiya, bacchi bilkul nervous nahi hui.",
    draft3: "Thorough kitten vaccination, gentle handling and informative vet. Perfect first clinic visit!"
  },
  {
    draft1: "Puppy ka parvovirus mein critical care mila. Doctor ne quickly diagnose kiya, fluids shuru kiye aur 4 din mein recovery ho gayi.",
    draft2: "24-hour emergency care available hai. Night mein bhi doctor phone pe guide kiya aur clinic available tha, bahut grateful hoon.",
    draft3: "Life-saving parvovirus treatment, round-the-clock emergency and expert vet. Hero clinic for pets!"
  },
  {
    draft1: "Dog ka ear infection properly clean karke drops prescribe ki. Doctor ne ghar pe care kaise karein clearly demonstrate kiya.",
    draft2: "Clinic mein examination table sanitized thi aur vet gloves wear karke handle kiya. Hygienic aur professional setup.",
    draft3: "Thorough ear infection treatment, hygienic clinic and caring doctor. My dog loves visiting here!"
  },
  {
    draft1: "Senior dog ki arthritis ke liye joint supplement aur physiotherapy advice mili. Doctor ne age-appropriate diet chart bhi diya.",
    draft2: "Doctor ne senior pet ke sath extra patience rakkhi. Unhurried consultation, sab kuch samjhaya bina rush kiye.",
    draft3: "Expert senior pet care, detailed diet advice and gentle doctor. Best geriatric pet clinic!"
  }
]

const FAST_FOOD_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Butter Kutchi Dabeli aur Crispy Vadapav super fresh the. Spicy red garlic chutney ka taste ekdum authentic Mumbai style tha.",
    draft2: "Evening crowd kafi tha counter pe, par 5 minute me piping hot parcel deliver kar diya. Fresh oil use karte hain.",
    draft3: "Delicious butter dabeli, crispy hot vadapav and quick polite service. Best evening street snack spot!"
  },
  {
    draft1: "Cheese Grill Sandwich aur Peri Peri Burger ka combo unbeatable tha. Bread super crisp thi aur cheese pull badiya tha.",
    draft2: "Sunday evening rush tha billing par, par counter staff brisk aur well-mannered tha. Neat food-grade parcel packing mili.",
    draft3: "Crispy delicious sandwiches, fresh burgers and pocket-friendly rates. Must-visit fast food corner!"
  }
]

const PIZZA_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Wood-fired Margherita and Farmhouse cheese burst pizza taste me unbeatable the. Crust perfectly crispy tha aur cheese pull rich tha.",
    draft2: "Stuffed garlic bread hot and cheesy serve hua. Ambiance cozy tha aur order 15 minutes me table pe aa gaya.",
    draft3: "Authentic wood-fired crust, generous mozzarella cheese and wonderful dining ambiance. Top-tier pizza!"
  },
  {
    draft1: "Tried their Paneer Tikka pizza and Alfredo pasta. Sourdough base was light on the stomach and toppings were super fresh.",
    draft2: "Weekend evening me cafe packed tha par staff attentive tha aur service prompt thi. Great youthful vibe.",
    draft3: "Mouth-watering artisanal pizzas, fresh garlic bread and polite team. Value for money family combos!"
  }
]

const NON_VEG_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Chicken Dum Biryani aur Butter Chicken ka taste proper authentic Mughlai tha. Chicken pieces juicy aur tender the.",
    draft2: "Family dinner ke liye AC dining hall comfortable tha. Garlic naan steaming hot aayi aur serving staff polite tha.",
    draft3: "Delicious aromatic biryani, rich creamy butter chicken and warm hospitality. Best non-veg restaurant in locality!"
  },
  {
    draft1: "Tandoori Chicken super smoky aur well-marinated tha. Mutton Rogan Josh gravy rich thi bina excess oil ke.",
    draft2: "Saturday night family dinner ke liye rush tha, par manager arranged comfortable table quickly. Fast parcel counter service.",
    draft3: "Top-notch non-veg food quality, generous portions and courteous service. Highly recommended!"
  }
]

const SAAS_AGENCY_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "CustomerPilot lagane ke baad hamare store ke Google reviews 3 mahine me 800% badh gaye. Counter acrylic standee ka response zabardast hai!",
    draft2: "WhatsApp digital loyalty card system se repeat customers ka footfall double ho gaya. Store dashboard simple hai aur live support fast hai.",
    draft3: "Best customer retention software for retail stores. Google Map ranking aur reviews bohot fast improve hue!"
  },
  {
    draft1: "Smart AI Google review engine works like magic. Billing counter pe customers QR scan karte hi 10 second me review post kar dete hain.",
    draft2: "1-Click AI owner review auto-reply feature ne hamara daily time bacha diya. Great software for busy store owners.",
    draft3: "Professional SaaS platform, polite team and game-changer WhatsApp loyalty system for Indian retailers."
  },
  {
    draft1: "Replaced our old paper stamp cards with CustomerPilot WhatsApp loyalty wallet. Customers love seeing their stamps on mobile.",
    draft2: "Onboarding was done in 5 minutes with zero technical hassle. Team in Vadodara provided exceptional guidance.",
    draft3: "100% value for money software. Helps genuine local businesses reach Google Maps Top 3 pack."
  },
  {
    draft1: "Customer retention aur Google review automation ke liye CustomerPilot se better koi tool nahi hai. Transparent pricing and great support.",
    draft2: "Automated WhatsApp winback messages se puraane customers wapas aane lage. Store sales me noticeable jump aaya.",
    draft3: "Highly recommended software company for retail merchants looking to grow repeat business."
  }
]

const OPTICAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Daily screen coding hours ke liye blue-cut anti-glare specs liye. Eyes me jo dry burn aur heaviness hoti thi wo completely khatam ho gayi.",
    draft2: "Shaam ko visit kiya tha, counter staff ne face cut ke hisab se lightweight acetate frame suggest kiya. Delivery within 24 hours mili.",
    draft3: "Zero-power blue-cut computer glasses with crisp clarity. Excellent anti-glare eye strain protection!"
  },
  {
    draft1: "Optometrist ne computerized auto-refractor se detail me eye test kiya. Progressive multifocal lenses me reading aur driving dono corridors bilkul smooth hain.",
    draft2: "Family ke sath gaye the, staff ne bina rush kiye 10-15 frames patiently try karwaye. Fitting zero distortion ke sath perfect mili.",
    draft3: "Crystal clear progressive vision and accurate power testing. Best optician in Vadodara!"
  },
  {
    draft1: "Polarized UV400 branded sunglasses purchase kiye highway road trip ke liye. Harsh sunlight glare bilkul cut ho gaya aur frame fit ekdum snug hai.",
    draft2: "Showroom me latest sunglasses collection kafi bada hai. Transparent rates the aur hard protective case ke sath microfiber cloth bhi diya.",
    draft3: "Stylish polarized sunglasses, genuine branded quality and very courteous customer service!"
  },
  {
    draft1: "Mera beta ke liye unbreakable flexible spectacle frame liya. School aur playground activities me safe rehta hai aur bilkul bendable hai.",
    draft2: "Optometrist ne bache ka eye checkup bohot gently aur friendly tareeqe se kiya. Beta bilkul nervous nahi hua.",
    draft3: "Durable kids eyewear frames, gentle optometrist checkup and very cooperative team!"
  },
  {
    draft1: "Rimless titanium frame with high-index ultra-thin lenses karwaya. Face par weight bilkul feel nahi hota aur professional executive look aata hai.",
    draft2: "Pehle purane glasses se nose bridge par marks aate the, yahan soft silicon nose pad fitting ke baad zero discomfort hai.",
    draft3: "Featherweight rimless titanium frame fitting and precision lens marking. Outstanding craftsmanship!"
  },
  {
    draft1: "Spectacle frame ka loose screw aur nose pads emergency me replace karwaye. Counter staff ne 5 minute me frame perfectly align kar diya.",
    draft2: "Old glasses ki ultrasonic machine deep cleaning bhi karke di bina kisi extra charge ke. Extremely polite and helpful gesture.",
    draft3: "Quick 5-minute spectacle repair, courteous staff and prompt assistance. Highly dependable!"
  },
  {
    draft1: "Daily disposable contact lenses liye. Optometrist ne lens insertion, removal aur hygienic care ki proper step-by-step training di.",
    draft2: "Whole day screen work ke baad bhi zero eye dryness ya irritation hui. Fresh sealed packaging aur genuine solution mila.",
    draft3: "Comfortable contact lens trial, expert guidance and transparent pricing. 100% satisfied!"
  },
  {
    draft1: "Night drive yellow tint anti-glare glasses banwaye. Opposite vehicles ki high-beam headlight glare se driving me bohot sukoon mila.",
    draft2: "Staff ne UV light demo tester pe anti-glare coating live check karke dikhayi. Very knowledgeable and honest guidance.",
    draft3: "Safe night driving spectacles with genuine anti-glare coating. Highly recommended for motorists!"
  },
  {
    draft1: "Dadi ke liye reading aur walking ke liye bifocal lenses banwaye. Distance aur reading lines clearly separated hain, first day se adjust ho gaya.",
    draft2: "Senior citizen ke sath staff ne bohot respect aur patience rakhi. Clear explanation diya bina kisi jaldbaazi ke.",
    draft3: "Accurate bifocal spectacles, respectful staff and timely delivery. Trusted family optical store!"
  },
  {
    draft1: "Acetate cat-eye designer frame liya everyday wear ke liye. Color subtle hai, hinges sturdy hain aur aesthetic compliments mil rahe hain.",
    draft2: "Weekend evening me rush tha billing counter pe, par team ne briskly pack karke warranty card ke sath hand over kiya.",
    draft3: "Trendy eyewear collection, aesthetic frames and reliable lens quality. Great collection!"
  },
  {
    draft1: "Original Crizal anti-reflective scratch-resistant lenses lagwaye. Dust aur fingerprints easily wipe ho jate hain, vision 100% sharp hai.",
    draft2: "Cylinder power checkup optometrist ne double-verify kiya trail frame pe. Delivery promise time se 2 ghante pehle ready ho gaya.",
    draft3: "Original scratch-resistant lenses with warranty card. Crystal sharp vision and dependable service!"
  },
  {
    draft1: "High minus power ke liye 1.67 high-index thin lenses liye. Lenses bilkul flat aur lightweight bane, thick edges bilkul nahi dikh rahe.",
    draft2: "Optometrist ne frame selection me guidance di ki high power me kaunsa frame fit best baithega. Superb technical knowledge.",
    draft3: "Ultra-thin high index lenses, flawless aesthetic finish and pocket-friendly pricing!"
  }
]

const SAREE_CLOTHING_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Wedding shopping ke liye visit kiya tha. Pure silk sarees aur bridal collection bohot hi khoobsurat hai. Staff ne bohot patience se har design dikhayi.",
    draft2: "Authentic Pethapur silk sarees aur designer collection lajawab hai. Fabric quality rich hai aur rates reasonable hain.",
    draft3: "Best saree showroom in Vadodara! Royal Rajwadi collection aur wedding sarees ke liye must visit jagah hai."
  },
  {
    draft1: "Family wedding ke liye Kanjivaram aur Banarasi silk sarees li. Zari work aur fabric bohot genuine hai. Pure silk ka trust mila.",
    draft2: "Showroom me bohot bada collection hai, staff bilkul pushy nahi hai aur designs ek se badhkar ek dikhaye. Shopping experience smooth raha.",
    draft3: "Festive collection aur designer bridal sarees bohot sundar hain. Fitting and fall-pico service timely mil gayi."
  },
  {
    draft1: "Rajwadi silk saree li function ke liye, sabne tareef ki. Fabric bohot comfortable aur premium lag raha tha. Thank you team!",
    draft2: "Traditional Patola aur Bandhani sarees ka exclusive collection yahan mila. Family ke sath shopping karne ka best experience.",
    draft3: "Top-quality pure silk sarees, spacious AC showroom aur polite sales staff. 100% recommended for wedding shopping!"
  }
]

const GENERAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Picked up some items earlier today. Super fresh quality, loved the experience and neat setup.",
    draft2: "Smooth transaction and neat service. Thodi bheed thi counter par par billing brisk aur polite thi.",
    draft3: "Fast service, clean setup and courteous staff. Dependable local store!"
  },
  {
    draft1: "Great product quality and transparent pricing. All items in stock and clearly labeled.",
    draft2: "Staff greeted nicely and helped locate what I needed in under a minute. Quick billing.",
    draft3: "Hassle-free experience, reliable product quality and super friendly assistance."
  }
]

/**
 * Returns category-specific, realistic Indian context angles (NO cross-industry mismatch).
 */
function getCategoryAuthenticAngles(categoryKey: string): string[] {
  switch (categoryKey) {
    case "beauty_parlour":
      return [
        "Family wedding function preparation",
        "Pre-festive skin glow & facial session",
        "Weekend pampering & relaxing hair spa",
        "Routine eyebrow threading & face cleanup",
        "Friend's sangeet function look",
        "Casual party styling & grooming"
      ]
    case "bakery":
      return [
        "Kids 1st birthday cake celebration",
        "Parents wedding anniversary celebration",
        "Weekend sweet craving treat",
        "Surprise celebration cake gift",
        "Office team celebration treat"
      ]
    case "restaurant":
      return [
        "Weekend family dinner outing",
        "Family anniversary celebration meal",
        "Casual lunch with relatives",
        "Sunday dinner with friends"
      ]
    case "salon_men":
      return [
        "Sunday morning fresh fade haircut & beard trim",
        "Pre-interview clean grooming session",
        "Routine haircut & relaxing head massage",
        "Wedding season sharp hair styling"
      ]
    case "cafe":
      return [
        "Evening coffee catchup with friends",
        "Laptop work from cafe session",
        "Cozy weekend hangout",
        "Student budget snack break"
      ]
    case "hotels":
      return [
        "Family transit stay during travel",
        "Overnight business trip check-in",
        "Peaceful weekend stopover"
      ]
    case "gift_shop":
      return [
        "Last-minute birthday gift selection",
        "Customized anniversary photo gift",
        "Kids birthday return gift purchase"
      ]
    case "optical_store":
      return [
        "Computerized eye power testing and prescription check",
        "Progressive multifocal lens fitting and alignment",
        "Blue-cut anti-glare glasses for laptop screen protection",
        "Designer lightweight spectacle frame selection",
        "Polarized UV sunglasses purchase",
        "Contact lens trial and consultation"
      ]
    case "clothing":
    case "saree_palace":
      return [
        "Bridal wedding trousseau shopping",
        "Festive Diwali & wedding reception saree trial",
        "Authentic Pethapur silk saree selection",
        "Family wedding saree matching & blouse contrast",
        "Traditional Patola and Bandhani saree purchase"
      ]
    case "car_wash":
      return [
        "Monsoon mud cleanup & snow foam wash",
        "Weekend road trip car wash",
        "Pre-festive interior vacuum detailing"
      ]
    case "supermarket":
      return [
        "Monthly ration grocery restocking",
        "Morning fresh dairy and snacks purchase",
        "Household essentials shopping"
      ]
    case "dental_clinic":
      return [
        "Routine dental cleaning and scaling",
        "Painless single-sitting root canal treatment",
        "Cosmetic smile design and aligners consultation",
        "Wisdom tooth extraction recovery",
        "Kids dental cavity filling visit"
      ]
    case "pet_clinic":
      return [
        "Puppy core vaccination and deworming visit",
        "Routine pet health and wellness checkup",
        "Tick and flea prevention treatment",
        "Emergency pet care and recovery",
        "Skin allergy treatment and dietary consultation"
      ]
    case "fast_food":
      return [
        "Evening street snack hangout with friends",
        "Quick vadapav and dabeli parcel takeaway",
        "College afternoon snack break",
        "Crispy cheese grill sandwich craving",
        "Family weekend fast food treat"
      ]
    case "pizza_restaurant":
      return [
        "Weekend wood-fired pizza date",
        "Family pizza and garlic bread feast",
        "College friends cheese burst pizza party",
        "Late evening gourmet sourdough pizza craving"
      ]
    case "non_veg_restaurant":
      return [
        "Weekend family non-veg feast",
        "Chicken biryani and kebabs dinner outing",
        "Special butter chicken and tandoori treat",
        "Anniversary Mughlai dinner with family"
      ]
    case "saas_agency":
      return [
        "Google review 10x growth milestone",
        "Paper loyalty card to WhatsApp digital transition",
        "Customer retention & repeat footfall increase",
        "Billing counter QR standee implementation",
        "Owner AI review auto-reply automation"
      ]
    default:
      return [
        "Regular local visit",
        "Weekend service visit",
        "Friendly local recommendation"
      ]
  }
}

/**
 * Returns a randomized, diverse review draft set based on category, product, and optional seed.
 */
export function getDynamicFallbackReview(
  category: string,
  product?: string,
  seed?: number | string
): ReviewDraftOptions {
  const c = (category || "").toLowerCase()
  const hasItem = Boolean(product && product.trim() && !product.toLowerCase().includes("store special"))
  const item = hasItem ? product!.trim() : ""

  // Choose appropriate pool based on category
  let pool: FallbackReviewItem[] = GENERAL_REVIEWS
  const isPetCategory = (
    c.includes("pet_clinic") || c.includes("pet_shop") ||
    c.includes("veterin") || c.includes("animal hospital") || c.includes("pet hospital") ||
    c.includes("vet clinic") || c.includes("dog clinic") || c.includes("cat clinic") ||
    (/\b(pet|pets|puppy|puppies|kitten|kittens|dog|dogs|cat|cats)\b/i.test(c) && !c.includes("pethapur") && !c.includes("carpet") && !c.includes("petlad"))
  )

  if (c.includes("optical") || c.includes("optician") || c.includes("eyewear") || c.includes("spectacle") || c.includes("lens") || c.includes("chashma") || c.includes("optical_store")) {
    pool = OPTICAL_REVIEWS
  } else if (
    c.includes("saree") || c.includes("silk") || c.includes("saree_palace") ||
    c.includes("rajwadi") || c.includes("pethapur") || c.includes("lehenga") ||
    c.includes("patola") || c.includes("chaniya") || c.includes("cloth") ||
    c.includes("garment") || c.includes("boutique")
  ) {
    pool = SAREE_CLOTHING_REVIEWS
  } else if (isPetCategory) {
    pool = PET_CLINIC_REVIEWS
  } else if (c.includes("dental") || c.includes("dentist") || c.includes("tooth") || c.includes("teeth") || c.includes("orthodont") || c.includes("rct") || c.includes("dental_clinic")) {
    pool = DENTAL_REVIEWS
  } else if (c.includes("pizza") || c.includes("pizzeria") || c.includes("wood fired") || c.includes("wood-fired")) {
    pool = PIZZA_REVIEWS
  } else if (c.includes("dabeli") || c.includes("vadapav") || c.includes("vada pav") || c.includes("samosa") || c.includes("sandwich") || c.includes("fast food") || c.includes("street snack")) {
    pool = FAST_FOOD_REVIEWS
  } else if (c.includes("non veg") || c.includes("non-veg") || c.includes("chicken") || c.includes("mutton") || c.includes("biryani") || c.includes("mughlai") || c.includes("kebab")) {
    pool = NON_VEG_REVIEWS
  } else if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("bridal") || c.includes("ladies salon") || c.includes("ssv")) {
    pool = PARLOUR_LADIES_REVIEWS
  } else if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    pool = BAKERY_REVIEWS
  } else if (c.includes("south indian") || c.includes("dosa") || c.includes("idli") || c.includes("udupi")) {
    pool = SOUTH_INDIAN_REVIEWS
  } else if (c.includes("punjabi") || c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") || c.includes("food") || c.includes("thali") || c.includes("kitchen")) {
    pool = RESTAURANT_REVIEWS
  } else if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    pool = CAFE_REVIEWS
  } else if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming") || c.includes("saloon")) {
    pool = SALON_MEN_REVIEWS
  } else if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    pool = CAR_WASH_REVIEWS
  } else if (c.includes("clinic") || c.includes("hospital") || c.includes("doctor")) {
    pool = CLINIC_REVIEWS
  } else if (c.includes("education") || c.includes("coaching") || c.includes("institute") || c.includes("tuition") || c.includes("classes")) {
    pool = EDUCATION_REVIEWS
  } else if (c.includes("saas") || c.includes("software") || c.includes("customerpilot") || c.includes("agency") || c.includes("tech")) {
    pool = SAAS_AGENCY_REVIEWS
  }

  // Derive selection index using random or deterministic seed
  let index: number
  if (typeof seed === "number") {
    index = Math.abs(seed) % pool.length
  } else if (typeof seed === "string" && seed.length > 0) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i)
    const jitter = Math.floor(Math.random() * pool.length)
    index = (Math.abs(hash) + jitter) % pool.length
  } else {
    index = Math.floor(Math.random() * pool.length)
  }

  const selected = pool[index] || pool[0]

  if (hasItem) {
    return getCategoryAwareItemDrafts(c, item, selected)
  }

  return {
    draft1: selected.draft1,
    draft2: selected.draft2,
    draft3: selected.draft3
  }
}

/**
 * Generates category-specific draft1 and draft2 when a focal item (service/product) is provided.
 * draft3 is always taken from the category pool entry for consistency.
 * This prevents generic human-medical language leaking into Pet Clinic, Dental, etc.
 */
function getCategoryAwareItemDrafts(
  category: string,
  item: string,
  poolEntry: FallbackReviewItem
): ReviewDraftOptions {
  const c = category.toLowerCase()

  // ── SAREE & SILK PALACE / ETHNIC WEAR ─────────────────────────────────────────
  if (
    c.includes("saree") || c.includes("silk") || c.includes("cloth") ||
    c.includes("garment") || c.includes("boutique") || c.includes("lehenga") ||
    c.includes("sari") || c.includes("rajwadi") || c.includes("pethapur") ||
    c.includes("saree_palace")
  ) {
    const templates = [
      {
        draft1: `Wedding function ke liye ${item} liya tha. Fabric quality aur rich zari border bahut hi authentic hai. Sabne look ki bohot tareef ki!`,
        draft2: `${item} ka collection bohot unique tha. Staff ne patience se styling dikhayi aur fall-pico finishing bhi time pe karke di.`
      },
      {
        draft1: `Family shopping ke liye gaye the aur ${item} pasand aaya. Pure fabric aur genuine quality dekh kar maza aa gaya.`,
        draft2: `${item} ki fitting aur drape perfect baitha. Vadodara me royal traditional wear ke liye best showroom hai.`
      },
      {
        draft1: `Showroom me ${item} ki multiple exclusive designs dikhayi. Rates genuine hain aur staff ka behavior bohot polite tha.`,
        draft2: `${item} ke sath blouse matching aur contrast suggestions bohot ache diye. Wedding trousseau shopping ke liye definitely recommend karti hoon.`
      }
    ]
    const chosen = templates[Math.floor(Math.random() * templates.length)]
    return {
      draft1: chosen.draft1,
      draft2: chosen.draft2,
      draft3: poolEntry.draft3 || `Outstanding quality ${item} and wonderful shopping experience at this showroom!`
    }
  }

  // ── OPTICAL STORE & EYEWEAR ──────────────────────────────────────────────────
  if (
    c.includes("optical") || c.includes("optician") || c.includes("eyewear") ||
    c.includes("spectacle") || c.includes("lens") || c.includes("chashma") ||
    c.includes("optical_store")
  ) {
    const itemLower = item.toLowerCase()
    let templates: { draft1: string; draft2: string; draft3?: string }[] = []

    // 1. Eye testing & Clinical Checkup (Must evaluate before computer specs)
    if (itemLower.includes("eye test") || itemLower.includes("power") || itemLower.includes("optometrist") || itemLower.includes("refract") || itemLower.includes("checkup")) {
      templates = [
        {
          draft1: `Detailed ${item} karwaya. Optometrist ne cylinder aur spherical numbers bahut thoroughly verify kiye trial frame pe.`,
          draft2: `Testing room clean aur sanitized tha. Doctor ne eye strain causes aur screen hygiene tips clearly samjhaye.`,
          draft3: `Accurate computerized ${item} and trustworthy eye care advice!`
        },
        {
          draft1: `Accurate ${item} done with digital autorefractor machine. Clear explanation mili bina kisi hurry ke.`,
          draft2: `Zero waiting time tha appointment me. Staff courteous tha aur transparent eye power prescription di.`,
          draft3: `Dependable ${item} and professional optical consultation!`
        }
      ]
    } else if (itemLower.includes("blue") || itemLower.includes("screen") || itemLower.includes("gaming") || itemLower.includes("anti-glare") || itemLower.includes("computer glasses") || itemLower.includes("computer protect")) {
      templates = [
        {
          draft1: `Daily laptop screen work ke liye ${item} liya. Glare aur eye fatigue bilkul stop ho gaya, visual comfort top class hai!`,
          draft2: `Shaam ko counter pe visit kiya tha, staff ne face cut ke hisab se lightweight frame suggest kiya. Delivery on-time mili.`,
          draft3: `Outstanding quality ${item} and crystal clear screen protection from this optical store!`
        },
        {
          draft1: `Mera new ${item} banwaya yahan se. Coding aur continuous monitor use ke baad bhi headaches completely band ho gaye.`,
          draft2: `Optometrist ne lens anti-reflective coating light meter pe demo karke dikhayi. Honest advice and zero upselling.`,
          draft3: `High-performance ${item} with featherweight frames. Highly recommended for professionals!`
        },
        {
          draft1: `Picked up ${item} for office work. Lenses crystal clear hain aur frame nose bridge par bilkul heavy feel nahi hota.`,
          draft2: `Staff polite tha aur hard case ke sath lens cleaning microfiber kit bhi provide ki. Smooth transaction.`,
          draft3: `Total value for money ${item} and courteous optical service!`
        }
      ]
    } else if (itemLower.includes("progressive") || itemLower.includes("multifocal") || itemLower.includes("bifocal")) {
      templates = [
        {
          draft1: `New ${item} banwaye yahan se. Reading aur distant vision dono corridors bilkul seamless hain bina kisi distortion ke!`,
          draft2: `Optometrist ne computerized power checkup bahut detail me kiya. Fitting exact pupil distance ke sath perfect mili.`,
          draft3: `Precision-crafted ${item} and exceptional progressive adaptation guarantee!`
        },
        {
          draft1: `Got my ${item} fitted here. Driving aur mobile text reading me quick switch ho jata hai, first day se adjust ho gaya.`,
          draft2: `Family ke sath visit kiya tha, staff ne 15 frames patiently try karwaye bina kisi rush ke. Prompt 24-hr delivery.`,
          draft3: `Flawless ${item} and experienced optometrist consultation. Best optician in Vadodara!`
        },
        {
          draft1: `Accurate power testing ke baad ${item} order kiye. Lens quality Crizal clear hai aur peripheral blurriness bilkul nahi hai.`,
          draft2: `Store me progressive lenses ke multiple branded options explain kiye. Transparent pricing aur warranty card mila.`,
          draft3: `Crystal sharp ${item} and highly professional eyewear dispensing!`
        }
      ]
    } else if (itemLower.includes("sunglass") || itemLower.includes("polarized") || itemLower.includes("uv400") || itemLower.includes("photochrom")) {
      templates = [
        {
          draft1: `Highway trips aur daily driving ke liye ${item} purchase kiya. Harsh sunlight glare bilkul cut ho gaya aur build solid hai.`,
          draft2: `Showroom me stylish sunglasses ka huge collection tha. Rates transparent hain aur staff guidance bahut helpful rahi.`,
          draft3: `Stylish polarized ${item} and genuine UV protection. Superb collection!`
        },
        {
          draft1: `Picked up branded ${item} with UV protection. Eyes relaxed rehti hain outdoor daylight me aur finish premium hai.`,
          draft2: `Counter staff ne snug face fitting karke di aur sturdy protective hard case diya. Great buying experience.`,
          draft3: `Top-notch quality ${item} and very polite customer handling!`
        }
      ]
    } else if (itemLower.includes("repair") || itemLower.includes("screw") || itemLower.includes("nose pad") || itemLower.includes("clean")) {
      templates = [
        {
          draft1: `Chashme ke frame me ${item} karwaya emergency me. 5 minute me perfectly align karke tight kar diya.`,
          draft2: `Ultrasonic machine se deep frame cleaning bhi karke di bina kisi extra charge ke. Very polite and helpful gesture.`,
          draft3: `Quick 5-minute ${item} and prompt optical goodwill assistance!`
        },
        {
          draft1: `Loose frame screw and ${item} done instantly. Proper temple adjustment karke di taaki frame slip na ho.`,
          draft2: `Staff immediately attend kiya bina wait karwaye. Dependable neighborhood optical clinic.`,
          draft3: `Fast dependable ${item} and courteous optical service!`
        }
      ]
    } else if (itemLower.includes("contact") || itemLower.includes("solution")) {
      templates = [
        {
          draft1: `Got my ${item} from here. Whole day screen wear ke baad bhi zero eye irritation ya dryness feel hui.`,
          draft2: `Optometrist ne hygienic insertion aur safe lens care steps bohot patiently demonstrate kiye. Fresh sealed pack mila.`,
          draft3: `Comfortable ${item} and expert optometrist training!`
        }
      ]
    } else if (itemLower.includes("kid") || itemLower.includes("flexible") || itemLower.includes("unbreakable")) {
      templates = [
        {
          draft1: `Mera beta ke liye ${item} liya. Unbreakable flexible material hai jo school aur outdoor play me bilkul safe hai.`,
          draft2: `Optometrist ne bache ka vision test bahut playfully aur patiently kiya. Child-friendly staff aur cooperative behavior.`,
          draft3: `Durable kids ${item} and gentle optometrist care!`
        }
      ]
    } else {
      // General Frames, Rimless, Titanium & Spectacles
      templates = [
        {
          draft1: `Mera ${item} banwaya yahan se. Featherweight lightweight fit baitha aur vision ekdum crisp sharp hai!`,
          draft2: `Showroom me stylish frames ka wide collection available tha. Staff ne face shape ke according best design pick karwaya.`,
          draft3: `High-quality ${item} and prompt 24-hour delivery!`
        },
        {
          draft1: `Picked up new ${item}. Frame finishing solid hai, hinges sturdy hain aur nose bridge par bilkul pressure nahi padta.`,
          draft2: `Transparent pricing mili aur hard protective case ke sath warranty card diya. Polite and attentive team.`,
          draft3: `Stylish durable ${item} and wonderful shopping experience at this showroom!`
        },
        {
          draft1: `Showroom me ${item} ki wide variety available thi. Fitting seamless hai aur look bahut sophisticated aaya.`,
          draft2: `Delivery promise time se pehle message aa gaya tha collection ke liye. Smooth and pleasant transaction.`,
          draft3: `Top-grade ${item} with genuine warranty and dependable after-sales support!`
        }
      ]
    }

    const chosen = templates[Math.floor(Math.random() * templates.length)]
    return {
      draft1: chosen.draft1,
      draft2: chosen.draft2,
      draft3: chosen.draft3 || poolEntry.draft3 || `Outstanding quality ${item} and professional optical consultation at this store!`
    }
  }

  // ── PET CLINIC ───────────────────────────────────────────────────────────────
  const isPetCategory = (
    c.includes("pet_clinic") || c.includes("pet_shop") ||
    c.includes("veterin") || c.includes("animal hospital") || c.includes("pet hospital") ||
    c.includes("vet clinic") || c.includes("dog clinic") || c.includes("cat clinic") ||
    (/\b(pet|pets|puppy|puppies|kitten|kittens|dog|dogs|cat|cats)\b/i.test(c) && !c.includes("pethapur") && !c.includes("carpet") && !c.includes("petlad"))
  )
  if (isPetCategory) {
    const templates = [
      {
        draft1: `Mera dog ka ${item} karwaya. Vet doctor ne bahut gently handle kiya, pet poori visit mein calm aur comfortable raha.`,
        draft2: `${item} ke liye visit ki — doctor ne clearly samjhaya kya karein aur kya nahi. Clinic clean aur hygienic hai.`
      },
      {
        draft1: `Meri billi ka ${item} kiya gaya. Procedure smooth raha aur doctor ne post-care instructions clearly di.`,
        draft2: `${item} ke baad pet ki condition mein quick improvement aayi. Vet team caring aur professional hai.`
      },
      {
        draft1: `Puppy ka ${item} karwaya — vet ne gently handle kiya, bilkul dard nahi hua pet ko. Genuine medicines use ki.`,
        draft2: `${item} ke liye appointment timely mila. Staff polite tha aur examination table properly sanitized thi.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── DENTAL CLINIC ────────────────────────────────────────────────────────────
  if (
    c.includes("dental") || c.includes("dentist") || c.includes("tooth") ||
    c.includes("teeth") || c.includes("orthodont")
  ) {
    const templates = [
      {
        draft1: `${item} karwaya — completely painless procedure tha. Doctor ne X-ray dikhakar sab clearly explain kiya.`,
        draft2: `${item} ke liye visit kiya. Clinic sterilized instruments use karti hai aur zero waiting time tha.`
      },
      {
        draft1: `${item} done here — doctor bahut gentle the aur chair pe bilkul comfortable feel hua throughout.`,
        draft2: `${item} ke baad teeth ekdum fresh aur clean feel ho rahe hain. Transparent pricing, no hidden charges.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── PIZZA RESTAURANT ─────────────────────────────────────────────────────────
  if (c.includes("pizza") || c.includes("pizzeria") || c.includes("wood fired") || c.includes("wood-fired")) {
    const templates = [
      {
        draft1: `${item} order kiya — crust perfectly crispy aur cheese pull rich tha. Best pizza in the area!`,
        draft2: `${item} tha menu mein, served hot aur fresh. Thoda rush tha par service quick aur attentive thi.`
      },
      {
        draft1: `Tried their ${item} — sourdough base light on stomach aur toppings generously fresh the.`,
        draft2: `${item} ka order 15 minutes mein aa gaya. Ambiance cozy aur staff very welcoming tha.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── FAST FOOD / STREET SNACKS ─────────────────────────────────────────────────
  if (
    c.includes("dabeli") || c.includes("vadapav") || c.includes("vada pav") ||
    c.includes("samosa") || c.includes("sandwich") || c.includes("fast food") ||
    c.includes("street snack")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — super crispy, piping hot aur spicy chutney ka taste authentic tha. Bilkul paisa vasool!`,
        draft2: `${item} ke liye evening mein gaye — counter pe thoda rush tha par 5 minute mein parcel ready kar diya.`
      },
      {
        draft1: `${item} here is unmatched — fresh fried, generous fillings aur pocket-friendly price. Daily craving spot!`,
        draft2: `${item} ka taste ghar yaad dilata hai — spicy, hot aur authentic. Staff brisk aur polite tha.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── NON-VEG RESTAURANT ────────────────────────────────────────────────────────
  if (
    c.includes("non veg") || c.includes("non-veg") || c.includes("chicken") ||
    c.includes("mutton") || c.includes("biryani") || c.includes("mughlai") || c.includes("kebab")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — chicken tender, gravy aromatic aur dum ka taste proper authentic tha. Unforgettable meal!`,
        draft2: `${item} ke liye family ke sath aaye — serving hot, portion generous aur staff very courteous tha.`
      },
      {
        draft1: `Best ${item} in the city — well-marinated, smoky aur rich gravy bina excess oil ke. Worth every penny!`,
        draft2: `Tried ${item} here on a weekend — rush tha par manager ne quickly seating arrange ki. Great dining experience.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── LADIES BEAUTY PARLOUR ─────────────────────────────────────────────────────
  if (
    c.includes("beauty") || c.includes("parlor") || c.includes("parlour") ||
    c.includes("makeup") || c.includes("bridal") || c.includes("ladies salon")
  ) {
    const templates = [
      {
        draft1: `${item} karwaya — didi ke haath mein jadoo hai. Skin pe instant glow aa gaya, results better than expected!`,
        draft2: `${item} ke liye appointment liya — parlour clean aur AC mein comfortable tha. Didi ne bohot ache se kiya.`
      },
      {
        draft1: `Gayi thi ${item} ke liye — bohot relaxing experience tha. Products high quality aur no irritation on skin.`,
        draft2: `${item} ke baad skin ekdum soft aur glowing lag rahi thi. Staff bahut friendly aur hygienic tha.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── MEN SALON / BARBER ────────────────────────────────────────────────────────
  if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming") || c.includes("saloon")) {
    const templates = [
      {
        draft1: `${item} karwaya — bhai ne zero mistake se kiya. Fresh clean look mila, bilkul jaisa bola tha waisa.`,
        draft2: `${item} ke liye drop-in gaya — waiting time 10 min tha par result top class nikla. Fair pricing.`
      },
      {
        draft1: `${item} done perfectly — steady scissors, clean razor finish aur attention to detail zabardast tha.`,
        draft2: `Tried ${item} here for the first time — staff patient tha aur exactly jo chaha wo deliver kiya.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── BAKERY / CAKE SHOP ────────────────────────────────────────────────────────
  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    const templates = [
      {
        draft1: `${item} order kiya — super moist, perfectly sweet aur presentation photo se bhi zyada premium aayi!`,
        draft2: `${item} ke liye evening mein gaye — counter pe thodi bheed thi par box 10 minute mein ready ho gayi.`
      },
      {
        draft1: `Tried their ${item} — sponge ultra soft tha aur cream absolutely fresh. Made our celebration perfect!`,
        draft2: `${item} customize kiya with name on top — unhone bina extra charge ke beautifully piping kar di.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── CAFE / COFFEE SHOP ────────────────────────────────────────────────────────
  if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    const templates = [
      {
        draft1: `${item} order kiya — perfect temperature, rich flavour aur presentation Instagram-worthy thi!`,
        draft2: `${item} ke sath ek peaceful afternoon spend ki — Wi-Fi fast tha, music decent aur ambiance cozy.`
      },
      {
        draft1: `Tried their ${item} — fresh brewed, excellent balance of sweet and bitter. Instant mood booster!`,
        draft2: `${item} came quickly despite weekend crowd. Comfortable seating aur AC properly chilled tha.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── GENERAL RESTAURANT / FOOD ─────────────────────────────────────────────────
  if (
    c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") ||
    c.includes("food") || c.includes("thali") || c.includes("kitchen") ||
    c.includes("south indian") || c.includes("punjabi")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — garam, fresh aur taste mein bilkul ghar jaisi quality. Full paisa vasool!`,
        draft2: `${item} ke liye family ke sath aaye. Rush tha par service quick thi aur sabka order sahi aa gaya.`
      },
      {
        draft1: `Best ${item} I've had in this area — generous portion, authentic spices aur piping hot served.`,
        draft2: `${item} ka taste lag raha tha jaise ghar pe kha rahe hoon. Staff friendly aur serving prompt tha.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── CAR WASH / GARAGE ─────────────────────────────────────────────────────────
  if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    const templates = [
      {
        draft1: `${item} karwaya — car ekdum showroom jaisi shine mein aa gayi. Detailed cleaning without any scratch!`,
        draft2: `${item} done in estimated time — staff professional tha aur every corner properly cleaned. Impressed!`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── SAAS / AGENCY ─────────────────────────────────────────────────────────────
  if (c.includes("saas") || c.includes("software") || c.includes("customerpilot") || c.includes("agency") || c.includes("tech")) {
    return {
      draft1: `${item} feature set up kiya — simple onboarding, zero technical hassle aur results immediately visible hue.`,
      draft2: `${item} se hamare store ke Google reviews fast badh rahe hain. ROI clearly dikh raha hai dashboard mein.`,
      draft3: poolEntry.draft3
    }
  }

  // ── GENERIC CLINIC / DOCTOR (Human medical — NOT pet) ────────────────────────
  if (c.includes("clinic") || c.includes("hospital") || c.includes("doctor")) {
    const templates = [
      {
        draft1: `${item} ke liye doctor ke paas gaya — thorough consultation, accurate diagnosis aur clear prescription mili.`,
        draft2: `${item} done here — doctor patient the aur bina rush kiye sab samjhaya. Clean hygenic clinic environment.`
      }
    ]
    const t = templates[Math.floor(Math.random() * templates.length)]
    return { draft1: t.draft1, draft2: t.draft2, draft3: poolEntry.draft3 }
  }

  // ── DEFAULT FALLBACK (completely generic) ─────────────────────────────────────
  return {
    draft1: `${item} liya — quality genuine thi, professional experience aur seamless transaction. Definitely coming back!`,
    draft2: `${item} ke liye visit kiya — counter pe thoda rush tha par staff courteous aur quick tha. Satisfied customer.`,
    draft3: poolEntry.draft3
  }
}

/**
 * Calls AI (Gemini or Groq fallback) with strict Merchant KeywordProfile grounding.
 * Enforces Whitelists, Blacklists, and Gender Persona to guarantee ZERO context hallucinations.
 */
export async function generateDynamicReviewDraft(params: {
  businessCategory: string
  businessType?: string
  productName?: string
  merchantName?: string
  menuItems?: string[]
  seed?: string
  merchantKeywordProfile?: string | null
  merchantCity?: string
  merchantAddress?: string
  pastPublicReviews?: string[]
}): Promise<ReviewDraftOptions> {
  const { businessCategory, businessType, productName, merchantName, menuItems, seed, merchantKeywordProfile, merchantCity, merchantAddress, pastPublicReviews } = params

  // 1. Resolve merchant's active KeywordProfile (SEO, AEO, GEO, and Blacklist)
  const profile: KeywordProfile = resolveMerchantKeywordProfile({
    name: merchantName,
    category: businessCategory,
    businessType: businessType,
    city: merchantCity,
    address: merchantAddress,
    keywordProfile: merchantKeywordProfile
  })

  // 2. Pick a randomized focal item from allowed whitelist (NEVER generic "Store Special")
  let focalItem = productName?.trim() || ""
  if (!focalItem && menuItems && menuItems.length > 0) {
    const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
    if (randomMenuItem) focalItem = randomMenuItem
  }
  if (!focalItem || focalItem.toLowerCase().includes("store special")) {
    // Pick an authentic service/product from merchant's allowed whitelist
    const whitelist = profile.allowedSeoEntities
    if (whitelist && whitelist.length > 0) {
      focalItem = whitelist[Math.floor(Math.random() * whitelist.length)]
    } else {
      focalItem = "Service"
    }
  }

  // 3. Category-appropriate authentic context angle & archetype selection
  const categoryAngles = getCategoryAuthenticAngles(profile.categoryKey)
  const randomAngle = categoryAngles[Math.floor(Math.random() * categoryAngles.length)]
  const timestampSeed = Date.now().toString(36)

  // Dynamic Archetypes for Anti-Repetition
  const OPTICAL_ARCHETYPES = [
    {
      label: "Screen Worker (Blue-Cut Computer Specs)",
      need: "blue-cut anti-glare screen glasses for laptop coding and monitor work",
      angle: "eye strain and headache relief, featherweight frame",
      avoid: "progressive, bifocal, sunglasses, kids"
    },
    {
      label: "Senior / Middle-Aged (Progressive Multifocal)",
      need: "progressive multifocal lenses for reading and distance",
      angle: "smooth corridor switch, zero peripheral distortion, accurate power",
      avoid: "gaming, computer glasses, sunglasses, kids"
    },
    {
      label: "Fashion & Highway Driving (Polarized Sunglasses)",
      need: "polarized UV400 branded sunglasses for road trips and daylight",
      angle: "glare-free driving vision, stylish look, compliments, sturdy hinges",
      avoid: "progressive, power checkup, kids"
    },
    {
      label: "Parent for School Child (Kids Eyewear)",
      need: "flexible unbreakable eyewear frames for kids",
      angle: "gentle friendly optometrist eye test, durable play-proof flexible frame",
      avoid: "progressive, computer coding, reading bifocal"
    },
    {
      label: "Executive / Professional (Rimless Titanium)",
      need: "rimless titanium featherweight spectacles",
      angle: "sophisticated executive look, zero pressure marks on nose bridge, precision fit",
      avoid: "sunglasses, kids, emergency repair"
    },
    {
      label: "Quick Frame Maintenance (Emergency Repair)",
      need: "loose screw tightening and nose pad replacement",
      angle: "quick 5-minute fix, ultrasonic machine cleaning, polite helpful gesture",
      avoid: "new eye test, progressive lenses"
    },
    {
      label: "Contact Lens Wearer (Disposable Lenses)",
      need: "daily disposable contact lenses",
      angle: "comfort during long wear, clear hygienic insertion training by optometrist, fresh stock",
      avoid: "spectacle frame, sunglasses"
    },
    {
      label: "Night Driver (Anti-Glare Yellow Tint)",
      need: "night drive yellow tint anti-glare glasses",
      angle: "high-beam light glare reduction, relaxed night driving, certified lens coating",
      avoid: "progressive, contact lenses, kids"
    },
    {
      label: "Eye Testing & Clinical Checkup",
      need: "computerized eye power testing with digital autorefractor",
      angle: "precise cylindrical & spherical power check, patient optometrist explanation, zero rush",
      avoid: "sunglasses, repair, kids play"
    }
  ]

  const STORE_REALITIES = [
    "prompt 24-hour turnaround with spectacles ready on time",
    "patient consultation where staff let me try 15+ frames without any pushiness",
    "transparent pricing with warranty card and sturdy hard protective case",
    "clean sanitized auto-refractor testing room and well-maintained optical setup",
    "prompt WhatsApp notification when glasses were ready for collection",
    "snug nose pad and temple adjustment ensuring zero slippage during wear",
    "attentive optometrist who double-checked cylinder numbers on the trial frame",
    "brisk efficient billing and courteous interaction"
  ]

  let assignedArchetype = OPTICAL_ARCHETYPES[Math.floor(Math.random() * OPTICAL_ARCHETYPES.length)]
  const focalLower = focalItem.toLowerCase()
  if (focalLower.includes("eye test") || focalLower.includes("power") || focalLower.includes("autorefractor") || focalLower.includes("optometrist") || focalLower.includes("pupil")) {
    assignedArchetype = OPTICAL_ARCHETYPES[8]
  } else if (focalLower.includes("blue") || focalLower.includes("screen") || focalLower.includes("gaming") || focalLower.includes("computer glasses") || focalLower.includes("computer protect")) {
    assignedArchetype = OPTICAL_ARCHETYPES[0]
  } else if (focalLower.includes("progressive") || focalLower.includes("multifocal") || focalLower.includes("bifocal")) {
    assignedArchetype = OPTICAL_ARCHETYPES[1]
  } else if (focalLower.includes("sunglass") || focalLower.includes("polarized") || focalLower.includes("uv400")) {
    assignedArchetype = OPTICAL_ARCHETYPES[2]
  } else if (focalLower.includes("kid") || focalLower.includes("flexible") || focalLower.includes("unbreakable")) {
    assignedArchetype = OPTICAL_ARCHETYPES[3]
  } else if (focalLower.includes("rimless") || focalLower.includes("titanium")) {
    assignedArchetype = OPTICAL_ARCHETYPES[4]
  } else if (focalLower.includes("repair") || focalLower.includes("screw") || focalLower.includes("nose pad") || focalLower.includes("clean")) {
    assignedArchetype = OPTICAL_ARCHETYPES[5]
  } else if (focalLower.includes("contact") || focalLower.includes("solution")) {
    assignedArchetype = OPTICAL_ARCHETYPES[6]
  } else if (focalLower.includes("night")) {
    assignedArchetype = OPTICAL_ARCHETYPES[7]
  }

  const assignedVibe = STORE_REALITIES[Math.floor(Math.random() * STORE_REALITIES.length)]

  // 4. Prepare fallback immediately
  const fallback = getDynamicFallbackReview(profile.categoryKey || businessCategory, focalItem, seed || timestampSeed)

  // 5. Check active API keys
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const groqKey = process.env.AI_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const groqModel = process.env.AI_MODEL?.trim() || "openai/gpt-oss-120b"

  if (!geminiKey && !groqKey) {
    return fallback
  }

  // Common Banned Buzzwords
  const bannedRegex = /\b(spot[- ]?on|top[- ]?notch|hidden gem|highly recommend|pristine|testament|delve|exceptional|outstanding|game changer|store special)\b/gi
  const cleanText = (s: string) => s.replace(bannedRegex, "").replace(/["\\]/g, "").replace(/\s+/g, " ").trim()

  // Post-generation Negative Blacklist Sanitizer
  const sanitizeStrict = (text: string): string => {
    let res = cleanText(text)
    for (const banned of profile.strictlyNotAllowed) {
      if (banned.length >= 3) {
        const re = new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
        res = res.replace(re, "")
      }
    }
    // Remove hanging punctuation or double spaces
    return res.replace(/\s+/g, " ").replace(/\s+([.,!])/g, "$1").trim()
  }

  // 6. Audience Persona & Gender Grammar Directive
  let personaInstruction = "Tone: Casual, natural Indian English or Hinglish like a spontaneous WhatsApp text."
  if (profile.categoryKey === "optical_store") {
    personaInstruction = `STRICT OPTICAL & EYEWEAR PERSONA RULE:
- This is an OPTICIAN & EYEWEAR SHOWROOM (spectacles, prescription glasses, progressive lenses, blue-cut computer glasses, sunglasses).
- Perspective: Customer getting computerized eye power testing, purchasing new spectacle frames, progressive lenses, contact lenses, or sunglasses.
- Praising: Accurate computerized eye test, crystal clear progressive vision, lightweight durable frames, blue-cut anti-glare screen protection, polite optometrist and fast 24-hour delivery.
- ABSOLUTELY NEVER mention cakes, pastries, bakery, burger, pizza, food delivery, pets, dogs, cats, or teeth/dentist.`
  } else if (profile.categoryKey === "saree_palace" || profile.categoryKey === "clothing") {
    personaInstruction = `STRICT SAREE & ETHNIC WEAR PERSONA RULE:
- This is a SILK SAREE PALACE & BRIDAL ETHNIC WEAR SHOWROOM.
- Perspective: Customer / Bride / Family shopping for wedding, reception, festive function, or family ceremony.
- Praising: Authentic Pethapur silk sarees, pure fabric, rich zari border, bridal chaniya choli, patient staff showing dozens of designs, comfortable showroom ambience.
- ABSOLUTELY NEVER mention pets, dogs, cats, animals, vet, clinic, doctor, medicine, cakes, or food delivery.`
  } else if (profile.categoryKey === "saas_agency") {
    personaInstruction = `STRICT B2B MERCHANT PERSONA RULE:
- The reviewer is an authentic local retail store owner / merchant / shop manager writing for CustomerPilot (SaaS platform).
- Perspective: "Hamare store/bakery/salon ke liye CustomerPilot WhatsApp loyalty lagaya", "Google reviews 800% badh gaye", "Counter standee se customers khush hoke review dete hain", "1-click owner auto-reply se daily time bachta hai".
- ABSOLUTELY NEVER mention ordering food, haircut, doctor visit, cakes, thali, or personal services.`
  } else if (profile.categoryKey === "pet_clinic") {
    personaInstruction = `STRICT PET OWNER PERSONA RULE (CRITICAL — READ CAREFULLY):
- This is a VETERINARY / PET CLINIC. The reviewer is a PET OWNER, NOT a human patient.
- The reviewer visits to get their DOG, CAT, RABBIT, or other ANIMAL treated — not themselves.
- ALWAYS use pet owner language: "mera dog", "meri billi", "mera puppy", "hamare pet", "mera Golden Retriever", "meri Persian cat".
- Use vet-specific terms: "vaccination", "deworming", "vet doctor", "veterinary", "animal", "pet", "parvovirus", "tick fever", "drip treatment", "neutering", "spaying", "pet surgery".
- ABSOLUTELY NEVER write "mera fever", "meri headache", "doctor consultation for me", "medicine for me", "mujhe diagnosis di" — these are human medical phrases STRICTLY FORBIDDEN here.
- ABSOLUTELY NEVER mention food delivery, parcel, cake, haircut, or grooming (human).
- Example correct phrases: "Mera dog ka vaccination karwaya", "Vet ne meri billi ko gently handle kiya", "Puppy ki deworming done, clinic clean thi", "Doctor ne pet ki condition clearly explain ki".`
  } else if (profile.categoryKey === "dental_clinic") {
    personaInstruction = `STRICT DENTAL PATIENT PERSONA RULE:
- This is a DENTAL CLINIC. The reviewer is a human dental patient.
- Use dental-specific terms: "root canal", "scaling", "polishing", "tooth filling", "dental checkup", "X-ray", "orthodontic", "braces", "wisdom tooth extraction".
- ABSOLUTELY NEVER mention food delivery, animal/pet, biryani, haircut, or non-dental medical terms.
- Example: "Root canal completely painless tha", "Teeth scaling ke baad zero sensitivity", "Doctor ne X-ray clearly explain kiya".`
  } else if (profile.audiencePersona === "Female_Only") {
    personaInstruction = `STRICT FEMININE GRAMMAR RULE (CRITICAL):
- The reviewer is STRICTLY a woman/girl writing for a ladies beauty parlor.
- Use natural feminine Hindi/Hinglish verbs: "gayi thi", "facial karwaya", "didi ne bohot ache se kiya", "skin pe instant glow aa gaya", "bohot soft lag rahi hai".
- ABSOLUTELY NEVER use masculine words like "gaya tha", "bhai", "bro", "barber".
- ABSOLUTELY NEVER mention food, chai, tea, cake, snacks, dinner, or delivery.`
  } else if (profile.audiencePersona === "Male_Only") {
    personaInstruction = `STRICT MASCULINE GRAMMAR RULE:
- The reviewer is a male customer writing for men's grooming/salon.
- Use masculine verbs: "haircut karwaya", "fade haircut mast kiya", "bhai ne time lekar banaya".
- ABSOLUTELY NEVER mention ladies bridal makeup, saree, waxing, delivery, or food.`
  } else if (profile.audiencePersona === "Family_Kids") {
    personaInstruction = `STRICT FAMILY TONE:
- Family perspective: "Family ke sath dinner kiya", "kids loved it", "parents ke sath gaye the".`
  }

  // 7. Dynamic Variable Grounding Prompt
  const allowedSample = profile.allowedSeoEntities.slice(0, 20).join(", ")
  const aeoSample = profile.allowedAeoAnswers.slice(0, 8).join(", ")
  const bannedSample = profile.strictlyNotAllowed.slice(0, 50).join(", ")

  // Category-specific anti-hallucination guard lines injected into prompt
  let categoryGuard = ""
  if (profile.categoryKey === "optical_store") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (OPTICIAN, EYEWEAR & SPECTACLES):
- BUSINESS TYPE: OPTICIAN / EYEWEAR STORE. NOT a bakery, not food, not a pet clinic, not dental.
- Assigned Customer Archetype: ${assignedArchetype.label}
- Specific Visit Need: ${assignedArchetype.need} (${assignedArchetype.angle})
- ANTI-REPETITION MANDATE (CRITICAL):
  * Focus ONLY on this specific customer goal: "${assignedArchetype.need}".
  * NEVER combine unrelated services! If this review is about ${assignedArchetype.label}, DO NOT mention ${assignedArchetype.avoid}!
  * FORBIDDEN FORMULAIC OPENINGS: DO NOT start your review with:
    - "The optometrist performed..."
    - "${profile.businessName} provided..."
    - "Visited ${profile.businessName}..."
    - "Got my eye testing done..."
  * Start dynamically and naturally: start with the need, the product, the comfort, or the experience.
  * FOR DRAFT 2: DO NOT write "thoda rush tha par service polite thi". Instead, naturally reflect this real visit context: "${assignedVibe}". Rephrase it in casual conversational Hinglish.
  * STRICTLY FORBIDDEN: Words like "cake", "bakery", "pastry", "food", "puppy", "dog", "cat", "teeth", "clinic doctor" are BANNED.`
  } else if (profile.categoryKey === "saree_palace" || profile.categoryKey === "clothing") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (SILK SAREE PALACE & BRIDAL ETHNIC WEAR):
- BUSINESS TYPE: SILK SAREE PALACE & BRIDAL WEAR SHOWROOM. NOT a pet clinic, not medical, not food.
- Reviewer = Woman / Bride / Family member shopping for authentic sarees and wedding wear.
- MUST USE SAREE & ETHNIC TERMS: silk saree, Pethapur craft, pure fabric, rich zari border, bridal lehenga, wedding shopping, patient sales staff, comfortable showroom.
- STRICTLY FORBIDDEN: Words like "puppy", "dog", "cat", "pet", "vaccination", "clinic", "doctor", "cake", "burger", "delivery" are BANNED.`
  } else if (profile.categoryKey === "pet_clinic") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (PET CLINIC — VETERINARY):
- BUSINESS TYPE: PET CLINIC / VETERINARY HOSPITAL. NOT a human hospital or medical clinic.
- Reviewer = PET OWNER. Subject = PET (dog/cat/puppy/kitten/rabbit). NOT a human patient.
- LEGAL PROHIBITION: Words "mera fever", "meri headache", "doctor consultation for me personally", "mujhe medicine di", "meri diagnosis", "my illness" are COMPLETELY BANNED.
- MUST USE PET TERMS: dog, cat, puppy, kitten, billi, kutte, pet, animal, vet, vaccination, deworming, parvovirus, tick fever, spaying, neutering, IV drip.
- EXAMPLE CORRECT: "Mera Labrador ka vaccination karwaya — vet bohot gentle tha."
- EXAMPLE WRONG (NEVER DO THIS): "Doctor consultation for me was thorough", "my fever was cured", "prescribed medicine for me".`
  } else if (profile.categoryKey === "dental_clinic") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (DENTAL CLINIC):
- BUSINESS TYPE: DENTAL / TEETH CLINIC. NOT general medicine, not veterinary, not food.
- Reviewer = human dental patient getting teeth/gum treatment.
- MUST USE DENTAL TERMS: root canal, teeth scaling, polishing, filling, braces, extraction, dental X-ray, gum treatment, teeth whitening.
- NEVER mention food ordering, delivery, haircut, animal/pet, biryani, or general medicine.`
  } else if (profile.categoryKey === "fast_food" || profile.categoryKey === "pizza_restaurant" || profile.categoryKey === "non_veg_restaurant") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (FOOD BUSINESS):
- BUSINESS TYPE: FOOD RESTAURANT / EATERY.
- Reviewer = customer who visited to EAT. Focus on taste, freshness, service speed, ambiance.
- NEVER mention doctor, clinic, medicine, haircut, salon, car wash, or software.`
  } else if (profile.audiencePersona === "Female_Only" || profile.categoryKey === "beauty_parlour") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (LADIES BEAUTY PARLOUR):
- BUSINESS TYPE: LADIES BEAUTY PARLOUR. Reviewer = woman/girl customer.
- MUST USE feminine language and beauty terms (threading, facial, waxing, hair spa, cleanup, bridal makeup).
- STRICTLY FORBIDDEN: NEVER mention masculine haircut/fade, beard, men grooming, pets, animals, clinic doctor, or food delivery.`
  } else if (profile.audiencePersona === "Male_Only" || profile.categoryKey === "salon_men") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (MEN SALON / BARBERSHOP):
- BUSINESS TYPE: MEN SALON / BARBER. Reviewer = male customer getting haircut/grooming.
- MUST USE masculine language and grooming terms (haircut, fade, beard styling, trim, head massage, hair wash, facial cleanup).
- STRICTLY FORBIDDEN: NEVER mention pets, dogs, cats, puppy, kitten, pet grooming, vet, clinic, doctor, ladies makeup, bridal saree, cake, or food delivery.`
  }

  // 8. Authentic Real GBP Past Reviews Style Inspiration (Few-Shot Grounding)
  const pastReviewsPool = (pastPublicReviews && pastPublicReviews.length > 0)
    ? pastPublicReviews
    : (profile.pastPublicReviews && profile.pastPublicReviews.length > 0)
      ? profile.pastPublicReviews
      : []

  const validPastReviews = pastReviewsPool
    .filter((r) => typeof r === "string" && r.trim().length >= 10)
    .slice(0, 3)

  let pastReviewStyleGuide = ""
  if (validPastReviews.length > 0) {
    pastReviewStyleGuide = `\n6. REAL PAST GOOGLE MAPS REVIEWS (STYLE & TONE INSPIRATION):\nBelow are authentic 5-star customer reviews previously left by real customers on "${profile.businessName}"'s Google Maps profile:\n${validPastReviews.map((r, i) => `   - Example ${i + 1}: "${r.replace(/"/g, "'").trim()}"`).join("\n")}\nDirectives:\n- Match the exact conversational style, Hinglish/English balance, and real emotional warmth of these genuine reviews.\n- Do NOT copy them word-for-word; write completely new, fresh drafts following their natural cadence.\n`
  }

  const systemPrompt = `[ROLE & OBJECTIVE]
You are CustomerPilot's authentic Indian consumer review drafting engine.
Generate 3 distinct, natural, human Google Maps reviews (12 to 20 words each) for "${profile.businessName}".
${categoryGuard}

MERCHANT STRICT BOUNDARIES:
1. Target Customer Persona:
${personaInstruction}

2. ALLOWED Offerings (Mention ONLY 1 of these services/products naturally):
${allowedSample}

3. ALLOWED Vibe / Context Signals:
${aeoSample}

4. Occasion / Context Angle:
${randomAngle} (Focus product: ${focalItem})

5. STRICTLY BANNED ENTITIES (DO NOT EVER MENTION ANY OF THESE):
${bannedSample}
${pastReviewStyleGuide}
CRITICAL ANTI-HALLUCINATION RULES:
- DO NOT mention delivery, doorstep delivery, or parcel unless the merchant is an online delivery service!
- DO NOT mention chai, tea, coffee, food, dinner, cakes, or snacks if this is a salon or parlor!
- DO NOT use the phrase "Store Special" or generic AI words ("top-notch", "hidden gem", "delve").
- Every single draft MUST feel 100% human, casual, and authentic.

[OUTPUT FORMAT]
Return ONLY a valid parseable JSON object:
{
  "draft_1": "12 to 20 words natural English or Hinglish focusing on the specific product experience",
  "draft_2": "12 to 20 words conversational Hinglish naturally reflecting this visit context ('${assignedVibe}') without clichéd repetition",
  "draft_3": "8 to 14 words punchy 1-liner review"
}`

  // A. Try Gemini if configured
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(geminiKey)
      const candidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

      const geminiPromise = (async (): Promise<string> => {
        for (const modelName of candidates) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: { temperature: 0.90 }
            })
            const res = await model.generateContent(systemPrompt)
            const text = (await res.response).text().trim()
            if (text && text.includes("{")) return text
          } catch (_) {
            continue
          }
        }
        return ""
      })()

      const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(""), 3500))
      const geminiResult = await Promise.race([geminiPromise, timeoutPromise])

      if (geminiResult) {
        const match = geminiResult.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          if (parsed.draft_1 && parsed.draft_2) {
            return {
              draft1: sanitizeStrict(parsed.draft_1),
              draft2: sanitizeStrict(parsed.draft_2),
              draft3: parsed.draft_3 ? sanitizeStrict(parsed.draft_3) : fallback.draft3
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("[DynamicReviewEngine] Gemini attempt failed:", err?.message)
    }
  }

  // B. Try Groq / OpenAI compatible LLM
  if (groqKey) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
          "User-Agent": "CustomerPilot/1.0"
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: "You generate authentic Indian Google reviews in strict JSON format. Strictly observe all banned keywords." },
            { role: "user", content: systemPrompt }
          ],
          temperature: 0.90,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      })

      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content?.trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (parsed.draft_1 && parsed.draft_2) {
            return {
              draft1: sanitizeStrict(parsed.draft_1),
              draft2: sanitizeStrict(parsed.draft_2),
              draft3: parsed.draft_3 ? sanitizeStrict(parsed.draft_3) : fallback.draft3
            }
          }
        }
      } else {
        const errText = await res.text().catch(() => "")
        console.warn(`[DynamicReviewEngine] Groq API returned status ${res.status}: ${errText.slice(0, 150)}`)
      }
    } catch (err: any) {
      console.warn("[DynamicReviewEngine] Groq attempt failed:", err?.message)
    }
  }

  return fallback
}
