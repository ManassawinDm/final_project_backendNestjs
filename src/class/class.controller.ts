import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ClassService } from './class.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  
  @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      return this.classService.processExcel(file);
    }
}
