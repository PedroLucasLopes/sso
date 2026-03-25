import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { RedisService } from 'src/routes/Redis/Service/redis.service';
import { Authorize } from '../dto/authorize.dto';
import * as crypto from 'node:crypto';
import { Token } from '../dto/token.dto';
import { JwtPayload } from '../dto/jwtPayload.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateAuthorizeRequest(data: Authorize): Promise<void> {
    if (data.response_type !== 'code') {
      throw new BadRequestException('response_type must be "code"');
    }

    if (data.code_challenge_method !== 'S256') {
      throw new BadRequestException(
        'Only S256 code_challenge_method is supported',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: { clientId: data.client_id },
      select: { id: true, allowedRedirectUris: true },
    });

    if (!project) {
      throw new NotFoundException('Unknown client_id');
    }

    const redirectUriIsAllowed = (
      project.allowedRedirectUris as string[]
    ).includes(data.redirect_uri);

    if (!redirectUriIsAllowed) {
      throw new BadRequestException('redirect_uri not allowed for this client');
    }

    await this.redis.setPkceSession(data.state, {
      codeChallenge: data.code_challenge,
      clientId: data.client_id,
      redirectUri: data.redirect_uri,
    });
  }

  async generateAuthorizationCode(
    userId: string,
    state: string,
  ): Promise<{ code: string; redirectUri: string }> {
    const session = await this.redis.getPkceSession(state);

    if (!session) {
      throw new UnauthorizedException('PKCE session expired or invalid state');
    }

    const projectUser = await this.prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: await this.getProjecIdByClientId(session.clientId),
        },
      },
    });

    if (!projectUser) {
      throw new UnauthorizedException(
        'User does not have access to this project',
      );
    }

    const code = crypto.randomBytes(64).toString('hex');

    await Promise.all([
      this.redis.setAuthCode(code, {
        userId,
        clientId: session.clientId,
        challenge: session.codeChallenge,
        redirectUri: session.redirectUri,
      }),
      this.redis.deletePkceSession(state),
    ]);

    return { code, redirectUri: session.redirectUri };
  }

  async exchangeCodeForToken(data: Token): Promise<{
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
  }> {
    if (data.grant_type !== 'authorization_code') {
      throw new BadRequestException('granty_type must be "authorization_code"');
    }

    const authCodeData = await this.redis.getAuthCode(data.code);

    if (!authCodeData) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    if (authCodeData.clientId !== data.client_id) {
      throw new UnauthorizedException('client_id mismatch');
    }

    const projectId = await this.getProjecIdByClientId(data.client_id);

    const computedChallenge = crypto
      .createHash('sha256')
      .update(data.code_verifier)
      .digest('base64url');

    if (computedChallenge !== authCodeData.challenge) {
      throw new UnauthorizedException('PKCE verification failed');
    }

    if (data.redirect_uri !== authCodeData.redirectUri) {
      throw new BadRequestException('redirect_uri mismatch');
    }

    const projectUser = await this.prisma.projectUser.findUnique({
      where: { userId_projectId: { userId: authCodeData.userId, projectId } },
      include: {
        user: { select: { email: true, name: true } },
        role: {
          include: {
            permissions: {
              include: { route: true },
            },
          },
        },
      },
    });

    if (!projectUser) {
      throw new UnauthorizedException('User has no role in this project');
    }

    const permissions = projectUser.role.permissions.map((p) => ({
      path: p.route.path,
      method: p.route.method,
    }));

    const expiresIn = this.config.get<number>('JWT_EXPIRES_IN', 3600);

    const payload: JwtPayload = {
      sub: authCodeData.userId,
      email: projectUser.user.email,
      name: projectUser.user.name,
      clientId: data.client_id,
      permissions,
    };

    await this.redis.deleteAuthCode(data.code);

    const access_token = this.jwt.sign(payload, { expiresIn });

    return { access_token, token_type: 'Bearer', expires_in: expiresIn };
  }

  private async getProjecIdByClientId(clientId: string) {
    const project = await this.prisma.project.findUnique({
      where: { clientId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.id;
  }
}
