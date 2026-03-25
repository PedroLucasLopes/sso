import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { FilterRoute } from '../dto/filterRoute.dto';
import { Route } from 'generated/prisma/client';
import { PaginationConfig } from 'src/global/pagination/pagination';
import { CreateRoute } from '../dto/createRoute.dto';
import { EditRoute } from '../dto/editRoute.dto';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterRoute): Promise<Route[]> {
    const { page, limit } = PaginationConfig(filter);
    const routes = await this.prisma.route.findMany({
      where: {
        ...(filter?.path && {
          path: { contains: filter.path, mode: 'insensitive' },
        }),
        ...(filter?.method && {
          method: filter.method,
        }),
      },
      ...(filter?.order && {
        orderBy: { method: filter.order },
      }),
      include: {
        permissions: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
      skip: page,
      take: limit,
    });

    if (!routes.length) {
      throw new NotFoundException('No routes found');
    }

    return routes;
  }

  async findById(id: string): Promise<Route> {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { project: true, permissions: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async createRoute(data: CreateRoute): Promise<Route> {
    const findProject = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!findProject) {
      throw new NotFoundException('Project not found');
    }

    const path = this.normalizePath(data.path);
    const createRoute = this.prisma.route.create({ data: { ...data, path } });

    return createRoute;
  }

  async updateRoute(id: string, data: EditRoute): Promise<Route> {
    const findRoute = await this.prisma.route.findUnique({ where: { id } });

    if (!findRoute) {
      throw new NotFoundException('Route not found');
    }

    if (data.path) {
      Object.assign(data, { ...data, path: this.normalizePath(data.path) });
    }

    const updateRoute = this.prisma.route.update({
      where: { id },
      data,
    });

    return updateRoute;
  }

  async deleteRoute(id: string): Promise<void> {
    const findRoute = await this.prisma.route.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!findRoute) {
      throw new NotFoundException('Route not found');
    }

    await this.prisma.route.delete({ where: { id } });
  }

  private normalizePath(path: string): string {
    return path.replace(/^(\/api)|(\/v1)/gm, '');
  }
}
