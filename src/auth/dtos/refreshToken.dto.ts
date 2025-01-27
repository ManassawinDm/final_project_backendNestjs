import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class refreshTokenDto{
    userId:any;

    @IsString()
    refreshToken:string;
}