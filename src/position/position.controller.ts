import { Body, Controller, Get, Post } from '@nestjs/common';
import { PositionService } from './position.service';
import { UpdatePositionDto } from './dto/updatePos.dto';

@Controller('position')
export class PositionController {
    constructor(private readonly positionService: PositionService) {}
    @Get('all')
      async getPositionAll() {
        try {
            const positions = await this.positionService.getPosition();
            return {
              success: true,
              data: positions,
            };
          } catch (error) {
            console.error('Error occurred while fetching positions:', error);
            return {
              success: false,
              message: error.message || 'Failed to fetch positions.',
            };
          }
    }

    @Post('update')
    async updatePosition(@Body() credential:UpdatePositionDto){
        try {
            const result = await this.positionService.updatePosition(credential);
            return {
              success: true,
              message: result.message,
            };
          } catch (error) {
            console.error('Error updating position:', error);
            return {
              success: false,
              message: error.message || 'Failed to update position. Please try again later.',
            };
          }
    }
}
