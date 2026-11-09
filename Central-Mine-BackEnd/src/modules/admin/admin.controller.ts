import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateAdminStateDto } from './dto/update-admin-state.dto';
import { AdminService } from './admin.service';
import { CreateAdminRecordDto, UpdateAdminRecordDto } from './dto/admin-record.dto';
import { CreateAdminSaleDto, UpdateAdminSaleDto } from './dto/admin-sale.dto';
import { PositionStatus } from '../wallet/entities/erc1156-position.entity';
import { WalletService } from '../wallet/wallet.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly walletService: WalletService,
  ) {}

  @Get('state')
  getState() {
    return this.adminService.getState();
  }

  @Put('state')
  replaceState(@Body() dto: UpdateAdminStateDto) {
    return this.adminService.replaceState(dto.state);
  }

  @Get('records')
  listRecords(@Query('type') type?: string) { return this.adminService.listRecords(type); }

  @Post('records')
  createRecord(@Body() dto: CreateAdminRecordDto, @Req() req: any) {
    return this.adminService.createRecord(dto.type, dto.data, req.headers.user?.id);
  }

  @Patch('records/:id')
  updateRecord(@Param('id') id: string, @Body() dto: UpdateAdminRecordDto) {
    return this.adminService.updateRecord(id, dto.data || {});
  }

  @Delete('records/:id')
  deleteRecord(@Param('id') id: string) { return this.adminService.deleteRecord(id); }

  @Get('sales')
  listSales() { return this.adminService.listSales(); }

  @Post('sales')
  createSale(@Body() dto: CreateAdminSaleDto) { return this.adminService.createSale(dto); }

  @Patch('sales/:id')
  updateSale(@Param('id') id: string, @Body() dto: UpdateAdminSaleDto) { return this.adminService.updateSale(id, dto); }

  @Delete('sales/:id')
  deleteSale(@Param('id') id: string) { return this.adminService.deleteSale(id); }

  @Get('products/report')
  productReport() { return this.adminService.productReport(); }

  @Get('overview')
  overview() { return this.adminService.getOverview(); }

  @Get('protocol')
  protocol() { return this.adminService.getProtocol(); }

  @Get('treasury/report')
  treasuryReport() { return this.adminService.getTreasuryReport(); }

  @Get('protocol/transactions')
  protocolTransactions(@Query('limit') limit?: string) { return this.adminService.listProtocolTransactions(Number(limit)); }

  @Get('protocol/positions')
  protocolPositions(@Query('status') status?: PositionStatus) { return this.adminService.listProtocolPositions(status); }

  /** Corporate-banking handoff: only the transactional wallet service can change payout state. */
  @Get('payments/withdrawals')
  withdrawals() { return this.walletService.getPendingWithdrawals(); }

  @Get('payments/withdrawals/export-paya')
  exportPaya() { return this.walletService.exportPayaBatchFile(); }

  @Post('payments/withdrawals/:id/approve')
  approveWithdrawal(@Param('id') id: string, @Body('trackingCode') trackingCode?: string) {
    return this.walletService.approveWithdrawal(id, trackingCode);
  }

  @Post('payments/withdrawals/:id/reject')
  rejectWithdrawal(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.walletService.rejectWithdrawal(id, reason);
  }
}

