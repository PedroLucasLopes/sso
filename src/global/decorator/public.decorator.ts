import { SetMetadata } from '@nestjs/common';
import {
  SSO_LEVEL_PUBLIC,
  SSO_LEVEL_ADMIN,
  SSO_LEVEL_AUTH,
} from '../constants/ssoLevel.constant';

export const Public = () => SetMetadata(SSO_LEVEL_PUBLIC, true);
export const Admin = () => SetMetadata(SSO_LEVEL_ADMIN, true);
export const Auth = () => SetMetadata(SSO_LEVEL_AUTH, true);
