import { IsOptional, IsString } from "class-validator";
import { PageOptionsDto } from "../../../../common/dto/input/page-options.dto";

export class ReadManyLocationsDto extends PageOptionsDto {
  @IsString()
  @IsOptional()
  name?: string;
}
