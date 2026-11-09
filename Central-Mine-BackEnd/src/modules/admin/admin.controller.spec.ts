import { AdminController } from './admin.controller';

describe('AdminController payment operations', () => {
  it('delegates an approval to the transactional wallet workflow', async () => {
    const walletService = { approveWithdrawal: jest.fn().mockResolvedValue({ id: 'withdrawal-1', status: 'SUCCESS' }) };
    const controller = new AdminController({} as any, walletService as any);

    await expect(controller.approveWithdrawal('withdrawal-1', 'BANK-7788')).resolves.toEqual({ id: 'withdrawal-1', status: 'SUCCESS' });
    expect(walletService.approveWithdrawal).toHaveBeenCalledWith('withdrawal-1', 'BANK-7788');
  });
});
