import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    UsersModule, 
    PassportModule, 
    DatabaseModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
