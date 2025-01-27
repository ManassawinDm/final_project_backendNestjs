import { IsEmail, IsNumber, IsString,  } from "class-validator";

export class EncodePasswordDto{
    @IsString()
    password:string;

}