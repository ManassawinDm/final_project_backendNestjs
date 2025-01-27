import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class AddDepartmentsDto {
  @IsString()
  name: string;

  @IsString()
  short_name: string;

  @IsString()
  address: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  province: string;

  @IsString()
  area: string;

  @IsString()
  type: string;
}
