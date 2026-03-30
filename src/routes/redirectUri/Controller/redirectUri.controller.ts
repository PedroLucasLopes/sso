import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import { Admin } from 'src/global/decorator/public.decorator';
import { RedirectUriService } from '../Service/redirectUri.service';
import { PrismaExceptionValidationFilter } from 'src/global/error/prismaclientvalidationerror.exception';
import { redirectUri } from 'generated/prisma/client';
import { EditRedirectUri } from '../dto/editRedirectUri.dto';

@Controller('redirecturi')
@Admin()
export class RedirectUriController {
  constructor(private redirectUriService: RedirectUriService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(new PrismaExceptionValidationFilter())
  async createRedirectUri(@Body() data: redirectUri): Promise<redirectUri> {
    return await this.redirectUriService.createRedirectUri(data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateRedirectUri(
    @Param('id') id: string,
    @Body() data: EditRedirectUri,
  ): Promise<redirectUri> {
    return await this.redirectUriService.updateRedirectUri(id, data);
  }
}
