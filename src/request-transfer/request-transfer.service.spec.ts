import { Test, TestingModule } from '@nestjs/testing';
import { RequestTransferService } from './request-transfer.service';

describe('RequestTransferService', () => {
  let service: RequestTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestTransferService],
    }).compile();

    service = module.get<RequestTransferService>(RequestTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
