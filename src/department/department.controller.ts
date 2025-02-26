import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AddDepartmentsDto } from './dto/AddDepartments.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('all')
  async getDepartmentsAll() {
    try {
      return this.departmentService.getDepartmentsAll();
    } catch (error) {
      console.error('Error occurred while fetching department:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch department.',
      };
    }
  }

  @Get(':id/:type')
  async getDepartmentById(
    @Param('id') id: number,
    @Param('type') type: 'main' | 'sub',
  ) {
    try {
      const department = await this.departmentService.getDepartmentById(
        id,
        type,
      );
      return {
        success: true,
        data: department,
      };
    } catch (error) {
      console.error('Error occurred while fetching department:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch department.',
      };
    }
  }

  @Delete(':id')
  async deleteDepartmentById(@Param('id') id: number) {
    try {
      await this.departmentService.deleteDepartmentById(id);
      return {
        success: true,
        message: 'Department deleted successfully.',
      };
    } catch (error) {
      console.error('Error occurred while deleting department:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete department.',
      };
    }
  }

  @Post('add')
  async addDepartment(@Body() credential: AddDepartmentsDto) {
    try {
      const department = await this.departmentService.addDepartment(credential);
      return {
        success: true,
        data: department,
      };
    } catch (error) {
      console.error('Error occurred while adding department:', error);
      return {
        success: false,
        message: error.message || 'Failed to add department.',
      };
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      const result = await this.departmentService.processExcel(file);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error occurred while uploading file:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload file.',
      };
    }
  }
}
