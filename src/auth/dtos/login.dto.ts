import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class LoginDto{
    @IsEmail()
    email:string;

    @IsString()
    // @MinLength(6)
    // @Matches(/^(?=.*[0-9])/,{message:'Password must contain at least ine number' })
    password:string;
}