import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { ErrorsInterceptor } from 'src/interceptors/errors.interceptor';
import { UserActivityInterceptor } from 'src/interceptors/user-activity.interceptor';
import { UserRoleDto } from './dto/user-role.dto';
import { RolesService } from './roles.service';
import { UserRolesService } from './user-roles.service';
import { PermissionTag, PermissionTags } from './types/permission-tag.enum';
import { Permissions } from 'src/decorator/permission.decorator';
import { RoleDto } from './dto/role.dto';
import { RoleRo } from './dto/role.ro';
import { RolesRo } from './dto/roles.ro';
import { UpdateRoleDto } from './dto/role-update.dto';
import { PermissionViewRo } from './dto/permission-view.ro';
import { IDDto } from 'src/commons/dto/uuid.dto';

/** مسیریاب و کنترل کننده‌ی http بخش نقش‌ها و دسترسی‌ها */
@ApiTags('UserRole')
@Controller('userRole')
@UseInterceptors(ErrorsInterceptor, UserActivityInterceptor)
@UseGuards(AuthGuard, PermissionsGuard)
export class UserRoleController {
  constructor(
    private readonly userRolesService: UserRolesService,
    private readonly rolesService: RolesService,
  ) {}

  @Get('permissions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'دریافت لیست تمام دسترسی‌های قابل تعریف',
    description: 'لیست کامل تگ‌های دسترسی سیستم به همراه دسته‌بندی و عنوان.',
  })
  @ApiOkResponse({
    description: 'Get all permissions',
    type: [PermissionViewRo],
  })
  async readPermissions(): Promise<PermissionViewRo[]> {
    return PermissionTags;
  }

  @Post('assignRole/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.CREATE_USER_ROLE)
  @ApiOperation({ summary: 'تخصیص نقش به کاربر' })
  @ApiOkResponse({
    description: 'Assigns a specified role to a user based',
  })
  async assignRole(@Body() userRoleDto: UserRoleDto): Promise<void> {
    await this.userRolesService.assignRole(userRoleDto);
  }

  @Post('role/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.CREATE_ROLE)
  @ApiOperation({ summary: 'ایجاد نقش جدید' })
  @ApiOkResponse({
    description: 'Creates a new role with the specified details',
    type: RoleRo,
  })
  async create(@Body() roleDto: RoleDto): Promise<RoleRo> {
    return this.rolesService.create(roleDto);
  }

  @Put('role/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.UPDATE_ROLE)
  @ApiOperation({ summary: 'ویرایش نقش' })
  @ApiOkResponse({
    description: 'Successfully updates the specified role.',
  })
  async update(@Body() updateRoleDto: UpdateRoleDto): Promise<void> {
    await this.rolesService.update(updateRoleDto);
  }

  @Get('role/by-id/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.READ_ROLE)
  @ApiOperation({ summary: 'دریافت یک نقش بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه نقش' })
  @ApiOkResponse({
    description:
      'Retrieves the detailed information of a role based on the provided ID.',
    type: RoleRo,
  })
  async getById(@Param() idDto: IDDto): Promise<RoleRo> {
    return this.rolesService.getById(idDto);
  }

  @Get('role/find/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.FIND_ROLE)
  @ApiOperation({ summary: 'دریافت لیست تمام نقش‌ها' })
  @ApiOkResponse({
    description: 'Indicates successful retrieval of roles.',
    type: RolesRo,
  })
  async find(): Promise<RolesRo> {
    return this.rolesService.find();
  }

  @Delete('role/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Permissions(PermissionTag.DELETE_ROLE)
  @ApiOperation({ summary: 'حذف نقش' })
  @ApiOkResponse({
    description: 'Indicates successful deletion of a role.',
  })
  async delete(@Query() idDto: IDDto): Promise<void> {
    await this.rolesService.delete(idDto);
  }
}
