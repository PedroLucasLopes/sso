import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { PermissionService } from '../Service/permission.service';
import { CreatePermission } from '../dto/createPermission.dto';
import { Permission } from 'generated/prisma/client';
import { PrismaExceptionValidationFilter } from 'src/global/error/prismaclientvalidationerror.exception';
import { Admin } from 'src/global/decorator/public.decorator';

@Controller('permission')
@Admin()
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(new PrismaExceptionValidationFilter())
  async createPermission(@Body() data: CreatePermission): Promise<Permission> {
    return await this.permissionService.createPermission(data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Param('id') id: string): Promise<void> {
    return await this.permissionService.deletePermission(id);
  }
}
