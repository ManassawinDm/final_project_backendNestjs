import { EncodePasswordDto } from 'src/auth/dtos/encodePwd.dto';
import { UsersService } from './users.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/auth.guard';

// @UseGuards(AuthenticationGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService:UsersService){}

    @Get('all')
    async getUsersAll(){
        return this.usersService.getUsersAll();
    }

    @Post('encode')
    async EncodePassword(@Body() credential:EncodePasswordDto){
        return this.usersService.EncodePassword(credential);
    }
}
