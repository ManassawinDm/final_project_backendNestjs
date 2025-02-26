import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class ProccessDto {
    @IsNumber()
    @IsNotEmpty({ message: 'classId is required and cannot be empty' }) 
    classId!: number;
  }