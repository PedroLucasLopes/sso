import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { RoleEnum } from 'generated/prisma/enums';

export class CreateRole {
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  name: RoleEnum;

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  projectId: string;
}
