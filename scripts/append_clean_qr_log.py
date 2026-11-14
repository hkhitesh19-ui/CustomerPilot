import os

path = "RESOLVED_ISSUES_LOG.md"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

entry = """---

## [15 Nov 2026] Fix & Feature: Clean QR without CP Center Logo, Loyalty Standee Logo Uploader & Smart City Detection for Fleet
- **Symptom**:
  1. QR codes displayed CustomerPilot logo in the center instead of a clean scannable QR or merchant's own business logo.
  2. In `/dashboard/settings` -> Counter QR Standee Studio (Section 1 / Step 2), there was no option for merchants to upload or update their business logo on the physical loyalty standee.
  3. SuperAdmin Registered Merchants Fleet showed "India" as city for newly registered merchants (e.g. Maw & Paw) instead of their actual operating city (Vadodara) and GBP reviews/ratings were desynced if auto-detect was not run or address parsing fell back to country.
- **Root Cause**:
  1. `src/lib/branded-qr.ts` and `src/lib/client-branded-qr.ts` unconditionally embedded `cplogo_notagline.png` or `cplogo_icon.png` in the center of the QR whenever a merchant logo was absent.
  2. `src/components/qr-generator.tsx` only displayed template selection and print/download buttons without a logo management widget.
  3. `extractCityFromAddress` in `src/app/api/admin/merchants/sync-gbp/route.ts` used fixed comma-split positions from the end which matched "India" as the city candidate when addresses omitted district/state tokens or had variable lengths.
- **Resolution**:
  1. Updated `src/lib/branded-qr.ts` and `src/lib/client-branded-qr.ts` to return clean high-resolution QRs without any CustomerPilot center watermark when no merchant logo is provided, and embed the merchant's own logo when uploaded.
  2. Added full Store Logo Upload and Management studio in `src/components/qr-generator.tsx` (Counter QR Standee Studio) supporting image preview, PNG/JPG/WebP upload via `/api/merchant/upload-brand`, instant standee artwork refresh, and 1-click removal.
  3. Hardened `extractCityFromAddress` in `sync-gbp/route.ts` with a comprehensive Indian state/country exclusion filter walking backwards to accurately detect municipal cities and override placeholder/country values like "India" or "N/A".
- **Status**: ✅ Resolved and Verified.

"""

idx = content.find("---")
if idx != -1:
    idx_next = content.find("\n", idx)
    new_content = content[:idx_next+1] + "\n" + entry + content[idx_next+1:]
else:
    new_content = entry + content

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated RESOLVED_ISSUES_LOG.md successfully")
