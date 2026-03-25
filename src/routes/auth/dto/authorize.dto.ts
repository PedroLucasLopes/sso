import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class Authorize {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsUrl()
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsNotEmpty()
  code_challenge: string;

  @IsString()
  @IsNotEmpty()
  code_challenge_method: 'S256';

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  response_type: 'code';
}
