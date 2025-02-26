import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class UpdatePositionDto {
  @IsNumber()
  id!: number;

  @IsNumber()
  @Min(0, { message: 'Quantity must be a non-negative number' }) 
  quantity!: number;

}
