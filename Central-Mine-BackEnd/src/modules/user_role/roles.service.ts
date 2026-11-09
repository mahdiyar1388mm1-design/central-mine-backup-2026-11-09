import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Role } from './entities/role.entity';
import { RoleDto } from './dto/role.dto';
import { RoleRo } from './dto/role.ro';
import { RolesRo } from './dto/roles.ro';
import { UpdateRoleDto } from './dto/role-update.dto';
import { IDDto } from 'src/commons/dto/uuid.dto';

/** سرویس مدیریت نقش‌ها در معماری مونولیت */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(roleDto: RoleDto): Promise<RoleRo> {
    const role = this.rolesRepository.create(roleDto);
    const saved = await this.rolesRepository.save(role);
    return this.toRo(saved);
  }

  async update(updateRoleDto: UpdateRoleDto): Promise<void> {
    const { id } = updateRoleDto;
    const result = await this.rolesRepository.update({ id }, updateRoleDto);
    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }

  async getById(idDto: IDDto): Promise<RoleRo> {
    const role = await this.rolesRepository.findOne({
      where: { id: idDto.id },
    });
    if (!role) throw new NotFoundException('Role not found');
    return this.toRo(role);
  }

  async find(): Promise<RolesRo> {
    const roles = await this.rolesRepository.find();
    return { rolesRo: roles.map((r) => this.toRo(r)) };
  }

  async delete(idDto: IDDto): Promise<void> {
    const result = await this.rolesRepository.delete({ id: idDto.id });
    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }

  private toRo(role: Role): RoleRo {
    return plainToInstance(
      RoleRo,
      {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
      },
      { excludeExtraneousValues: true },
    );
  }
}
