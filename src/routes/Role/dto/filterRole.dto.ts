import { IsEnum, IsOptional } from 'class-validator';
import { RoleEnum } from 'generated/prisma/enums';
import { Pagination } from 'src/global/pagination/dto/pagination.dto';

export class FilterRole extends Pagination {
  @IsOptional()
  @IsEnum(RoleEnum)
  name?: RoleEnum;
}
