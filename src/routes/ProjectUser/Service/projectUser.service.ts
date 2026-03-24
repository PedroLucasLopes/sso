import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CreateProjectUser } from '../dto/createProjectUser.dto';
import { ProjectUser } from 'generated/prisma/client';

@Injectable()
export class ProjectUserService {
  constructor(private prisma: PrismaService) {}

  async createProjectUser(data: CreateProjectUser): Promise<ProjectUser> {
    const { userId, projectId, roleId } = data;
    const [user, project, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.project.findUnique({ where: { id: projectId } }),
      this.prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (project.id !== role.projectId) {
      throw new BadRequestException(
        `${role.name} role does not exist in ${project.name} project`,
      );
    }

    const createProjectUser = this.prisma.projectUser.create({
      data: { userId, projectId, roleId },
    });

    return createProjectUser;
  }
}
