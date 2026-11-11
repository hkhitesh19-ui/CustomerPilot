/**
 * src/lib/video-pipeline.ts
 * 
 * CustomerPilot Programmatic Video Filmmaking Pipeline
 * Inspired by lemomo-ai/lemo-opuscar architecture.
 * 
 * Compiles pure programmatic instructions into 60 FPS frame-by-frame
 * vector motion graphics without generative video AI distortion.
 */

export interface VideoBeat {
  startSec: number;
  endSec: number;
  text: string;
  visualCue: string;
  actor: "voiceover" | "sound_effect" | "music_beat";
  screenState: {
    headline: string;
    subtext: string;
    primaryElement: "ALERT_CARD" | "CURSOR_FLOW" | "HUD_3D_CARD" | "SPLIT_COUNTDOWN" | "LOGO_REVEAL";
    accentColor: string;
    badgeText?: string;
  };
}

export interface VideoPreset {
  id: "swiss-motion" | "living-screencast" | "dark-keynote" | "countdown";
  funnelStage: "Awareness (ToFU)" | "Explainer (MoFU)" | "Promotion (BoFU)" | "Meta Ads (Direct)";
  name: string;
  repoStylePreset: string;
  durationSec: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
  visualStrategy: string;
  customerPilotUseCase: string;
  colorPalette: {
    background: string;
    cardBg: string;
    text: string;
    accent: string;
    badge: string;
  };
  beats: VideoBeat[];
}

