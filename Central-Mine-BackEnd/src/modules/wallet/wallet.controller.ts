import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { WalletService } from './wallet.service';
import { BuyPackageDto } from './dto/buy-package.dto';
import { TransferDto } from './dto/transfer.dto';
import { SellPositionDto } from './dto/sell-position.dto';
import { WithdrawIrrDto } from './dto/withdraw-irr.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * استخراج شناسه یکتای کاربر از توکن JWT
   */
  private getUserId(req: any): string {
    const user = req.headers['user'];
    if (user?.id) {
      return user.id;
    }
    // در صورت ارسال هدر تست برای سناریوهای آزمایشی دستی
    if (req.headers['x-user-id']) {
      return req.headers['x-user-id'];
    }
    throw new UnauthorizedException('شناسه کاربر احراز هویت‌شده یافت نشد.');
  }

  @Get('card-summary')
  async getCardSummary(@Req() req: any) {
    return this.walletService.getCardSummary(this.getUserId(req));
  }

  @Get('positions')
  async getPositions(@Req() req: any) {
    return this.walletService.getUserPositions(this.getUserId(req));
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.walletService.getUserTransactions(this.getUserId(req));
  }

  @Post('buy-package')
  async buyPackage(@Req() req: any, @Body() dto: BuyPackageDto) {
    return this.walletService.buyPackage(this.getUserId(req), dto);
  }

  @Post('transfer-p2p')
  async transferP2P(@Req() req: any, @Body() dto: TransferDto) {
    return this.walletService.transferP2P(this.getUserId(req), dto);
  }

  @Get('inquiry-card/:cardNumber')
  async inquiryCard(@Param('cardNumber') cardNumber: string) {
    const targetWallet = await this.walletService.findByCardNumber(cardNumber);
    return {
      isValid: true,
      targetCardNumber: targetWallet.cardNumber.replace(/(\d{4})/g, '$1 ').trim(),
      walletId: targetWallet.id,
    };
  }

  @Post('sell-position')
  async sellPosition(@Req() req: any, @Body() dto: SellPositionDto) {
    return this.walletService.sellPosition(this.getUserId(req), dto);
  }

  @Post('withdraw')
  async requestWithdrawal(@Req() req: any, @Body() dto: WithdrawIrrDto) {
    return this.walletService.requestWithdrawal(this.getUserId(req), dto);
  }

  @UseGuards(AdminGuard)
  @Post('trigger-daily-yield')
  async triggerDailyYield() {
    return this.walletService.distributeDailyYield();
  }

  @UseGuards(AdminGuard)
  @Get('admin/withdrawals')
  async getPendingWithdrawals() {
    return this.walletService.getPendingWithdrawals();
  }

  @UseGuards(AdminGuard)
  @Get('admin/withdrawals/export-paya')
  async exportPaya() {
    return this.walletService.exportPayaBatchFile();
  }

  @UseGuards(AdminGuard)
  @Post('admin/withdrawals/:id/approve')
  async approveWithdrawal(
    @Param('id') id: string,
    @Body('trackingCode') trackingCode?: string,
  ) {
    return this.walletService.approveWithdrawal(id, trackingCode);
  }

  @UseGuards(AdminGuard)
  @Post('admin/withdrawals/:id/reject')
  async rejectWithdrawal(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.walletService.rejectWithdrawal(id, reason);
  }
}