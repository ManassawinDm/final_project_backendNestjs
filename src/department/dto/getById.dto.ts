import { IsEmail, IsNumber, IsString,  } from "class-validator";

export class GetDepartmentByIdDto{
    @IsString()
    token:string
}