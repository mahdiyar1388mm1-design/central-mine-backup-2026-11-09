import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/modules/user_role/entities/role.entity';
import { PermissionTag } from 'src/modules/user_role/types/permission-tag.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFindDto } from './dto/user-find.dto';
import { UserRo } from './dto/user.ro';
import { UsersRo } from './dto/users.ro';
import { IDDto } from 'src/commons/dto/uuid.dto';
import { PhoneNumberDto } from 'src/commons/dto/phone-number.dto';

/** نقشی که هر کاربر تازه‌ثبت‌نامِ اپلیکیشن مشتریان (بدون role دستی) به‌صورت خودکار می‌گیرد؛
 * فقط اجازهٔ مرور فایل‌ها و ثبت ملک را می‌دهد. ادمین می‌تواند بعداً نقش را تغییر دهد. */
const DEFAULT_CUSTOMER_ROLE_NAME = 'مشتری (پیش‌فرض)';
const DEFAULT_CUSTOMER_ROLE_PERMISSIONS = [
  PermissionTag.FIND_PROPERTY,
  PermissionTag.FIND_PROPERTY_ATTRIBUTE,
  PermissionTag.FIND_PROPERTY_DESCRIPTION,
  PermissionTag.FIND_PROPERTY_IMAGE,
  PermissionTag.FIND_PROPERTY_VIDEO,
  PermissionTag.CREATE_PROPERTY,
  PermissionTag.CREATE_FAVORITE,
  PermissionTag.FIND_FAVORITE,
  PermissionTag.DELETE_FAVORITE,
  PermissionTag.CREATE_PROPERTY_REQUEST,
  PermissionTag.FIND_PROPERTY_REQUEST,
  PermissionTag.UPDATE_PROPERTY_REQUEST,
  PermissionTag.DELETE_PROPERTY_REQUEST,
  PermissionTag.CREATE_PROPERTY_VISIT,
  PermissionTag.FIND_PROPERTY_VISIT,
  PermissionTag.UPDATE_PROPERTY_VISIT,
  PermissionTag.FIND_NOTIFICATION,
  PermissionTag.UPDATE_NOTIFICATION,
  PermissionTag.CREATE_MESSAGE_THREAD,
  PermissionTag.FIND_MESSAGE_THREAD,
  PermissionTag.CREATE_MESSAGE,
  PermissionTag.FIND_MESSAGE,
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserRo> {
    const exists = await this.repo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (exists)
      throw new ConflictException('User with this phone already exists');
    const user = this.repo.create(dto);
    // ثبت‌نام خودکار از اپلیکیشن (OTP) هیچ role دستی نمی‌فرستد؛ ثبت دستی توسط
    // ادمین (مثلاً کارمند جدید) role را صریح مشخص می‌کند و از این پیش‌فرض معاف است.
    if (!dto.role) {
      user.roles = [await this.getOrCreateDefaultCustomerRole()];
    }
    const saved = await this.repo.save(user);
    return this.toRo(saved);
  }

  /** Finds (or creates) the default customer role, keeping its permission
   * list in sync with `DEFAULT_CUSTOMER_ROLE_PERMISSIONS` so a code change
   * here reaches every existing default-role holder too. */
  private async getOrCreateDefaultCustomerRole(): Promise<Role> {
    const existing = await this.rolesRepo.findOne({
      where: { name: DEFAULT_CUSTOMER_ROLE_NAME },
    });
    if (existing) {
      const upToDate =
        existing.permissions.length === DEFAULT_CUSTOMER_ROLE_PERMISSIONS.length &&
        DEFAULT_CUSTOMER_ROLE_PERMISSIONS.every((p) =>
          existing.permissions.includes(p),
        );
      if (upToDate) return existing;
      existing.permissions = DEFAULT_CUSTOMER_ROLE_PERMISSIONS;
      return this.rolesRepo.save(existing);
    }
    const role = this.rolesRepo.create({
      name: DEFAULT_CUSTOMER_ROLE_NAME,
      permissions: DEFAULT_CUSTOMER_ROLE_PERMISSIONS,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserRo> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.toRo(saved);
  }

  async find(dto: UserFindDto): Promise<UsersRo> {
    const qb = this.repo.createQueryBuilder('u');
    if (dto.phoneNumber)
      qb.andWhere('u.phoneNumber = :phoneNumber', {
        phoneNumber: dto.phoneNumber,
      });
    if (dto.name) qb.andWhere('u.name ILIKE :name', { name: `%${dto.name}%` });
    if (dto.role) qb.andWhere('u.role = :role', { role: dto.role });
    qb.orderBy('u.createdAt', 'DESC');
    const users = await qb.getMany();
    return { users: users.map((u) => this.toRo(u)), count: users.length };
  }

  async getById(dto: IDDto): Promise<UserRo> {
    const user = await this.repo.findOne({ where: { id: dto.id } });
    if (!user) throw new NotFoundException(`User ${dto.id} not found`);
    return this.toRo(user);
  }

  async getByPhoneNumber(dto: PhoneNumberDto): Promise<UserRo> {
    const user = await this.repo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!user)
      throw new NotFoundException(`User ${dto.phoneNumber} not found`);
    return this.toRo(user);
  }

  async suspend(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isActive = false;
    await this.repo.save(user);
  }

  async activate(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isActive = true;
    await this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    await this.repo.remove(user);
  }

  private toRo(user: User): UserRo {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
