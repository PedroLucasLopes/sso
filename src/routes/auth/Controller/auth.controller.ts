import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../Service/auth.service';
import { Authorize } from '../dto/authorize.dto';
import { Request, Response } from 'express';
import { GoogleUser } from '../dto/googleUser';
import { Token } from '../dto/token.dto';
import { Public } from 'src/global/decorator/public.decorator';
import { GoogleAuthGuard } from 'src/global/guards/googleAuth.guard';

@Controller('oauth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('authorize')
  @HttpCode(HttpStatus.OK)
  async authorize(
    @Query() query: Authorize,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.validateAuthorizeRequest(query);

    res.cookie('pkce_state', query.state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    const googleAuthUrl = '/sso/oauth/google';
    res.redirect(googleAuthUrl);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ): Promise<void> {
    const { userId, state } = req.user;

    if (!state) throw new InternalServerErrorException('Something went wrong');

    const { code, redirectUri } =
      await this.authService.generateAuthorizationCode(userId, state);

    res.clearCookie('pkce_state');

    const redirectURL = new URL(redirectUri);

    redirectURL.searchParams.set('code', code);
    redirectURL.searchParams.set('state', state);

    res.redirect(redirectURL.toString());
  }

  @Post('token')
  async token(@Body() body: Token): Promise<{
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
  }> {
    return this.authService.exchangeCodeForToken(body);
  }
}
