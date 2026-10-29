import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  evaluateInstanceStatus,
  buildTargetedAlertMessage,
  runFleetWhatsAppMonitor,
  WhatsAppIssueType
} from "../src/lib/whatsapp-monitor"
import { db } from "../src/lib/db"

describe("WhatsApp Fleet Monitor & Targeted Alert Engine", () => {
  const sampleMerchant = {
    id: "m_cake_123",
    name: "Cake Connection",
    phone: "917203824012",
    whatsappPhone: "917203824012",
    whatsappInstanceName: "CP_917203824012_test"
  }

  describe("Instance Status Evaluation & Reason Classification", () => {
    it("should classify active open socket with ownerJid as HEALTHY", () => {
      const res = evaluateInstanceStatus(sampleMerchant, {
        connectionStatus: "open",
        ownerJid: "917203824012@s.whatsapp.net"
      })

      expect(res.status).toBe("HEALTHY")
      expect(res.issueType).toBeNull()
      expect(res.reasonDetail).toContain("active and linked")
    })

    it("should classify 401 disconnect as SESSION_LOGGED_OUT_401", () => {
      const res = evaluateInstanceStatus(sampleMerchant, {
        connectionStatus: "close",
        disconnectionReasonCode: 401,
        disconnectionAt: "2026-10-26T12:19:28.025Z"
      })

      expect(res.status).toBe("ISSUE_DETECTED")
      expect(res.issueType).toBe("SESSION_LOGGED_OUT_401")
      expect(res.disconnectionCode).toBe(401)
      expect(res.reasonDetail).toContain("logged out or unlinked")
    })

    it("should classify connecting state as QR_SCAN_PENDING", () => {
      const res = evaluateInstanceStatus(sampleMerchant, {
        connectionStatus: "connecting",
        ownerJid: null
      })

      expect(res.status).toBe("ISSUE_DETECTED")
      expect(res.issueType).toBe("QR_SCAN_PENDING")
      expect(res.reasonDetail).toContain("pending phone QR scan")
    })

    it("should classify 403 disconnect as ACCOUNT_RESTRICTED_403", () => {
      const res = evaluateInstanceStatus(sampleMerchant, {
        connectionStatus: "close",
        disconnectionReasonCode: 403
      })

      expect(res.status).toBe("ISSUE_DETECTED")
      expect(res.issueType).toBe("ACCOUNT_RESTRICTED_403")
      expect(res.disconnectionCode).toBe(403)
      expect(res.reasonDetail).toContain("restricted by Meta")
    })

    it("should classify unexpected socket close or timeout as PHONE_OFFLINE_OR_TIMEOUT", () => {
      const res = evaluateInstanceStatus(sampleMerchant, {
        connectionStatus: "close",
        disconnectionReasonCode: 515
      })

      expect(res.status).toBe("ISSUE_DETECTED")
      expect(res.issueType).toBe("PHONE_OFFLINE_OR_TIMEOUT")
      expect(res.reasonDetail).toContain("offline, dead battery, or dropped connection")
    })

    it("should classify missing instance as INSTANCE_NOT_CONFIGURED", () => {
      const unconfiguredMerchant = {
        id: "m_new_456",
        name: "Fresh Store",
        phone: "919876543210",
        whatsappPhone: null,
        whatsappInstanceName: null
      }

      const res = evaluateInstanceStatus(unconfiguredMerchant, null)

      expect(res.status).toBe("ISSUE_DETECTED")
      expect(res.issueType).toBe("INSTANCE_NOT_CONFIGURED")
      expect(res.reasonDetail).toContain("not configured any WhatsApp instance")
    })
  })

  describe("Targeted Message Templating (Strict Per-Issue Differentiation)", () => {
    it("should generate 401-specific message with Meta 401 explanation and 1-click link", () => {
      const msg = buildTargetedAlertMessage({
        storeName: "Cake Connection",
        issueType: "SESSION_LOGGED_OUT_401",
        appBaseUrl: "https://customerpilot.in"
      })

      expect(msg).toContain("Cake Connection")
      expect(msg).toContain("unlink / logout")
      expect(msg).toContain("Meta Security Code 401")
      expect(msg).toContain("https://customerpilot.in/dashboard/settings#section-whatsapp")
      expect(msg).toContain("+91 9033304707")
    })

    it("should generate QR pending message with scan instructions", () => {
      const msg = buildTargetedAlertMessage({
        storeName: "Vinayak Fashion",
        issueType: "QR_SCAN_PENDING",
        appBaseUrl: "https://customerpilot.in"
      })

      expect(msg).toContain("Vinayak Fashion")
      expect(msg).toContain("adhura (pending)")
      expect(msg).toContain("phone se scan complete nahi hua")
    })

    it("should generate offline warning message with network troubleshooting steps", () => {
      const msg = buildTargetedAlertMessage({
        storeName: "Dosa Corner",
        issueType: "PHONE_OFFLINE_OR_TIMEOUT",
        appBaseUrl: "https://customerpilot.in"
      })

      expect(msg).toContain("Dosa Corner")
      expect(msg).toContain("Wi-Fi ya Mobile Data")
      expect(msg).toContain("Phone Offline")
    })

    it("should generate critical 403 restriction notice", () => {
      const msg = buildTargetedAlertMessage({
        storeName: "Style Trends",
        issueType: "ACCOUNT_RESTRICTED_403",
        appBaseUrl: "https://customerpilot.in"
      })

      expect(msg).toContain("Style Trends")
      expect(msg).toContain("Code 403 Forbidden")
      expect(msg).toContain("SuperAdmin helpline")
    })

    it("should ensure every issue template produces distinctly different text", () => {
      const issues: WhatsAppIssueType[] = [
        "SESSION_LOGGED_OUT_401",
        "QR_SCAN_PENDING",
        "PHONE_OFFLINE_OR_TIMEOUT",
        "ACCOUNT_RESTRICTED_403",
        "INSTANCE_NOT_CONFIGURED"
      ]

      const messages = issues.map(issue =>
        buildTargetedAlertMessage({ storeName: "Test Store", issueType: issue })
      )

      const uniqueMessages = new Set(messages)
      expect(uniqueMessages.size).toBe(issues.length)
    })
  })

  describe("Fleet Monitor Fleet Orchestration & Selective Targeting Guard", () => {
    it("should accurately isolate healthy stores from broken stores without cross-alerting", async () => {
      // Mock db.merchant.findMany returning 2 merchants: 1 healthy, 1 disconnected
      process.env.EVOLUTION_API_URL = "http://localhost:8080"
      process.env.EVOLUTION_API_KEY = "test_key"

      const mockMerchants = [
        {
          id: "m_healthy",
          name: "Healthy Bakery",
          whatsappPhone: "919000000001",
          whatsappInstanceName: "CP_healthy"
        },
        {
          id: "m_disconnected",
          name: "Broken Store",
          whatsappPhone: "919000000002",
          whatsappInstanceName: "CP_broken"
        }
      ]

      vi.spyOn(db.merchant, "findMany").mockResolvedValue(mockMerchants as any)
      vi.spyOn(db.incident, "updateMany").mockResolvedValue({ count: 1 } as any)
      vi.spyOn(db.incident, "findFirst").mockResolvedValue(null) // no cooldown

      // Mock global fetch returning Evolution API instance states
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/instance/fetchInstances")) {
          return {
            ok: true,
            json: async () => [
              {
                name: "CP_healthy",
                connectionStatus: "open",
                ownerJid: "919000000001@s.whatsapp.net"
              },
              {
                name: "CP_broken",
                connectionStatus: "close",
                disconnectionReasonCode: 401,
                disconnectionAt: "2026-10-26T12:00:00.000Z"
              }
            ]
          } as any
        }
        return { ok: true, json: async () => ({}) } as any
      })

      const report = await runFleetWhatsAppMonitor({ dryRun: true })

      expect(report.totalMerchants).toBe(2)
      expect(report.healthyCount).toBe(1)
      expect(report.issueCount).toBe(1)

      const healthyDiag = report.diagnoses.find(d => d.merchantId === "m_healthy")
      expect(healthyDiag?.status).toBe("HEALTHY")
      expect(healthyDiag?.alertAction).toBe("NONE_HEALTHY")
      expect(healthyDiag?.issueType).toBeNull()

      const brokenDiag = report.diagnoses.find(d => d.merchantId === "m_disconnected")
      expect(brokenDiag?.status).toBe("ISSUE_DETECTED")
      expect(brokenDiag?.issueType).toBe("SESSION_LOGGED_OUT_401")
      expect(brokenDiag?.messageBody).toContain("Broken Store")
      expect(brokenDiag?.messageBody).toContain("Meta Security Code 401")

      global.fetch = originalFetch
      vi.restoreAllMocks()
    })
  })
})
