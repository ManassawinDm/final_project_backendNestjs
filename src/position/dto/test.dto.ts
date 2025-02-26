import { IsNumber } from 'class-validator';

export class TestDto {
  @IsNumber()
  classId: number;

  @IsNumber()
  userId: number;
}