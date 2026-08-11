import { describe, it, expect } from 'vitest';
import { stampsForAmount, computeChurnRisk } from '@/lib/stamp-engine';
import { checkBillForFraud } from '@/lib/fraud-detection';
import { getVipTierForSpend, applyVipBonusStamps, DEFAULT_VIP_TIERS } from '@/lib/vip-engine';

describe('Pillar 1 — Loyalty Stamp Engine & Fraud Detection', () => {
  describe('Stamp Math (stampsForAmount)', () => {
    it('awards flat 1 stamp when rule is "1" or empty', () => {
      expect(stampsForAmount('1', 500)).toBe(1);
      expect(stampsForAmount('', 1000)).toBe(1);
      expect(stampsForAmount('invalid_rule', 200)).toBe(1);
    });

    it('calculates tiered stamps based on spend threshold', () => {
      expect(stampsForAmount('1 per $100', 50)).toBe(0);
      expect(stampsForAmount('1 per $100', 100)).toBe(1);
      expect(stampsForAmount('1 per $100', 250)).toBe(2);
      expect(stampsForAmount('1 per $100', 499)).toBe(4);
    });

    it('strictly caps maximum stamps per bill at 5', () => {
      expect(stampsForAmount('1 per $50', 500)).toBe(5);
      expect(stampsForAmount('1 per $10', 1000)).toBe(5);
    });

    it('handles decimal and boundary cases safely', () => {
      expect(stampsForAmount('1 per $0', 500)).toBe(1);
      expect(stampsForAmount('1 per $-10', 500)).toBe(1);
    });
  });

  describe('Churn Risk Computation (computeChurnRisk)', () => {
    const now = new Date('2026-08-09T12:00:00Z');

    it('returns high risk (80) if customer has never been active', () => {
      expect(computeChurnRisk({ lastActiveAt: null, lifetimeStamps: 0, lifetimeSpend: 0, now })).toBe(80);
    });

    it('computes graduated risk based on inactivity days', () => {
      // 5 days inactive -> 0 base
      const active5Days = new Date('2026-08-04T12:00:00Z');
      expect(computeChurnRisk({ lastActiveAt: active5Days, lifetimeStamps: 5, lifetimeSpend: 500, now })).toBe(0);

      // 20 days inactive -> +10
      const active20Days = new Date('2026-07-20T12:00:00Z');
      expect(computeChurnRisk({ lastActiveAt: active20Days, lifetimeStamps: 5, lifetimeSpend: 500, now })).toBe(10);

      // 45 days inactive -> +20
      const active45Days = new Date('2026-06-25T12:00:00Z');
      expect(computeChurnRisk({ lastActiveAt: active45Days, lifetimeStamps: 5, lifetimeSpend: 500, now })).toBe(20);

      // 70 days inactive -> +40
      const active70Days = new Date('2026-05-31T12:00:00Z');
      expect(computeChurnRisk({ lastActiveAt: active70Days, lifetimeStamps: 5, lifetimeSpend: 500, now })).toBe(40);

      // 100 days inactive -> +60
      const active100Days = new Date('2026-05-01T12:00:00Z');
      expect(computeChurnRisk({ lastActiveAt: active100Days, lifetimeStamps: 5, lifetimeSpend: 500, now })).toBe(60);
    });

    it('applies engagement dampeners for loyal customers', () => {
      const active100Days = new Date('2026-05-01T12:00:00Z');
      // High stamps (>50 -> -30) + High spend (>5000 -> -20) => 60 - 50 = 10
      expect(computeChurnRisk({ lastActiveAt: active100Days, lifetimeStamps: 60, lifetimeSpend: 6000, now })).toBe(10);
    });
  });

  describe('Anti-Fraud Detection Rules (checkBillForFraud)', () => {
    const baseInput = {
      merchantId: 'm1',
      billId: 'b1',
      customerId: 'c1',
      cashierId: 'cashier_1',
      cashierPhone: '919876543210',
      customerPhone: '919033304707',
      amount: 150,
      customerLifetimeStamps: 5,
      customerStampsBeforeBill: 2,
      billsBySameCustomerIn24h: 1,
      rapidRepeatsInLast1h: 0,
      recentBillsBySameCustomer: [],
      now: new Date('2026-08-09T14:00:00Z'),
    };

    it('flags low-value bill with INFO severity', () => {
      const alerts = checkBillForFraud({ ...baseInput, amount: 5 });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].ruleId).toBe('low_value_bill');
      expect(alerts[0].severity).toBe('info');
    });

    it('flags rapid repeat bills by the same customer with HIGH severity', () => {
      const recentBills = [
        { amount: 150, createdAt: new Date('2026-08-09T13:58:00Z') } // 2 minutes ago
      ];
      const alerts = checkBillForFraud({ ...baseInput, recentBillsBySameCustomer: recentBills });
      expect(alerts.some(a => a.ruleId === 'rapid_repeat' && a.severity === 'high')).toBe(true);
    });

    it('flags cashier self-dealing if cashier and customer phone match', () => {
      const alerts = checkBillForFraud({
        ...baseInput,
        customerPhone: '919876543210', // matches cashierPhone
      });
      expect(alerts.some(a => a.ruleId === 'cashier_self_deal' && a.severity === 'high')).toBe(true);
    });
  });

  describe('VIP Engine (getVipTierForSpend & applyVipBonusStamps)', () => {
    it('evaluates none, silver, gold, platinum tiers based on lifetime spend thresholds', () => {
      expect(getVipTierForSpend(0).name).toBe('none');
      expect(getVipTierForSpend(2000).name).toBe('silver');
      expect(getVipTierForSpend(5000).name).toBe('gold');
      expect(getVipTierForSpend(10000).name).toBe('platinum');
    });

    it('calculates stamp multiplier bonuses correctly for tiers', () => {
      const regular = getVipTierForSpend(0);
      const gold = getVipTierForSpend(5000);
      const platinum = getVipTierForSpend(10000);

      expect(applyVipBonusStamps(2, regular)).toBe(2);
      expect(applyVipBonusStamps(5, gold)).toBe(6); // 5 * 1.2 = 6
      expect(applyVipBonusStamps(4, platinum)).toBe(6); // 4 * 1.5 = 6
    });
  });
});
