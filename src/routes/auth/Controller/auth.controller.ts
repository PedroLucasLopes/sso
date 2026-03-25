import { Controller } from '@nestjs/common';
import { AuthService } from '../Service/auth.service';

@Controller('oauth')
export class AuthController {
  constructor(private authService: AuthService) {}
}
