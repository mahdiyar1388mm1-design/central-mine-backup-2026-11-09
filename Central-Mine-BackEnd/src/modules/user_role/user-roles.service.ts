import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRoleDto } from './dto/user-role.dto';
import { CheckPermissionDto } from './dto/checkPermission.dto';
import { CheckPermissionRo } from './dto/checkPermission.ro';

/** سرویس تخصیص نقش و بررسی دسترسی در معماری مونولیت */
@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async assignRole(userRoleDto: UserRoleDto): Promise<void> {
    const { username, roleIds } = userRoleDto;

    const roles = await this.rolesRepository.find({
      where: { id: In(roleIds) },
    });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const user = await this.usersRepository.findOne({
      where: { phoneNumber: username },
    });
    if (!user) throw new NotFoundException(`User ${username} not found`);

    user.roles = roles;
    await this.usersRepository.save(user);
  }

  async checkPermission(
    checkPermissionDto: CheckPermissionDto,
  ): Promise<CheckPermissionRo> {
    const { username, permissions } = checkPermissionDto;

    const user = await this.usersRepository.findOne({
      where: { phoneNumber: username },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User ${username} not found`);

    const userPermissions: string[] = (user.roles ?? []).flatMap(
      (role) => role.permissions ?? [],
    );

    const hasAll = permissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException("You don't have access");
    }

    return { isAccess: true };
  }
}
