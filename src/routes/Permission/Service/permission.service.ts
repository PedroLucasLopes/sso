import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from 'generated/prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CreatePermission } from '../dto/createPermission.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async createPermission(data: CreatePermission): Promise<Permission> {
    const { roleId, routeId } = data;

    const [role, route] = await Promise.all([
      this.prisma.role.findUnique({ where: { id: roleId } }),
      this.prisma.route.findUnique({ where: { id: routeId } }),
    ]);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (role.projectId !== route.projectId) {
      throw new BadRequestException(
        'You cannot associate roles from different projects',
      );
    }

    const createPermission = await this.prisma.permission.create({
      data: { roleId, routeId },
    });

    return createPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const findPermission = await this.prisma.permission.delete({
      where: { id },
    });

    if (!findPermission) {
      throw new NotFoundException('Permission not found');
    }
  }
}
