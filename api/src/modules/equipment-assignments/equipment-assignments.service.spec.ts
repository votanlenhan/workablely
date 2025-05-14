import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EquipmentAssignment } from './entities/equipment-assignment.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { User } from '../users/entities/user.entity';
import { Show } from '../shows/entities/show.entity';
import { Repository } from 'typeorm';

/**
 * EquipmentAssignmentsService test suite
 */
describe('EquipmentAssignmentsService', () => {
  let service: EquipmentAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentAssignmentsService,
        { provide: getRepositoryToken(EquipmentAssignment), useClass: Repository },
        { provide: getRepositoryToken(Equipment), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Show), useClass: Repository },
      ],
    }).compile();
    service = module.get<EquipmentAssignmentsService>(EquipmentAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 