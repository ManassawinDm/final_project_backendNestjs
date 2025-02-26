import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';
import { RequestTransferModule } from './request-transfer/request-transfer.module';
import { ClassModule } from './class/class.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load:[config] }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config)=>({
        secret: config.get('jwt.secret'),
      }),
      
      global: true,
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    DepartmentModule,
    PositionModule,
    RequestTransferModule,
    ClassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
