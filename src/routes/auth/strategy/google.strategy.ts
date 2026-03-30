import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { GoogleUser } from '../dto/googleUser';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
      state: false,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const state = req.cookies?.['pkce_state'] as string | undefined;
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    if (!email)
      throw new NotFoundException('Google profile has no email', undefined);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User Not Found');

    if (user && !user.authId) {
      await this.prisma.user.update({
        where: { email },
        data: { authId: googleId },
      });
    }

    const googleUser: GoogleUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
      state,
    };

    done(null, googleUser);
  }
}
