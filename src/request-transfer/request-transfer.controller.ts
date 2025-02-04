import { RequestTransferService } from './request-transfer.service';
import { Controller, Get, Post } from '@nestjs/common';

@Controller('request-transfer')
export class RequestTransferController {
    constructor(
        private readonly requestTransferService:RequestTransferService
    ){}

    @Get('all')
      async fetchAll() {
        try {
            return this.requestTransferService.fetchAll();
        } catch (error) {
          throw new Error(
            `Error occurred while fetching department: ${error.message}`,
          );
        }
      }

      @Get('user-request')
      async usersRequest() {
        try {
            return this.requestTransferService.usersRequest();
        } catch (error) {
          throw new Error(
            `Error occurred while fetching users request: ${error.message}`,
          );
        }
      }

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
      @Post('delete')
      async deleteProccess() {
        try {
            return this.requestTransferService.deleteProccess();
        } catch (error) {
          throw new Error(
            `Error Delete Proccess: ${error.message}`,
          );
        }
      }
}
