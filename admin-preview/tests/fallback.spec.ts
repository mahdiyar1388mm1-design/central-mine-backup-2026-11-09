import { expect, test } from '@playwright/test';
import { normalizeDB } from '../src/data';

test('normalizeDB keeps empty live arrays instead of reverting to seed data', () => {
  const db = normalizeDB({
    version: 2,
    treasury: {
      asset: 0,
      marketPrice: 0,
      buybackInfo: { bank: '', holder: '', shaba: '' },
      stakeReturns: [],
      baseReturns: [],
      fees: [],
      buybacks: [],
    },
    products: [],
    sales: [],
    journal: [],
    chats: [],
    meta: { users: 0, wallets: 0, generatedAt: '2026-11-09T00:00:00.000Z' },
  });

  expect(db.products).toEqual([]);
  expect(db.sales).toEqual([]);
  expect(db.journal).toEqual([]);
  expect(db.meta?.users).toBe(0);
});
