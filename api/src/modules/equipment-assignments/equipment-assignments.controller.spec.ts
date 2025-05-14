import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentAssignmentsController } from './equipment-assignments.controller';
import { EquipmentAssignmentsService } from './equipment-assignments.service';

/**
 * EquipmentAssignmentsController test suite
 */
describe('EquipmentAssignmentsController', () => {
  let controller: EquipmentAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentAssignmentsController],
      providers: [
        {
          provide: EquipmentAssignmentsService,
          useValue: {},
        },
      ],
    }).compile();
    controller = module.get<EquipmentAssignmentsController>(EquipmentAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 