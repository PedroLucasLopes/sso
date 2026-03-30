import { IsNotEmpty, IsString } from 'class-validator';

export class Login {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  codeChallenge: string;

  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
