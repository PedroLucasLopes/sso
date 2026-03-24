import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from 'generated/prisma/client';
import { PaginationConfig } from 'src/global/pagination/pagination';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CreateProject } from '../dto/createProject.dto';
import { FilterProject } from '../dto/filterProject.dto';
import { EditProject } from '../dto/editProject.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterProject): Promise<Project[]> {
    const { page, limit } = PaginationConfig(filter);
    const projects = await this.prisma.project.findMany({
      where: {
        ...(filter?.name && {
          name: { contains: filter.name, mode: 'insensitive' },
        }),
      },
      ...(filter?.order && {
        orderBy: { name: filter.order },
      }),
      include: {
        projectUsers: true,
      },
      skip: page,
      take: limit,
    });

    if (!projects.length) {
      throw new NotFoundException('No Projects Found');
    }

    return projects;
  }

  async findById(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async createProject(data: CreateProject): Promise<Project> {
    const clientId = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('hex');

    const clientSecret = await bcrypt.hash(secret, 10);

    const projectData = { ...data, clientId, clientSecret };
    await this.prisma.project.create({ data: projectData });

    return { ...data, clientSecret: secret } as Project;
  }

  async updateProject(id: string, data: EditProject): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project Not Found');
    }

    const editProject = await this.prisma.project.update({
      where: { id },
      data,
    });

    return editProject;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { projectUsers: true, routes: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.projectUsers.length > 0) {
      throw new BadRequestException('This project have ongoing permissions');
    }

    if (project.routes.length > 0) {
      throw new BadRequestException(
        'Some routes are associated with this project',
      );
    }

    await this.prisma.project.delete({ where: { id } });
  }
}