export const VIDEO_PRESETS: Record<string, VideoPreset> = {
  "swiss-motion": {
    id: "swiss-motion",
    funnelStage: "Awareness (ToFU)",
    name: "Swiss-Motion Typography (15s Awareness)",
    repoStylePreset: "swiss-motion / pictogram-motion",
    durationSec: 15,
    aspectRatio: "9:16",
    visualStrategy: "High-contrast typographic grid, music-locked tempo, single alert accent.",
    customerPilotUseCase: "Hook local shop owners: '1 Negative Review = 30 Lost Customers' or discarded paper punch cards.",
    colorPalette: {
      background: "#090d16",
      cardBg: "#111827",
      text: "#f8fafc",
      accent: "#ef4444",
      badge: "#dc2626",
    },
    beats: [
      {
        startSec: 0,
        endSec: 3,
        text: "Ek negative review aur aapke 30 naye customers gayab! Kya aapka local business bhi roz yeh nuksan utha raha hai?",
        visualCue: "Harsh 1-Star Buzzer + Screen Shake + Red Accent Alert",
        actor: "sound_effect",
        screenState: {
          headline: "1 NEGATIVE REVIEW = 30 LOST CUSTOMERS",
          subtext: "Kya aapka local business roz yeh nuksan utha raha hai?",
          primaryElement: "ALERT_CARD",
          accentColor: "#ef4444",
          badgeText: "CRITICAL REVENUE LEAK ⚠️",
        },
      },
      {
        startSec: 3,
        endSec: 8,
        text: "Purane paper stamp cards aur manual review mangne ka tarika ab outdated ho chuka hai. Customers aate hain, bhul jaate hain, aur dubara kabhi wapas nahi aate.",
        visualCue: "Paper card crumpled animation + Falling trash icon",
        actor: "voiceover",
        screenState: {
          headline: "PAPER CARDS ARE DEAD 🗑️",
          subtext: "Purane stamp cards dustbin me jaate hain, customer wapas nahi aata.",
          primaryElement: "ALERT_CARD",
          accentColor: "#f59e0b",
          badgeText: "OUTDATED MANUAL RETENTION",
        },
      },
      {
        startSec: 8,
        endSec: 15,
        text: "Bina kisi extra app ke apne business ko autopilot par lao. Milo CustomerPilot se—Smart Reviews aur WhatsApp Loyalty ka ultimate power-up!",
        visualCue: "Clean vector logo reveal + WhatsApp badge pop + Smooth zoom",
        actor: "voiceover",
        screenState: {
          headline: "ZERO APP DOWNLOAD · 100% AUTOPILOT",
          subtext: "Smart AI Reviews + WhatsApp Loyalty Stamp Cards",
          primaryElement: "LOGO_REVEAL",
          accentColor: "#10b981",
          badgeText: "CUSTOMERPILOT GROWTH SUITE 🚀",
        },
      },
    ],
  },

  "living-screencast": {
    id: "living-screencast",
    funnelStage: "Explainer (MoFU)",
    name: "Living-Screencast (30s Step-by-Step Flow)",
    repoStylePreset: "living-screencast / iso-infographic",
    durationSec: 30,
    aspectRatio: "9:16",
    visualStrategy: "Smooth viewport pan-and-zoom, live cursor simulation, isometric nodes.",
    customerPilotUseCase: "Step-by-step 3-stage flow: Counter QR Scan → WhatsApp Stamp → AI Google Review Boost.",
    colorPalette: {
      background: "#0a0f1d",
      cardBg: "#1e293b",
      text: "#ffffff",
      accent: "#3b82f6",
      badge: "#2563eb",
    },
    beats: [
      {
        startSec: 0,
        endSec: 7,
        text: "Soch rahe ho ki CustomerPilot bina kisi app download ke kaam kaise karta hai? Bohot simple hai, sirf 3 steps!",
        visualCue: "Camera dolly in towards interactive smartphone screen",
        actor: "voiceover",
        screenState: {
          headline: "KAAM KAISE KARTA HAI?",
          subtext: "Zero App Download · Customer ke WhatsApp par instant!",
          primaryElement: "CURSOR_FLOW",
          accentColor: "#3b82f6",
          badgeText: "3-STEP AUTOPILOT ENGINE",
        },
      },
      {
        startSec: 7,
        endSec: 18,
        text: "Step 1: Customer bill counter par QR code scan karta hai. Step 2: Uske WhatsApp par turant digital stamp mil jata hai—matlab zero friction, zero paper loss!",
        visualCue: "Simulated cursor taps QR code -> WhatsApp chat bubble animates with stamp badge",
        actor: "voiceover",
        screenState: {
          headline: "STEP 1 & 2: SCAN & WHATSAPP STAMP",
          subtext: "Counter QR Scan ➔ Digital Loyalty Stamp Delivered",
          primaryElement: "CURSOR_FLOW",
          accentColor: "#10b981",
          badgeText: "ZERO FRICTION · ZERO PAPER LOSS",
        },
      },
      {
        startSec: 18,
        endSec: 30,
        text: "Aur Step 3? Hamara Smart AI system feedback filter karta hai. Agar 4 ya 5 stars hain, toh seedha Google Maps par review post hota hai. Local ranking booster on autopilot!",
        visualCue: "5-Star rating pop -> Google Maps 3-Pack rank #1 ascent badge",
        actor: "voiceover",
        screenState: {
          headline: "STEP 3: SMART AI GOOGLE REVIEW",
          subtext: "4-5 Stars ➔ Direct Google Maps Top 3 Pack Rank Booster",
          primaryElement: "CURSOR_FLOW",
          accentColor: "#6366f1",
          badgeText: "TOP 3 LOCAL PACK RANKING 🎯",
        },
      },
    ],
  },

  "dark-keynote": {
    id: "dark-keynote",
    funnelStage: "Promotion (BoFU)",
    name: "Dark Keynote Glass Product (20s Executive HUD)",
    repoStylePreset: "dark-keynote / glass-product",
    durationSec: 20,
    aspectRatio: "9:16",
    visualStrategy: "Dark mode executive HUD, 3D card tilt, floating specular lighting.",
    customerPilotUseCase: "Brand positioning: Showcasing 40% repeat customer retention and VIP Club automation.",
    colorPalette: {
      background: "#030712",
      cardBg: "#0f172a",
      text: "#f1f5f9",
      accent: "#8b5cf6",
      badge: "#7c3aed",
    },
    beats: [
      {
        startSec: 0,
        endSec: 5,
        text: "Apne pehli baar aane wale walk-in customers ko loyal VIP regulars me badlo, bina ek bhi extra effort ke.",
        visualCue: "3D floating acrylic card tilts under spotlight",
        actor: "voiceover",
        screenState: {
          headline: "WALK-IN TO VIP REGULAR 👑",
          subtext: "Bina kisi extra effort ke apne customers ko retain karo.",
          primaryElement: "HUD_3D_CARD",
          accentColor: "#8b5cf6",
          badgeText: "EXECUTIVE RETENTION ENGINE",
        },
      },
      {
        startSec: 5,
        endSec: 12,
        text: "CustomerPilot ka WhatsApp VIP Club automated digital stamps aur smart reminders ke sath aapke repeat sales ko 40% tak badha deta hai.",
        visualCue: "HUD telemetry graph spikes upwards (+40% Repeat Sales counter)",
        actor: "voiceover",
        screenState: {
          headline: "+40% REPEAT SALES RECORDED",
          subtext: "Automated digital stamps & intelligent anniversary reminders.",
          primaryElement: "HUD_3D_CARD",
          accentColor: "#10b981",
          badgeText: "VERIFIED ROI METRIC",
        },
      },
      {
        startSec: 12,
        endSec: 20,
        text: "Google reviews aur customer retention ab fully automated hain. Aaj hi CustomerPilot.in par visit karo aur apna free trial shuru karo!",
        visualCue: "Gleaming CTA button with pulsing glow ring + website URL",
        actor: "voiceover",
        screenState: {
          headline: "START YOUR 3-DAY FREE TRIAL",
          subtext: "Visit CustomerPilot.in or tap WhatsApp below!",
          primaryElement: "LOGO_REVEAL",
          accentColor: "#ec4899",
          badgeText: "100% MONEYBACK GUARANTEE INCLUDED",
        },
      },
    ],
  },

  "countdown": {
    id: "countdown",
    funnelStage: "Meta Ads (Direct)",
    name: "Countdown Microgame (15s High-CTR Meta Ad)",
    repoStylePreset: "countdown / microgame",
    durationSec: 15,
    aspectRatio: "9:16",
    visualStrategy: "Split-screen comparison, urgency indicators, gamified stamp counters.",
    customerPilotUseCase: "Side-by-side: Outdated manual punch cards vs. automated CustomerPilot WhatsApp VIP Club.",
    colorPalette: {
      background: "#050505",
      cardBg: "#171717",
      text: "#ffffff",
      accent: "#e11d48",
      badge: "#be123c",
    },
    beats: [
      {
        startSec: 0,
        endSec: 4,
        text: "Purana kachra paper card vs 100% Automated WhatsApp Digital Loyalty Club. Fark saaf hai!",
        visualCue: "Split screen vertical divider slides across screen with sound effect",
        actor: "voiceover",
        screenState: {
          headline: "OLD PAPER CARD vs WHATSAPP VIP CLUB",
          subtext: "Fark saaf hai — Zero lost cards, instant retention!",
          primaryElement: "SPLIT_COUNTDOWN",
          accentColor: "#e11d48",
          badgeText: "SIDE-BY-SIDE REALITY CHECK",
        },
      },
      {
        startSec: 4,
        endSec: 10,
        text: "CustomerPilot automatic WhatsApp messages bhejkar aapke purane customers ko wapas shop par khich kar laata hai.",
        visualCue: "Gamified stamp animation: 5/5 stamps unlock reward celebration",
        actor: "voiceover",
        screenState: {
          headline: "BRING OLD CUSTOMERS BACK 🔄",
          subtext: "Automatic WhatsApp alerts with personalized gift vouchers.",
          primaryElement: "SPLIT_COUNTDOWN",
          accentColor: "#f59e0b",
          badgeText: "AUTOMATED FOOTFALL MAGNET",
        },
      },
      {
        startSec: 10,
        endSec: 15,
        text: "Apni dukan ki rating aur sales badhane ke liye niche 'Sign Up' button par click karo!",
        visualCue: "Urgency countdown: 03:00 -> 00:00 + High-contrast Sign Up pulse",
        actor: "voiceover",
        screenState: {
          headline: "CLAIM YOUR FREE LAUNCH OFFER",
          subtext: "Tap 'Sign Up' below or visit CustomerPilot.in",
          primaryElement: "LOGO_REVEAL",
          accentColor: "#10b981",
          badgeText: "LIMITED FOUNDING MERCHANT OFFER",
        },
      },
    ],
  },
};

/**
 * Customizes video storyboard for a specific merchant business
 */
export function buildMerchantCustomizedVideo(presetId: string, merchant: {
  name: string;
  category?: string;
  city?: string;
  address?: string;
}) {
  const base = VIDEO_PRESETS[presetId] || VIDEO_PRESETS["swiss-motion"];
  const storeName = merchant.name || "CustomerPilot Store";
  const locality = merchant.city || "your city";

  // Deep clone and inject merchant context
  const customized: VideoPreset = JSON.parse(JSON.stringify(base));

  customized.beats = customized.beats.map(beat => {
    return {
      ...beat,
      text: beat.text
        .replace("CustomerPilot", storeName)
        .replace("local business", `${merchant.category || "store"} in ${locality}`),
      screenState: {
        ...beat.screenState,
        subtext: beat.screenState.subtext
          .replace("CustomerPilot", storeName)
          .replace("your city", locality),
      }
    };
  });

  return customized;
}
