import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PaginationConfig } from 'src/global/pagination/pagination';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { FilterUser } from '../dto/filterUser.dto';
import { CreateUser } from '../dto/createUser.dto';
import { EditUser } from '../dto/editUser.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterUser): Promise<User[]> {
    const { page, limit } = PaginationConfig(filter);
    const users = await this.prisma.user.findMany({
      where: {
        ...(filter?.name && {
          name: { contains: filter.name, mode: 'insensitive' },
        }),
        ...(filter?.email && {
          email: { contains: filter.email, mode: 'insensitive' },
        }),
      },
      ...(filter?.order && {
        orderBy: { name: filter.order },
      }),
      include: {
        projectUsers: {
          select: {
            project: true,
            role: {
              select: {
                permissions: {
                  select: { route: { select: { path: true, method: true } } },
                },
              },
            },
          },
        },
      },
      skip: page,
      take: limit,
    });

    if (!users.length) {
      throw new NotFoundException('No Users Found');
    }

    return users;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        projectUsers: {
          select: {
            user: true,
            project: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(data: CreateUser): Promise<User> {
    const createUser = this.prisma.user.create({ data });

    return createUser;
  }

  async updateUser(id: string, data: EditUser): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const editUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return editUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { projectUsers: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.projectUsers.length > 0) {
      throw new BadRequestException('This user have ongoing permissions');
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
