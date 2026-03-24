import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../dto/jwtPayload.dto';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SSOAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      process.env.SSO_LEVEL_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const clientSecret = request.headers['x-sso-secret'];

    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(
      process.env.SSO_LEVEL_ADMIN,
      [context.getHandler(), context.getClass()],
    );

    if (isAdminRoute) {
      if (clientSecret !== process.env.SSO_ADMIN_SECRET) {
        throw new UnauthorizedException('Invalid SSO admin secret');
      }

      return true;
    }

    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = this.jwtService.verify<JwtPayload>(token);
    request['user'] = payload;

    return true;
  }
}
