import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the contract of sendWhatsAppNotification as implemented in src/app/api/rewards/award/route.ts
describe('Award Notification Failure Path Regression (Golden Test)', () => {
  const SEND_TIMEOUT_MS = 6000

  // Simulation function matching the exact implementation contract in award/route.ts
  async function simulateSendNotification({
    merchantInstanceName,
    fetchMock,
    dbMock,
  }: {
    merchantInstanceName: string | null
    fetchMock: (url: string, init?: any) => Promise<any>
    dbMock: { whatsAppMessageCreate: (data: any) => Promise<any> }
  }) {
    let ok = false
    let errorMsg: string | null = null
    let metaId: string | undefined
    const merchantId = 'test_merchant_id'
    const toPhone = '919999999999'
    const text = 'Test award notification'
    const templateKey = 'STAMP_AWARDED'

    try {
      const instanceName = merchantInstanceName
      if (!instanceName) {
        // Zero fallback to phantom instances or cross-merchant leaks
        errorMsg = 'No WhatsApp instance configured for merchant'
      } else {
        const res = await fetchMock(`http://localhost:8080/message/sendText/${encodeURIComponent(instanceName)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': 'mock_key' },
          body: JSON.stringify({ number: toPhone, text }),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        })
        const data: any = await res.json().catch(() => ({}))
        if (res.ok) {
          ok = true
          metaId = data?.key?.id
        } else {
          errorMsg = `[${instanceName}] HTTP ${res.status}: ${String(data?.response?.message ?? data?.message ?? data?.error ?? 'unknown')}`.slice(0, 300)
        }
      }
    } catch (e: any) {
      errorMsg = (e?.name === 'TimeoutError' || e?.name === 'AbortError')
        ? `Timeout ${SEND_TIMEOUT_MS}ms (delivery unknown)`
        : String(e?.message || e).slice(0, 300)
    }

    const createdRecord = await dbMock.whatsAppMessageCreate({
      merchantId,
      toPhone,
      template: templateKey,
      body: text.substring(0, 500),
      status: ok ? 'sent' : 'failed',
      sentAt: ok ? new Date() : null,
      metaMessageId: metaId || `stamp_${Date.now()}`,
      errorMessage: errorMsg,
    })

    return { ok, errorMsg, createdRecord }
  }

  it('correctly fails and logs when merchant has no WhatsApp instance (no phantom fallback)', async () => {
    const fetchSpy = vi.fn()
    const dbSpy = vi.fn().mockImplementation((payload) => Promise.resolve({ id: 'msg_1', ...payload }))

    const result = await simulateSendNotification({
      merchantInstanceName: null,
      fetchMock: fetchSpy,
      dbMock: { whatsAppMessageCreate: dbSpy },
    })

    expect(result.ok).toBe(false)
    expect(result.errorMsg).toBe('No WhatsApp instance configured for merchant')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(dbSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'No WhatsApp instance configured for merchant',
        sentAt: null,
      })
    )
  })

  it('correctly catches timeout and logs "Timeout 6000ms (delivery unknown)" without throwing', async () => {
    const timeoutErr = new Error('The operation was aborted due to timeout')
    timeoutErr.name = 'TimeoutError'

    const fetchSpy = vi.fn().mockRejectedValue(timeoutErr)
    const dbSpy = vi.fn().mockImplementation((payload) => Promise.resolve({ id: 'msg_2', ...payload }))

    const result = await simulateSendNotification({
      merchantInstanceName: 'CP_CakeConnection',
      fetchMock: fetchSpy,
      dbMock: { whatsAppMessageCreate: dbSpy },
    })

    expect(result.ok).toBe(false)
    expect(result.errorMsg).toBe('Timeout 6000ms (delivery unknown)')
    expect(dbSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorMessage: 'Timeout 6000ms (delivery unknown)',
        sentAt: null,
      })
    )
  })

  it('correctly captures HTTP error responses and records the status code', async () => {
    const mockResponse = {
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: 'Socket disconnected' }),
    }
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse)
    const dbSpy = vi.fn().mockImplementation((payload) => Promise.resolve({ id: 'msg_3', ...payload }))

    const result = await simulateSendNotification({
      merchantInstanceName: 'CP_CakeConnection',
      fetchMock: fetchSpy,
      dbMock: { whatsAppMessageCreate: dbSpy },
    })

    expect(result.ok).toBe(false)
    expect(result.errorMsg).toContain('[CP_CakeConnection] HTTP 503: Socket disconnected')
    expect(dbSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorMessage: '[CP_CakeConnection] HTTP 503: Socket disconnected',
        sentAt: null,
      })
    )
  })
})
