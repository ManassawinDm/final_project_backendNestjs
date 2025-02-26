import { TestDto } from 'src/position/dto/test.dto';
import { ProccessDto } from './dto/proccess.dto';
import { RequestTransferService } from './request-transfer.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ConfirmOfficeDto } from './dto/confirmOffice.dto';

@Controller('request-transfer')
export class RequestTransferController {
  constructor(
    private readonly requestTransferService: RequestTransferService,
  ) {}

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

  @Get('result/:classId')
  async resultProcessTransfers(@Param('classId') classId: string,) {
    if (isNaN(Number(classId))) {
      throw new HttpException(
        {
          success: false,
          message: 'Invalid classId. It must be a number.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result =
        await this.requestTransferService.resultProcessTransfers(Number(classId));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('🚨 Error in processTransfers:', error.message);
      throw new HttpException(
        {
          success: false,
          message: 'Error occurred while processing transfers.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('result/office/:classId')
  async resultViewOfficeProcessTransfers(@Param('classId') classId: string,) {
    if (isNaN(Number(classId))) {
      throw new HttpException(
        {
          success: false,
          message: 'Invalid classId. It must be a number.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    
    try {
      const result =
        await this.requestTransferService.resultViewOfficeProcessTransfers(Number(classId));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('🚨 Error in processTransfers:', error.message);
      throw new HttpException(
        {
          success: false,
          message: 'Error occurred while processing transfers.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("comfirmoffice")
  async ComfirmTargetOffice(@Body() credential: ConfirmOfficeDto) {
    try {
      const result =
        await this.requestTransferService.ComfirmTargetOffice(credential);
      return {
        success: true,
        message: 'Transfer processing completed successfully.',
        data: result,
      };
    } catch (error) {
      console.error('🚨 Error in processTransfers:', error.message);
      throw new HttpException(
        {
          success: false,
          message: 'Error occurred while processing transfers.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Post()
  async processTransfers(@Body() credential: ProccessDto) {
    try {
      const result =
        await this.requestTransferService.processTransfers(credential);
      return {
        success: true,
        message: 'Transfer processing completed successfully.',
        data: result,
      };
    } catch (error) {
      console.error('🚨 Error in processTransfers:', error.message);
      throw new HttpException(
        {
          success: false,
          message: 'Error occurred while processing transfers.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('delete')
  async deleteProccess(@Body() credential: ProccessDto) {
    try {
      return this.requestTransferService.deleteProccess(credential);
    } catch (error) {
      throw new Error(`Error Delete Proccess: ${error.message}`);
    }
  }

  @Get('test')
  async test() {
    try {
      return this.requestTransferService.test();
    } catch (error) {
      throw new Error(`Error Delete Proccess: ${error.message}`);
    }
  }
}
