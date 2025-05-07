import { Test, TestingModule } from '@nestjs/testing';
import { ShowAssignmentsController } from './show-assignments.controller';
import { ShowAssignmentsService } from './show-assignments.service';
import { CreateShowAssignmentDto } from './dto/create-show-assignment.dto';
import { UpdateShowAssignmentDto } from './dto/update-show-assignment.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { RoleName } from '@/modules/roles/entities/role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ShowAssignment, ShowAssignmentConfirmationStatus } from './entities/show-assignment.entity';
import { Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

// Mock Service Type Helper (Explicit definition)
type MockShowAssignmentsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

// Function to create the mock service instance
const createMockShowAssignmentsService = (): MockShowAssignmentsService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ShowAssignmentsController', () => {
  let controller: ShowAssignmentsController;
  let service: MockShowAssignmentsService;

  const mockUser = { id: 'user-test-id', roles: [{ name: RoleName.ADMIN }] } as User; // Mock user with Admin role
  const mockReq = { user: mockUser }; // Mock request object

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowAssignmentsController],
      providers: [
        { provide: ShowAssignmentsService, useFactory: createMockShowAssignmentsService },
      ],
    })
    // Mock guards - Assume they pass for controller logic tests
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ShowAssignmentsController>(ShowAssignmentsController);
    service = module.get(ShowAssignmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateShowAssignmentDto = { showId: 's1', userId: 'u1', showRoleId: 'r1' };
    const createdAssignment: Partial<ShowAssignment> = { id: 'a1', ...createDto, confirmation_status: ShowAssignmentConfirmationStatus.PENDING };

    it('should call service.create and return the result', async () => {
      service.create.mockResolvedValue(createdAssignment);

      const result = await controller.create(createDto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(createdAssignment);
    });

    it('should forward errors from the service', async () => {
      service.create.mockRejectedValue(new ForbiddenException('Service error'));

      await expect(controller.create(createDto, mockReq as any)).rejects.toThrow(ForbiddenException);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const assignment1: Partial<ShowAssignment> = { id: 'a1', show_id: 's1', user_id: 'u1' };
    const paginatedResult: Pagination<ShowAssignment> = {
        items: [assignment1 as ShowAssignment],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' }
      };

    it('should call service.findAll with pagination options and return the result', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const page = 1;
      const limit = 10;
      const expectedOptions: IPaginationOptions = { page, limit, route: '/show-assignments' };

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
      expect(result).toEqual(paginatedResult);
    });

    it('should handle default pagination values', async () => {
        service.findAll.mockResolvedValue(paginatedResult); // Result doesn't matter for this check
        const expectedOptions: IPaginationOptions = { page: 1, limit: 10, route: '/show-assignments' };

        await controller.findAll(); // Call with no arguments to test defaults

        expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });

    it('should cap limit at 100', async () => {
        service.findAll.mockResolvedValue(paginatedResult);
        const expectedOptions: IPaginationOptions = { page: 1, limit: 100, route: '/show-assignments' };

        await controller.findAll(1, 200); // Call with limit > 100

        expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const assignmentId = 'find-a1';
    const foundAssignment: Partial<ShowAssignment> = { id: assignmentId, show_id: 's1', user_id: 'u1' };

    it('should call service.findOne and return the result', async () => {
      service.findOne.mockResolvedValue(foundAssignment);

      const result = await controller.findOne(assignmentId);

      expect(service.findOne).toHaveBeenCalledWith(assignmentId);
      expect(result).toEqual(foundAssignment);
    });

    it('should throw NotFoundException if service throws NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(assignmentId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const assignmentId = 'update-a1';
    const updateDto: UpdateShowAssignmentDto = { confirmationStatus: ShowAssignmentConfirmationStatus.CONFIRMED };
    const updatedAssignment: Partial<ShowAssignment> = { id: assignmentId, confirmation_status: ShowAssignmentConfirmationStatus.CONFIRMED };

    it('should call service.update and return the result', async () => {
      service.update.mockResolvedValue(updatedAssignment);

      const result = await controller.update(assignmentId, updateDto);

      expect(service.update).toHaveBeenCalledWith(assignmentId, updateDto);
      expect(result).toEqual(updatedAssignment);
    });

    it('should forward NotFoundException from the service', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(assignmentId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const assignmentId = 'delete-a1';

    it('should call service.remove successfully', async () => {
      service.remove.mockResolvedValue(undefined); // remove returns void

      await controller.remove(assignmentId);

      expect(service.remove).toHaveBeenCalledWith(assignmentId);
    });

    it('should forward NotFoundException from the service', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(assignmentId)).rejects.toThrow(NotFoundException);
    });
  });

}); 