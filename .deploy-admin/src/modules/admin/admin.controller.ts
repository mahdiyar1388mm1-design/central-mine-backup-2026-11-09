import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateAdminStateDto } from './dto/update-admin-state.dto';
import { AdminService } from './admin.service';
import { CreateAdminRecordDto, UpdateAdminRecordDto } from './dto/admin-record.dto';
import { CreateAdminSaleDto, UpdateAdminSaleDto } from './dto/admin-sale.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
