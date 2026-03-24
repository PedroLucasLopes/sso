import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from '../Service/auth.service';
import { Project } from 'generated/prisma/client';
import { PrismaExceptionValidationFilter } from 'src/global/error/prismaclientvalidationerror.exception';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseFilters(new PrismaExceptionValidationFilter())
  async validateProject(
    clientId: string,
    clientSecret: string,
  ): Promise<Project> {
    return await this.authService.validateProject(clientId, clientSecret);
  }
}
