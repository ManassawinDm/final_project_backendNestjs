import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class UpdatePositionDto {
  @IsNumber()
  id!: number;

  @IsNumber()
  quantity!: number;

}
