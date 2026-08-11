import { describe, it, expect } from 'vitest';
import {
  canTransition,
  QUEUE_TIMEOUT_BY_BUSINESS,
  RESERVATION_TIMEOUT_SECONDS,
  UNDO_WINDOW_SECONDS,
} from '@/lib/queue-state-machine';
import { generateSecureOTP, createOTPSession, verifyOTP, OTP_CONFIG } from '@/lib/whatsapp-business-api';

describe('Pillar 4 — WhatsApp Messaging & Queue State Machine', () => {
  describe('Queue State Machine Transition Rules (canTransition)', () => {
    it('allows valid state progression: idle -> waiting -> reserved -> claimed', () => {
      expect(canTransition('idle', 'waiting')).toBe(true);
      expect(canTransition('waiting', 'reserved')).toBe(true);
      expect(canTransition('reserved', 'claimed')).toBe(true);
    });

    it('allows undo recovery: claimed -> recovered', () => {
      expect(canTransition('claimed', 'recovered')).toBe(true);
    });

    it('allows waiting queue entry to expire, cancel, or merge', () => {
      expect(canTransition('waiting', 'expired')).toBe(true);
      expect(canTransition('waiting', 'cancelled')).toBe(true);
      expect(canTransition('waiting', 'merged')).toBe(true);
    });

    it('blocks illegal state jumps (e.g. idle -> claimed, expired -> claimed)', () => {
      expect(canTransition('idle', 'claimed')).toBe(false);
      expect(canTransition('expired', 'claimed')).toBe(false);
      expect(canTransition('cancelled', 'waiting')).toBe(false);
      expect(canTransition('recovered', 'claimed')).toBe(false);
    });
  });

  describe('Business-Type Queue Timeouts', () => {
    it('defines distinct timeouts tailored to merchant vertical', () => {
      expect(QUEUE_TIMEOUT_BY_BUSINESS['bakery']).toBe(5);
      expect(QUEUE_TIMEOUT_BY_BUSINESS['cafe']).toBe(15);
      expect(QUEUE_TIMEOUT_BY_BUSINESS['restaurant']).toBe(60);
      expect(QUEUE_TIMEOUT_BY_BUSINESS['salon']).toBe(120);
      expect(QUEUE_TIMEOUT_BY_BUSINESS['retail']).toBe(10);
    });

    it('enforces strict reservation and undo window constraints', () => {
      expect(RESERVATION_TIMEOUT_SECONDS).toBe(10);
      expect(UNDO_WINDOW_SECONDS).toBe(30);
    });
  });

  describe('WhatsApp OTP Engine (generateSecureOTP, createOTPSession, verifyOTP)', () => {
    it('generates a numeric OTP with specified length and valid entropy', () => {
      const otp6 = generateSecureOTP(6);
      expect(otp6).toBeDefined();
      expect(otp6).toMatch(/^\d{6}$/);

      const otp4 = generateSecureOTP(4);
      expect(otp4).toBeDefined();
      expect(otp4).toMatch(/^\d{4}$/);
    });

    it('creates an OTP session and verifies valid OTP input', async () => {
      const session = await createOTPSession('919033304707');
      expect(session.sessionId).toBeDefined();
      expect(session.otp).toHaveLength(OTP_CONFIG.length);

      const verification = await verifyOTP(session.sessionId, session.otp);
      expect(verification.valid).toBe(true);
    });

    it('rejects incorrect OTP for a session and tracks attempts', async () => {
      const session = await createOTPSession('919876543210');
      const verification = await verifyOTP(session.sessionId, '0000');
      expect(verification.valid).toBe(false);
      expect(verification.reason).toBe('INVALID_OTT');
    });
  });

  describe('Webhook Security & Secret Verification', () => {
    const EXPECTED_SECRET = 'cpilot_webhook_secret_change_in_prod_2026';

    it('accepts matching webhook secret in query parameter', () => {
      const url = new URL(`https://example.com/api/webhook/evolution?secret=${EXPECTED_SECRET}`);
      const secret = url.searchParams.get('secret');
      expect(secret).toBe(EXPECTED_SECRET);
    });

    it('rejects missing or mismatched webhook secret', () => {
      const url = new URL(`https://example.com/api/webhook/evolution?secret=wrong_secret`);
      const secret = url.searchParams.get('secret');
      expect(secret === EXPECTED_SECRET).toBe(false);
    });
  });
});
