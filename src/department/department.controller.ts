import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AddDepartmentsDto } from './dto/AddDepartments.dto';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('all')
  async getDepartmentsAll() {
    try {
      return this.departmentService.getDepartmentsAll();
    } catch (error) {
      throw new Error(
        `Error occurred while fetching department: ${error.message}`,
      );
    }
  }

  @Get(':id/:type')
  async getDepartmentById(
    @Param('id') id: number,
    @Param('type') type: 'main' | 'sub',
  ) {
    try {
      return await this.departmentService.getDepartmentById(id, type);
    } catch (error) {
      throw new Error(
        `Error occurred while fetchingbyId department: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  async deleteDepartmentById(@Param('id') id: number): Promise<string> {
    try {
      return await this.departmentService.deleteDepartmentById(id);
    } catch (error) {
      throw new Error(
        `Error occurred while deleting department: ${error.message}`,
      );
    }
  }

  @Post('add')
  async addDepartment(@Body() credential: AddDepartmentsDto) {
    try {
      return this.departmentService.addDepartment(credential);
    } catch (error) {
        throw new Error(
            `Error occurred while add department: ${error.message}`,
          );
    }
  }
}
