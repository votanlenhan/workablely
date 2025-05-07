import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { Equipment, EquipmentStatus } from '@/modules/equipment/entities/equipment.entity';
import { CreateEquipmentDto } from '@/modules/equipment/dto/create-equipment.dto';
import { UpdateEquipmentDto } from '@/modules/equipment/dto/update-equipment.dto';
import { paginate } from 'nestjs-typeorm-paginate';

// Mock paginate function
jest.mock('nestjs-typeorm-paginate', () => ({
  ...jest.requireActual('nestjs-typeorm-paginate'),
  paginate: jest.fn(),
}));

// Define a mock repository for Equipment directly
const mockEquipmentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  // Note: EquipmentService.findAll uses paginate, which takes the repository directly.
  // If other service methods used createQueryBuilder, it would be added here.
};

describe('EquipmentService', () => {
  let service: EquipmentService;
  let repository: Repository<Equipment>; // This will be our mock repository instance

  const mockEquipmentId = 'a-uuid';
  const mockEquipment: Equipment = {
    id: mockEquipmentId,
    name: 'Test Camera',
    serial_number: 'TC12345',
    status: EquipmentStatus.AVAILABLE,
    created_at: new Date(), // Corrected from previous state if it had createdAt/updatedAt
    updated_at: new Date(),
    assignments: [], 
    description: undefined,
    purchase_date: undefined,
    purchase_price: undefined,
    category: undefined,
    notes: undefined,
  } as Equipment; 

  beforeEach(async () => {
    // Clear all individual mocks in our defined object
    mockEquipmentRepository.create.mockClear();
    mockEquipmentRepository.save.mockClear();
    mockEquipmentRepository.findOne.mockClear();
    mockEquipmentRepository.remove.mockClear();
    // If createQueryBuilder were added to mockEquipmentRepository, clear its mocks too.

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentService,
        {
          provide: getRepositoryToken(Equipment),
          useValue: mockEquipmentRepository, // Use the direct mock
        },
      ],
    }).compile();

    service = module.get<EquipmentService>(EquipmentService);
    repository = module.get<Repository<Equipment>>(getRepositoryToken(Equipment)); // Injected instance is mockEquipmentRepository
    (paginate as jest.Mock).mockClear(); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateEquipmentDto = {
      name: 'New Test Camera',
      serial_number: 'NTC54321',
      status: EquipmentStatus.AVAILABLE,
      purchase_date: new Date().toISOString(),
    };

    it('should create and return a new piece of equipment', async () => {
      const expectedEquipment = { ...mockEquipment, ...createDto, id: 'new-uuid', purchase_date: new Date(createDto.purchase_date!) } as Equipment;
      (repository.create as jest.Mock).mockReturnValue(expectedEquipment); 
      (repository.save as jest.Mock).mockResolvedValue(expectedEquipment);

      const result = await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        purchase_date: new Date(createDto.purchase_date!),
      });
      expect(repository.save).toHaveBeenCalledWith(expectedEquipment);
      expect(result).toEqual(expectedEquipment);
    });

    it('should throw ConflictException if serial number already exists', async () => {
      const queryFailedError = new QueryFailedError('query', [], { code: '23505' } as any); 
      (repository.save as jest.Mock).mockRejectedValue(queryFailedError);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should re-throw other errors during creation', async () => {
      const genericError = new Error('Generic DB Error');
      (repository.save as jest.Mock).mockRejectedValue(genericError);
      await expect(service.create(createDto)).rejects.toThrow(genericError);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of equipment', async () => {
      const paginationResult = { items: [mockEquipment], meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 } } as any;
      (paginate as jest.Mock).mockResolvedValue(paginationResult);
      const options = { page: 1, limit: 10 };
      const result = await service.findAll(options);
      expect(paginate).toHaveBeenCalledWith(repository, options, { relations: [], order: { created_at: 'DESC' } });
      expect(result).toEqual(paginationResult);
    });
  });

  describe('findOne', () => {
    it('should return a single piece of equipment if found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockEquipment);
      const result = await service.findOne(mockEquipmentId);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockEquipmentId } });
      expect(result).toEqual(mockEquipment);
    });

    it('should throw NotFoundException if equipment is not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateEquipmentDto = { name: 'Updated Test Camera' };

    it('should update and return the equipment', async () => {
      const existingEquipment = { ...mockEquipment }; 
      const updatedEquipment = { ...existingEquipment, ...updateDto } as Equipment;
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingEquipment);
      (repository.save as jest.Mock).mockResolvedValue(updatedEquipment);

      const result = await service.update(mockEquipmentId, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(mockEquipmentId); // Service's own findOne is called first
      // The actual save is called on the repository instance
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedEquipment)); 
      expect(result).toEqual(updatedEquipment);
    });

    it('should throw NotFoundException if equipment to update is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

     it('should throw ConflictException if updated serial number already exists', async () => {
      const updateDtoWithSerial: UpdateEquipmentDto = { serial_number: 'DUPLICATE_SERIAL' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEquipment);
      const queryFailedError = new QueryFailedError('query', [], { code: '23505' } as any);
      (repository.save as jest.Mock).mockRejectedValue(queryFailedError);
      await expect(service.update(mockEquipmentId, updateDtoWithSerial)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove the equipment successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEquipment); 
      (repository.remove as jest.Mock).mockResolvedValue(undefined as any); 

      await service.remove(mockEquipmentId);

      expect(service.findOne).toHaveBeenCalledWith(mockEquipmentId);
      expect(repository.remove).toHaveBeenCalledWith(mockEquipment);
    });

    it('should throw NotFoundException if equipment to remove is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 