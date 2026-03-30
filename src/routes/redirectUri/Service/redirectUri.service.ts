import { Injectable, NotFoundException } from '@nestjs/common';
import { redirectUri } from 'generated/prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CreateRedirectUri } from '../dto/createRedirectUri.dto';
import { EditRedirectUri } from '../dto/editRedirectUri.dto';

@Injectable()
export class RedirectUriService {
  constructor(private prisma: PrismaService) {}

  async createRedirectUri(data: CreateRedirectUri): Promise<redirectUri> {
    const findProject = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!findProject) {
      throw new NotFoundException('Project not found');
    }

    const createRedirectUri = await this.prisma.redirectUri.create({
      data: {
        redirectUri: data.redirectUri,
        projectId: data.projectId,
      },
    });

    return createRedirectUri;
  }

  async updateRedirectUri(
    id: string,
    data: EditRedirectUri,
  ): Promise<redirectUri> {
    const findRedirectUri = await this.prisma.redirectUri.findUnique({
      where: { id },
    });

    if (!findRedirectUri) {
      throw new NotFoundException('Redirect Uri not found');
    }

    if (data.projectId) {
      const findProject = await this.prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!findProject) {
        throw new NotFoundException('Project not found');
      }
    }

    const updateRedirectUri = await this.prisma.redirectUri.update({
      where: { id },
      data,
    });

    return updateRedirectUri;
  }
}
