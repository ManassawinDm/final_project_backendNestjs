import { Test, TestingModule } from '@nestjs/testing';
import { RequestTransferController } from './request-transfer.controller';

describe('RequestTransferController', () => {
  let controller: RequestTransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestTransferController],
    }).compile();

    controller = module.get<RequestTransferController>(RequestTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
