import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { PaginationConfig } from 'src/global/pagination/pagination';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { EditRole } from '../dto/editRole.dto';
import { CreateRole } from '../dto/createRole.dto';
import { FilterRole } from '../dto/filterRole.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterRole): Promise<Role[]> {
    const { page, limit } = PaginationConfig(filter);
    const roles = await this.prisma.role.findMany({
      where: {
        ...(filter?.name && {
          name: filter.name,
        }),
      },
      ...(filter?.order && {
        orderBy: { name: filter.order },
      }),
      include: {
        permissions: {
          select: {
            route: true,
          },
        },
      },
      skip: page,
      take: limit,
    });

    if (!roles.length) {
      throw new NotFoundException('No roles found');
    }

    return roles;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            route: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async createRole(data: CreateRole): Promise<Role> {
    const findProject = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!findProject) {
      throw new NotFoundException('Project Not Found');
    }

    const createRole = this.prisma.role.create({ data });

    return createRole;
  }

  async updateRole(id: string, data: EditRole): Promise<Role> {
    const findRole = await this.prisma.role.findUnique({ where: { id } });

    if (!findRole) {
      throw new NotFoundException('Role not Found');
    }

    const updateRole = await this.prisma.role.update({ where: { id }, data });

    return updateRole;
  }

  async deleteRole(id: string): Promise<void> {
    const findRole = await this.prisma.role.findUnique({ where: { id } });

    if (!findRole) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({ where: { id } });
  }
}
