import { EncodePasswordDto } from 'src/auth/dtos/encodePwd.dto';
import { UsersService } from './users.service';
import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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

    @Post('upload')
      @UseInterceptors(FileInterceptor('file'))
      async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
          throw new BadRequestException('No file uploaded');
        }
        return this.usersService.processExcel(file);
      }
}
