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
import { Role } from 'generated/prisma/client';
import { RoleService } from '../Service/role.service';
import { PrismaExceptionValidationFilter } from 'src/global/error/prismaclientvalidationerror.exception';
import { CreateRole } from '../dto/createRole.dto';
import { EditRole } from '../dto/editRole.dto';
import { FilterRole } from '../dto/filterRole.dto';
import { Admin } from 'src/global/decorator/public.decorator';

@Controller('role')
@Admin()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filter: FilterRole): Promise<Role[]> {
    return await this.roleService.findAll(filter);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<Role> {
    return await this.roleService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(new PrismaExceptionValidationFilter())
  async createRole(@Body() data: CreateRole): Promise<Role> {
    return await this.roleService.createRole(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') id: string,
    @Body() data: EditRole,
  ): Promise<Role> {
    return await this.roleService.updateRole(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: string): Promise<void> {
    return await this.roleService.deleteRole(id);
  }
}
