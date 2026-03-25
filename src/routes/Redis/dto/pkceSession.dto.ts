import { IsNotEmpty, IsString } from 'class-validator';

export class PkceSession {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  redirectUri: string;

  @IsString()
  @IsNotEmpty()
  codeChallenge: string;
}
