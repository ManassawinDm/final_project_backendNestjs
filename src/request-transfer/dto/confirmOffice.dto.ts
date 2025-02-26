import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class ConfirmOfficeDto {
    @IsNumber()
    @IsNotEmpty({ message: 'requestId is required and cannot be empty' }) 
    requestId!: number;

    @IsNumber()
    @IsNotEmpty({ message: 'classId is required and cannot be empty' }) 
    classId!: number;


    @IsNumber()
    @IsNotEmpty({ message: 'officeId is required and cannot be empty' }) 
    officeId!: number;
  }