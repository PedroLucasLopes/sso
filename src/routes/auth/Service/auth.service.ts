import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from 'generated/prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateProject(
    clientId: string,
    clientSecret: string,
  ): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { clientId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isValid = await bcrypt.compare(clientSecret, project.clientSecret);

    if (!isValid) {
      throw new BadRequestException('Invalid Token');
    }

    return project;
  }
}
