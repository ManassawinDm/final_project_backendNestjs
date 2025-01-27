import { IsEmail, IsNumber, IsString,  } from "class-validator";

export class AddUsersDto{
    @IsEmail()
    email:string;

    @IsString()
    password:string;

    @IsString()
    firstname:string

    @IsString()
    lastname:string

    @IsNumber()
    userClass:number

    @IsNumber()
    department_id:number

    @IsString()
    position:string
}