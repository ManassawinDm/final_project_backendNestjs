import { Module } from '@nestjs/common';
import { RequestTransferService } from './request-transfer.service';
import { RequestTransferController } from './request-transfer.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RequestTransferService],
  controllers: [RequestTransferController]
})
export class RequestTransferModule {}
