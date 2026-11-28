import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  sanitizeCheckinName,
  validateCheckinPhone,
  buildWebCheckinWhatsappUrl,
  annotateQueueWaStatus,
  computePendingScanAlerts,
  performWebCheckin,
  getCleanStoreName,
} from "@/lib/web-checkin"
import {
  evaluateSilentInboundStall,
  getIstHour,
  buildTargetedAlertMessage,
} from "@/lib/whatsapp-monitor"
import { db } from "@/lib/db"

describe("Hybrid Web Check-In & Zero-Drop LiveQueue Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Phone Validation & Name Sanitization", () => {
    it("normalizes 10-digit Indian, 0-prefixed, and +91 spaced numbers cleanly", () => {
      expect(validateCheckinPhone("9033304707")).toEqual({
        ok: true,
        normalized: "919033304707",
        last10: "9033304707",
      })
      expect(validateCheckinPhone("09033304707")).toEqual({
        ok: true,
        normalized: "919033304707",
        last10: "9033304707",
      })
      expect(validateCheckinPhone("+91 90333 04707")).toEqual({
        ok: true,
        normalized: "919033304707",
        last10: "9033304707",
      })
    })

    it("rejects short, empty, or repeated single-digit junk numbers", () => {
      expect(validateCheckinPhone("")).toMatchObject({ ok: false })
      expect(validateCheckinPhone("12345")).toMatchObject({ ok: false })
      expect(validateCheckinPhone("9999999999")).toMatchObject({ ok: false })
      expect(validateCheckinPhone("0000000000")).toMatchObject({ ok: false })
    })

    it("strips HTML/script characters and clamps customer name length", () => {
      expect(sanitizeCheckinName(`  <script>Hitesh</script> "Kumar'  `)).toBe("scriptHitesh/script Kumar")
      expect(sanitizeCheckinName("A".repeat(120)).length).toBe(60)
      expect(getCleanStoreName("Cake Connection-Live Cake : Online Cake Delivery")).toBe(
        "Cake Connection-Live Cake"
      )
    })
  })

  describe("WhatsApp URL Hygiene (Avoids QUEUE_DUPLICATE Spam)", () => {
    it("confirm_done URL avoids queue trigger and wallet keywords", () => {
      const url = buildWebCheckinWhatsappUrl({
        whatsappPhone: "917203824012",
        displayName: "Cake Connection (Vadodara)",
        mode: "confirm_done",
      })
      expect(url).toBeTruthy()
      const parsed = new URL(url!)
      const textParam = parsed.searchParams.get("text") || ""
      expect(url).toContain("https://wa.me/917203824012?text=")
      expect(textParam).toBe("Hi Cake Connection! VIP Check-in Done ✅")
      expect(textParam.toLowerCase()).not.toContain("checking in for")
      expect(textParam.toLowerCase()).not.toContain("stamp")
    })

    it("fallback_direct URL preserves legacy trigger & optional referral code", () => {
      const url = buildWebCheckinWhatsappUrl({
        whatsappPhone: "917203824012",
        displayName: "Cake Connection",
        mode: "fallback_direct",
        referralCode: "cp-4707",
      })
      const decoded = decodeURIComponent(url!)
      expect(decoded).toContain("Checking in for my VIP Club stamps (ref:counter) CP-4707")
    })
  })

  describe("LiveQueue WhatsApp Verification Annotation", () => {
    it("distinguishes legacy WA, instant Web, WA-pending Web (>=90s), and Web+WA verified", () => {
      const now = new Date("2026-11-28T13:30:00Z")
      const annotated = annotateQueueWaStatus({
        now,
        waitingEntries: [
          {
            id: "w_legacy",
            scannedAt: new Date(now.getTime() - 120_000),
            scanSource: "qr_counter_whatsapp",
            customer: { phone: "919000000001" },
          },
          {
            id: "w_instant",
            scannedAt: new Date(now.getTime() - 30_000),
            scanSource: "qr_web_hybrid",
            customer: { phone: "919000000002" },
          },
          {
            id: "w_pending",
            scannedAt: new Date(now.getTime() - 120_000),
            scanSource: "qr_web_hybrid",
            customer: { phone: "919033304707" },
          },
          {
            id: "w_verified",
            scannedAt: new Date(now.getTime() - 150_000),
            scanSource: "qr_web_hybrid",
            customer: { phone: "919825011223" },
          },
        ],
        incomingMessages: [
          {
            template: "INCOMING",
            toPhone: "9825011223",
            createdAt: new Date(now.getTime() - 130_000),
          },
          // Inbound BEFORE scan (>30s older) should NOT verify current visit
          {
            template: "INCOMING",
            toPhone: "919033304707",
            createdAt: new Date(now.getTime() - 300_000),
          },
        ],
      })

      expect(annotated.map((x) => x.waConfirmStatus)).toEqual([
        "wa_verified",
        "web_instant",
        "pending_wa",
        "wa_verified",
      ])
    })
  })

  describe("Pending Scan Drop Catcher (Hybrid Safety Net)", () => {
    it("flags unconfirmed WhatsApp skip scans after 60s and clears when matched or dismissed", () => {
      const now = new Date("2026-11-28T13:30:00Z")
      const alerts = computePendingScanAlerts({
        now,
        scanLogs: [
          // Unconfirmed 2 mins ago -> drop_suspected
          {
            id: "log1",
            createdAt: new Date(now.getTime() - 120_000),
            metadata: JSON.stringify({ scanId: "scan_drop_1", source: "digital_card" }),
          },
          // Unconfirmed 20s ago -> awaiting_wa
          {
            id: "log2",
            createdAt: new Date(now.getTime() - 20_000),
            metadata: JSON.stringify({ scanId: "scan_fresh_2", source: "counter" }),
          },
          // Dismissed scan -> cleared
          {
            id: "log3",
            createdAt: new Date(now.getTime() - 180_000),
            metadata: JSON.stringify({ scanId: "scan_dismissed_3", source: "counter" }),
          },
          // Confirmed via WaitingCustomer entry 10s later -> cleared
          {
            id: "log4",
            createdAt: new Date(now.getTime() - 300_000),
            metadata: JSON.stringify({ scanId: "scan_matched_4", source: "counter" }),
          },
        ],
        dismissLogs: [
          { entityId: "scan_dismissed_3", metadata: JSON.stringify({ scanId: "scan_dismissed_3" }) },
        ],
        waitingEntries: [
          // Only within 300s scan window (-5s..+15m), wait log1 also shouldn't be cleared by older waiting!
          // Make log4 600s ago and waiting 590s ago so only log4 matches window after log4's scanMs:
          { scannedAt: new Date(now.getTime() - 290_000) },
        ],
        incomingMessages: [],
      })

      // log1 occurred at now-120s while waiting occurred at now-290s (before log1 -> NOT matched!)
      // log2 occurred at now-20s -> awaiting_wa
      // log4 occurred at now-300s and waiting occurred at now-290s -> matched & cleared!
      expect(alerts).toHaveLength(2)
      expect(alerts[0]).toMatchObject({
        scanId: "scan_drop_1",
        status: "drop_suspected",
        elapsedSeconds: 120,
      })
      expect(alerts[1]).toMatchObject({
        scanId: "scan_fresh_2",
        status: "awaiting_wa",
        elapsedSeconds: 20,
      })
    })
  })

  describe("performWebCheckin DB-Mocked Behavior", () => {
    it("succeeds even if Evolution API / WhatsApp outbound throws or times out", async () => {
      vi.spyOn(db.merchant, "findUnique").mockResolvedValue({
        id: "m_cake",
        name: "Cake Connection",
        logoUrl: null,
        whatsappPhone: "917203824012",
        whatsappInstanceName: "CP_M_cake",
        loyaltyCategoryNames: null,
        status: "active",
        trialEndsAt: null,
        digitalBusinessCard: {
          slug: "cake-connection",
          whatsappNumber: "917203824012",
          phoneNumber: "917203824012",
          logoUrl: null,
        },
        stampCards: [
          {
            id: "sc_1",
            name: "Cake VIP",
            rewardName: "Free Cake",
            stampValue: 500,
            stampsRequired: 10,
            googleReviewBonus: 0,
          },
        ],
      } as never)

      vi.spyOn(db.referral, "findFirst").mockResolvedValue(null)
      vi.spyOn(db.customer, "findFirst").mockResolvedValue({
        id: "cust_1",
        merchantId: "m_cake",
        name: "Hitesh Kumar",
        phone: "919033304707",
        referredById: null,
        deletedAt: null,
      } as never)
      vi.spyOn(db.customer, "update").mockResolvedValue({
        id: "cust_1",
        merchantId: "m_cake",
        name: "Hitesh Kumar",
        phone: "919033304707",
      } as never)
      vi.spyOn(db.waitingCustomer, "findFirst").mockResolvedValue(null)
      vi.spyOn(db.waitingCustomer, "create").mockResolvedValue({
        id: "wc_web_1",
        merchantId: "m_cake",
        customerId: "cust_1",
        status: "waiting",
        scannedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        scanSource: "qr_web_hybrid",
      } as never)
      vi.spyOn(db.waitingCustomer, "findMany").mockResolvedValue([{ id: "wc_web_1" }] as never)
      vi.spyOn(db.auditLog, "create").mockResolvedValue({ id: "aud_1" } as never)
      vi.spyOn(db.whatsAppMessage, "create").mockRejectedValue(new Error("WA down") as never)

      const res = await performWebCheckin({
        merchantId: "m_cake",
        phone: "9033304707",
        name: "Hitesh Kumar",
      })

      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.data.queueId).toBe("wc_web_1")
        expect(res.data.position).toBe(1)
        expect(res.data.phone).toBe("919033304707")
        expect(res.data.waConfirmUrl).toContain("VIP%20Check-in%20Done")
      }
    })
  })
})

