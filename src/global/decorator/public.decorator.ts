import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(process.env.SSO_LEVEL_PUBLIC, true);
export const Admin = () => SetMetadata(process.env.SSO_LEVEL_ADMIN, true);
export const Auth = () => SetMetadata(process.env.SSO_LEVEL_AUTH, true);
