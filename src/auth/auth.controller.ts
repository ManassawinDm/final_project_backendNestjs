import { AuthService } from './auth.service';
import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { refreshTokenDto } from './dtos/refreshToken.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService) {}

    @Post('login')
    async login(@Body() credential:LoginDto){
        try {
            return this.authService.login(credential);
        } catch (error) {
            throw new HttpException(
                { message: 'Login failed', error: error.message },
                HttpStatus.UNAUTHORIZED,
              );
        }
    }

    // @Post('refresh')
    // async refreshToken(@Body() credential:refreshTokenDto){
    //     try {
    //         return this.authService.login(credential);
    //     } catch (error) {
    //         throw new HttpException(
    //             { message: 'Login failed', error: error.message },
    //             HttpStatus.UNAUTHORIZED,
    //           );
    //     }
    // }
}