describe("WhatsApp Monitor — Silent Inbound Stall Detection (Step A)", () => {
  it("computes IST hours accurately", () => {
    // 07:36 UTC = 13:06 IST (1:06 PM IST)
    expect(getIstHour(new Date("2026-11-28T07:36:00Z"))).toBe(13)
    // 18:30 UTC = 00:00 IST next day
    expect(getIstHour(new Date("2026-11-28T18:30:00Z"))).toBe(0)
  })

  it("flags immediately when 2+ counter QR->WA scans drop in 30 mins even outside business hours", () => {
    const res = evaluateSilentInboundStall({
      now: new Date("2026-11-28T03:00:00Z"), // 08:30 IST
      recentInbound7dCount: 1,
      lastInboundAt: new Date("2026-11-28T02:50:00Z"),
      pendingDropScanCount30m: 2,
    })
    expect(res.stalled).toBe(true)
    expect(res.reasonDetail).toContain("2 counter QR scans")
  })

  it("enforces IST business hours (12..21) and 4h silent threshold for active merchants", () => {
    // 11:59 IST -> no alert
    expect(
      evaluateSilentInboundStall({
        now: new Date("2026-11-28T06:29:00Z"),
        recentInbound7dCount: 25,
        lastInboundAt: new Date("2026-11-28T01:00:00Z"),
        pendingDropScanCount30m: 0,
      }).stalled
    ).toBe(false)

    // 13:06 IST, active merchant (5 msgs/7d), 3.9h silent -> no alert
    expect(
      evaluateSilentInboundStall({
        now: new Date("2026-11-28T07:36:00Z"),
        recentInbound7dCount: 5,
        lastInboundAt: new Date(new Date("2026-11-28T07:36:00Z").getTime() - 3.9 * 3600 * 1000),
        pendingDropScanCount30m: 0,
      }).stalled
    ).toBe(false)

    // 13:06 IST, active merchant (5 msgs/7d), 4.0h silent -> STALL ALERT
    const stalledRes = evaluateSilentInboundStall({
      now: new Date("2026-11-28T07:36:00Z"),
      recentInbound7dCount: 5,
      lastInboundAt: new Date(new Date("2026-11-28T07:36:00Z").getTime() - 4.0 * 3600 * 1000),
      pendingDropScanCount30m: 0,
    })
    expect(stalledRes.stalled).toBe(true)
    expect(stalledRes.reasonDetail).toContain("4.0h")

    // Quiet low-volume merchant (<5 inbound in 7d) -> no false alarm
    expect(
      evaluateSilentInboundStall({
        now: new Date("2026-11-28T07:36:00Z"),
        recentInbound7dCount: 4,
        lastInboundAt: null,
        pendingDropScanCount30m: 0,
      }).stalled
    ).toBe(false)
  })

  it("renders a distinct Hinglish alert message for SILENT_INBOUND_STALL", () => {
    const msg = buildTargetedAlertMessage({
      storeName: "Cake Connection",
      issueType: "SILENT_INBOUND_STALL",
      appBaseUrl: "https://customerpilot.in",
    })
    expect(msg).toContain("Silent Inbound Stall")
    expect(msg).toContain("Cake Connection")
    expect(msg).toContain("Web Check-in link")
  })
})
