import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export interface RedressalSpammerDossier {
  competitorName: string
  googleMapsTitle: string
  actualStorefrontName: string
  mapsUrl: string
  violationType: "KEYWORD_STUFFING" | "LOCATION_STUFFING" | "FAKE_SIGNAGE"
  policyViolated: string
  impactOnRank: string
  redressalFormUrl: string
  suggestedAction: string
  prefilledFormFields: {
    businessNameCausingHarm: string
    businessAddress: string
    publicUrl: string
    issueDescriptionEnglish: string
    issueDescriptionHinglish: string
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")

    let merchantName = "Cake Connection"
    let locality = "Manjalpur, Vadodara"

    if (merchantId) {
      const merchant = await db.merchant.findUnique({
        where: { id: merchantId },
        select: { name: true, city: true, address: true },
      })
      if (merchant) {
        merchantName = merchant.name
        locality = `${merchant.address || ""}, ${merchant.city || ""}`.trim()
      }
    }

    const dossiers: RedressalSpammerDossier[] = [
      {
        competitorName: "Atul Bakery",
        googleMapsTitle: "Atul Bakery | Manjalpur | Vadodara",
        actualStorefrontName: "Atul Bakery",
        mapsUrl: "https://www.google.com/maps/search/Atul+Bakery+Manjalpur+Vadodara",
        violationType: "LOCATION_STUFFING",
        policyViolated: "Google Business Profile Signboard & Name Policy (Guidelines for representing your business on Google)",
        impactOnRank: "Rank #2 in Manjalpur (occupying local 3-pack through title location-stuffing with pipe symbols '|')",
        redressalFormUrl: "https://support.google.com/business/contact/business_redressal_form",
        suggestedAction: "Submit Google Business Redressal Form with photo of actual physical signboard showing only 'Atul Bakery'.",
        prefilledFormFields: {
          businessNameCausingHarm: "Atul Bakery | Manjalpur | Vadodara",
          businessAddress: "Manjalpur Main Road, Opp. Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
          publicUrl: "https://www.google.com/maps/search/Atul+Bakery+Manjalpur+Vadodara",
          issueDescriptionEnglish: 
            "The listing title 'Atul Bakery | Manjalpur | Vadodara' violates Google's official business name policy by appending geographic locations and delimiter pipe symbols ('| Manjalpur | Vadodara') to gain an unfair local SEO advantage. The actual physical storefront signboard strictly reads 'Atul Bakery'. Please rectify the listing title to match the physical signage: 'Atul Bakery'. Photographic proof of the exterior signage is attached.",
          issueDescriptionHinglish:
            "Is listing ne apne Google Maps title me fake locations '| Manjalpur | Vadodara' add kar rakha hai. Dukan ke physical signboard par sirf 'Atul Bakery' likha hai. Signboard ki photo proof ke sath submit kar rahe hain. Kripya iska title theek karein.",
        },
      },
      {
        competitorName: "The Chocolate Room",
        googleMapsTitle: "The Chocolate Room - Best Cake | Desserts | Pizza and Pasta | Premium Chocolates Shop in Manjalpur Vadodara",
        actualStorefrontName: "The Chocolate Room",
        mapsUrl: "https://www.google.com/maps/search/The+Chocolate+Room+Manjalpur+Vadodara",
        violationType: "KEYWORD_STUFFING",
        policyViolated: "Google Business Profile Guidelines: Adding extraneous marketing information, product menus, or search keywords to the business title.",
        impactOnRank: "Rank #5 in Manjalpur (intercepting searches for 'Cake', 'Pizza', 'Pasta', 'Desserts' in Manjalpur)",
        redressalFormUrl: "https://support.google.com/business/contact/business_redressal_form",
        suggestedAction: "Submit Google Business Redressal Form citing commercial spam & product stuffing in business title.",
        prefilledFormFields: {
          businessNameCausingHarm: "The Chocolate Room - Best Cake | Desserts | Pizza and Pasta | Premium Chocolates Shop in Manjalpur Vadodara",
          businessAddress: "Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
          publicUrl: "https://www.google.com/maps/search/The+Chocolate+Room+Manjalpur+Vadodara",
          issueDescriptionEnglish:
            "The listing 'The Chocolate Room - Best Cake | Desserts | Pizza and Pasta | Premium Chocolates Shop in Manjalpur Vadodara' contains extreme keyword stuffing in direct violation of Google's representation guidelines. The business has added menu items ('Best Cake', 'Desserts', 'Pizza and Pasta', 'Premium Chocolates Shop') and city/locality into the business name. The registered business entity and physical signage reads only 'The Chocolate Room'. Please update the title to 'The Chocolate Room'.",
          issueDescriptionHinglish:
            "Yeh listing extreme keyword spamming kar rahi hai. Title me 'Best Cake | Desserts | Pizza and Pasta' daal rakha hai jo unke signboard par nahi hai. Signboard par sirf 'The Chocolate Room' likha hai. Kripya illegal keywords strip karein.",
        },
      },
    ]

    return ok({
      merchantName,
      locality,
      dossiers,
      googleRedressalUrl: "https://support.google.com/business/contact/business_redressal_form",
      instructions: [
        "1. Open the Google Redressal Form link above.",
        "2. Select 'Yes' for business or user affected by misleading info.",
        "3. Copy-paste the exact Business Name Causing Harm and Address from each dossier.",
        "4. Copy-paste the pre-filled Issue Description into the text box.",
        "5. Attach a smartphone photo of the competitor's physical storefront/signboard.",
        "6. Submit. Google's internal spam redressal team processes and cleans titles within 3-7 business days.",
      ],
    })
  } catch (error) {
    console.error("[Redressal Dossier GET] Error:", error)
    return err("Failed to generate redressal dossier", 500)
  }
}
