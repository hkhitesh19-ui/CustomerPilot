import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoist environment variables so they are set before route module evaluation
vi.hoisted(() => {
  process.env.EVOLUTION_API_URL = 'http://localhost:8080'
  process.env.EVOLUTION_API_KEY = 'mock_api_key'
})

// Mock the DB module before importing the route
vi.mock('@/lib/db', () => ({
  db: {
    merchant: {
      findUnique: vi.fn(),
    },
    whatsAppMessage: {
      create: vi.fn().mockImplementation((payload) => Promise.resolve({ id: 'msg_test', ...payload })),
    },
  },
}))

// Import the REAL production function directly from the route
import { sendWhatsAppNotification } from '@/app/api/rewards/award/route'
import { db } from '@/lib/db'

describe('Award Notification Failure Path Regression (True Direct Import Golden Test)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.EVOLUTION_API_URL = 'http://localhost:8080'
    process.env.EVOLUTION_API_KEY = 'mock_api_key'
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('directly imports sendWhatsAppNotification and proves unconfigured merchant logs failure without calling fetch', async () => {
    // Merchant exists but has no whatsappInstanceName
    vi.mocked(db.merchant.findUnique).mockResolvedValueOnce({
      id: 'merchant_no_wa',
      name: 'Unconfigured Store',
      whatsappInstanceName: null,
    } as any)

    const fetchSpy = vi.fn()
    global.fetch = fetchSpy

    await sendWhatsAppNotification('merchant_no_wa', '919999999999', 'Congratulations!', 'STAMP_AWARDED')

    // Must never attempt fetch (zero fallback to CustomerPilot_Main)
    expect(fetchSpy).not.toHaveBeenCalled()

    // Must write failed row with exact error
    expect(db.whatsAppMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        merchantId: 'merchant_no_wa',
        toPhone: '919999999999',
        status: 'failed',
        errorMessage: 'No WhatsApp instance configured for merchant',
        sentAt: null,
      }),
    })
  })

  it('directly imports sendWhatsAppNotification and proves timeout logs "Timeout 6000ms (delivery unknown)"', async () => {
    vi.mocked(db.merchant.findUnique).mockResolvedValueOnce({
      id: 'merchant_cake',
      name: 'Cake Connection',
      whatsappInstanceName: 'CP_CakeConnection',
    } as any)

    // Simulate AbortSignal.timeout / network hang
    const timeoutErr = new Error('The operation was aborted due to timeout')
    timeoutErr.name = 'TimeoutError'
    global.fetch = vi.fn().mockRejectedValueOnce(timeoutErr)

    await sendWhatsAppNotification('merchant_cake', '919999999999', 'Congratulations!', 'STAMP_AWARDED')

    // Must write failed row with exact timeout message
    expect(db.whatsAppMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        merchantId: 'merchant_cake',
        toPhone: '919999999999',
        status: 'failed',
        errorMessage: 'Timeout 6000ms (delivery unknown)',
        sentAt: null,
      }),
    })
  })

  it('directly imports sendWhatsAppNotification and captures HTTP 503 instance disconnects', async () => {
    vi.mocked(db.merchant.findUnique).mockResolvedValueOnce({
      id: 'merchant_cake',
      name: 'Cake Connection',
      whatsappInstanceName: 'CP_CakeConnection',
    } as any)

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: 'Instance offline' }),
    } as any)

    await sendWhatsAppNotification('merchant_cake', '919999999999', 'Congratulations!', 'STAMP_AWARDED')

    expect(db.whatsAppMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        merchantId: 'merchant_cake',
        toPhone: '919999999999',
        status: 'failed',
        errorMessage: expect.stringContaining('[CP_CakeConnection] HTTP 503: Instance offline'),
        sentAt: null,
      }),
    })
  })
})
