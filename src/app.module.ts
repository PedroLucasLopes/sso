import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './global/prisma/prisma.module';
import { UserModule } from './routes/User/user.module';
import { ProjectModule } from './routes/Project/project.module';
import { RouteModule } from './routes/Route/route.module';
import { RoleModule } from './routes/Role/role.module';
import { PermissionModule } from './routes/Permission/permission.module';
import { ProjectUserModule } from './routes/ProjectUser/projectUser.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { SSOAdminGuard } from './global/guards/ssoadminguard.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProjectModule,
    RouteModule,
    RoleModule,
    PermissionModule,
    ProjectUserModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.SSO_ADMIN_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SSOAdminGuard,
    },
  ],
})
export class AppModule {}
