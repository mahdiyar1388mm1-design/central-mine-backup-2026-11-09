import { AdminService } from './admin.service';

describe('AdminService protocol overview', () => {
  it('summarizes live wallet balances, protocol positions, fees and settings', async () => {
    const service = new AdminService(
      { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } as any,
      { find: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), findOneByOrFail: jest.fn() } as any,
      { find: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), findOneByOrFail: jest.fn() } as any,
      { find: jest.fn() } as any,
      { count: jest.fn().mockResolvedValue(2) } as any,
      {
        find: jest.fn().mockResolvedValue([
          { id: 'treasury', isSystemTreasury: true, baseLth: '35.5', stakedLth: '0', withdrawableIrr: '120000' },
          { id: 'user-1', isSystemTreasury: false, baseLth: '10', stakedLth: '25', withdrawableIrr: '8000' },
          { id: 'user-2', isSystemTreasury: false, baseLth: '5', stakedLth: '15', withdrawableIrr: '2000' },
        ]),
      } as any,
      {
        count: jest.fn().mockResolvedValue(4),
        find: jest.fn().mockResolvedValue([
          { status: 'ACTIVE', amountLth: '12', accruedStakeLth: '3', unlockAt: new Date('2040-01-01') },
          { status: 'TRANSFERRED_TO_TREASURY', amountLth: '1', accruedStakeLth: '0', unlockAt: new Date('2025-01-01') },
        ]),
      } as any,
      {
        count: jest.fn().mockResolvedValue(7),
        find: jest.fn().mockResolvedValue([
          { type: 'DEPOSIT', amountLth: '10', amountIrr: '48400000000', feeLth: '0', feeIrr: '484000000', status: 'SUCCESS', createdAt: new Date() },
          { type: 'FEE_COLLECTION', amountLth: '1', amountIrr: '0', feeLth: '1', feeIrr: '0', status: 'SUCCESS', createdAt: new Date() },
        ]),
      } as any,
      { findOne: jest.fn().mockResolvedValue({ lthBaseRateIrr: '4840000000', dailyRewardRate: '0.0034', transactionFeePercent: '1.00', stakingLockupDays: 3285 }) } as any,
    );

    await expect(service.getOverview()).resolves.toMatchObject({
      users: 2,
      wallets: 3,
      positions: { total: 4, active: 1, activeAmountLth: '12.000000000000', accruedStakeLth: '3.000000000000' },
      treasury: { baseLth: '35.500000000000', withdrawableIrr: '120000' },
      protocol: { lthBaseRateIrr: '4840000000', stakingLockupDays: 3285 },
      transactions: { total: 7, successful: 2, feeLth: '1.000000000000', feeIrr: '484000000' },
    });
  });
});
