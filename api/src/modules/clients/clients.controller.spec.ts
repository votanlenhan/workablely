import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'; // Use alias
import { RolesGuard } from '@/core/guards/roles.guard'; // Use alias
import { RoleName } from '@/modules/roles/entities/role.entity'; // Use alias
import { Client } from './entities/client.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

// Mock Service Type Helper (Explicit definition)
type MockClientsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

// Function to create the mock service instance
const createMockClientsService = (): MockClientsService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: MockClientsService;

  // No need to mock user/req here as Client endpoints might not need user context directly
  // unless specific logic requires it (e.g., assigning creator)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useFactory: createMockClientsService },
      ],
    })
    // Mock guards - assume pass for controller logic tests
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateClientDto = { name: 'New Client', phone_number: '123' };
    const createdClient: Partial<Client> = { id: 'c1', name: 'New Client' };

    it('should call service.create and return the result', async () => {
      service.create.mockResolvedValue(createdClient);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdClient);
    });

    it('should forward errors from the service', async () => {
      service.create.mockRejectedValue(new ForbiddenException('Create error'));

      await expect(controller.create(createDto)).rejects.toThrow(ForbiddenException);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const client1: Partial<Client> = { id: 'c1', name: 'Client A' };
    const paginatedResult: Pagination<Client> = {
      items: [client1 as Client],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' }
    };

    it('should call service.findAll with pagination options and return the result', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const options = { page: 1, limit: 10, route: '/clients' };

      const result = await controller.findAll(options.page, options.limit);

      expect(service.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(paginatedResult);
    });

    it('should handle default pagination values', async () => {
        service.findAll.mockResolvedValue(paginatedResult); // Result doesn't matter
        const expectedOptions = { page: 1, limit: 10, route: '/clients' };

        await controller.findAll();

        expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });

    it('should cap limit at 100', async () => {
        service.findAll.mockResolvedValue(paginatedResult);
        const expectedOptions = { page: 1, limit: 100, route: '/clients' };

        await controller.findAll(1, 200);

        expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const clientId = 'find-c1';
    const foundClient: Partial<Client> = { id: clientId, name: 'Found Client' };

    it('should call service.findOne and return the result', async () => {
      service.findOne.mockResolvedValue(foundClient);

      const result = await controller.findOne(clientId);

      expect(service.findOne).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(foundClient);
    });

    it('should throw NotFoundException if service throws NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(clientId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const clientId = 'update-c1';
    const updateDto: UpdateClientDto = { name: 'Updated Client' };
    const updatedClient: Partial<Client> = { id: clientId, name: 'Updated Client' };

    it('should call service.update and return the result', async () => {
      service.update.mockResolvedValue(updatedClient);

      const result = await controller.update(clientId, updateDto);

      expect(service.update).toHaveBeenCalledWith(clientId, updateDto);
      expect(result).toEqual(updatedClient);
    });

    it('should forward NotFoundException from the service', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(clientId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const clientId = 'delete-c1';

    it('should call service.remove successfully', async () => {
      service.remove.mockResolvedValue(undefined); // remove returns void

      await controller.remove(clientId);

      expect(service.remove).toHaveBeenCalledWith(clientId);
    });

    it('should forward NotFoundException from the service', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(clientId)).rejects.toThrow(NotFoundException);
    });
  });

}); 