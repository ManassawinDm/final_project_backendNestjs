import { RequestTransferService } from './request-transfer.service';
import { Controller, Get, Post } from '@nestjs/common';

@Controller('request-transfer')
export class RequestTransferController {
    constructor(
        private readonly requestTransferService:RequestTransferService
    ){}

    @Post()
      async processTransfers() {
        try {
            return this.requestTransferService.processTransfers();
        } catch (error) {
          throw new Error(
            `Error occurred while fetching department: ${error.message}`,
          );
        }
      }
}
