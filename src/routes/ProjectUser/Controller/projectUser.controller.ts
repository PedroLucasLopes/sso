import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ProjectUserService } from '../Service/projectUser.service';
import { CreateProjectUser } from '../dto/createProjectUser.dto';
import { ProjectUser } from 'generated/prisma/client';
import { Admin } from 'src/global/decorator/public.decorator';

@Controller('projectuser')
@Admin()
export class ProjectUserController {
  constructor(private projectUserService: ProjectUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProjectUser(
    @Body() data: CreateProjectUser,
  ): Promise<ProjectUser> {
    return await this.projectUserService.createProjectUser(data);
  }
}
