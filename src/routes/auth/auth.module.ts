import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/global/prisma/prisma.module';
import { AuthController } from './Controller/auth.controller';
import { AuthService } from './Service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategy/google.strategy';
import { RedisModule } from '../Redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<number>('JWT_EXPIRES_IN', 1209600),
        },
      }),
    }),
    RedisModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
