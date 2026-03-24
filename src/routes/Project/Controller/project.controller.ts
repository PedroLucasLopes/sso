import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { PrismaExceptionValidationFilter } from 'src/global/error/prismaclientvalidationerror.exception';
import { ProjectService } from '../Service/project.service';
import { FilterProject } from '../dto/filterProject.dto';
import { Project } from 'generated/prisma/client';
import { CreateProject } from '../dto/createProject.dto';
import { EditProject } from '../dto/editProject.dto';
import { Admin } from 'src/global/decorator/public.decorator';

@Controller('project')
@Admin()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filter: FilterProject): Promise<Project[]> {
    return await this.projectService.findAll(filter);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<Project> {
    return await this.projectService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(new PrismaExceptionValidationFilter())
  async createProject(@Body() data: CreateProject): Promise<Project> {
    return await this.projectService.createProject(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @Param('id') id: string,
    @Body() data: EditProject,
  ): Promise<Project> {
    return await this.projectService.updateProject(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Param('id') id: string) {
    return await this.projectService.deleteProject(id);
  }
}
