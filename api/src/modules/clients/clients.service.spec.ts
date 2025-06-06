import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { NotFoundException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mock the entire module - simplified
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(), // Return a simple mock function initially
}));

// Get the mocked function instance
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');

// Mock Repository Type Helper (Explicit definition)
type MockRepository = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  preload: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder: jest.Mock;
  // Add other methods if needed
};

// Mock Query Builder
const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    // Add other query builder methods if used by the service's findAll
};

// Function to create the mock repository instance (now returns explicit type)
const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
});

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockRepository; // Use the new explicit type

  beforeEach(async () => {
    // Reset mocks
    mockPaginate.mockClear();
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());

    // Default mock for paginate
    mockPaginate.mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useFactory: createMockRepository },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE Tests --- //
  describe('create', () => {
    it('should create and return a client when email is provided and unique', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client', phone_number: '123', email: 'unique@example.com'
      };
      const expectedClient: Client = {
        id: 'uuid-1', name: 'Test Client', phone_number: '123', email: 'unique@example.com',
        address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(),
        shows: [],
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(expectedClient);
      repository.save.mockResolvedValue(expectedClient);

      const result = await service.create(createClientDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createClientDto.email } });
      expect(repository.create).toHaveBeenCalledWith(createClientDto);
      expect(repository.save).toHaveBeenCalledWith(expectedClient);
      expect(result).toEqual(expectedClient);
    });

    it('should create a client when email is not provided', async () => {
        const createClientDto: CreateClientDto = { name: 'No Email Client', phone_number: '456' };
        const expectedClient: Client = {
            id: 'uuid-2', name: 'No Email Client', phone_number: '456', email: null,
            address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(),
            shows: [],
        };

        repository.create.mockReturnValue(expectedClient);
        repository.save.mockResolvedValue(expectedClient);

        const result = await service.create(createClientDto);

        expect(repository.findOne).not.toHaveBeenCalled();
        expect(repository.create).toHaveBeenCalledWith(createClientDto);
        expect(repository.save).toHaveBeenCalledWith(expectedClient);
        expect(result).toEqual(expectedClient);
    });

    it('should warn and create client if email already exists', async () => {
      const createClientDto: CreateClientDto = { name: 'Warn Client', phone_number: '789', email: 'exists@example.com' };
      const existingClient: Partial<Client> = { id: 'uuid-existing', email: 'exists@example.com' };
      const expectedNewClient: Client = {
          id: 'uuid-new', name: 'Warn Client', phone_number: '789', email: 'exists@example.com',
          address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(),
          shows: [],
      };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      repository.findOne.mockResolvedValue(existingClient);
      repository.create.mockReturnValue(expectedNewClient);
      repository.save.mockResolvedValue(expectedNewClient);

      await service.create(createClientDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createClientDto.email } });
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Client with email ${createClientDto.email} already exists.`);
      expect(repository.create).toHaveBeenCalledWith(createClientDto);
      expect(repository.save).toHaveBeenCalledWith(expectedNewClient);
      consoleWarnSpy.mockRestore(); // Restore console.warn
    });
  });

  // --- FINDALL Tests --- //
  describe('findAll', () => {
    it('should return a paginated list of clients', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/clients' };
      const client1: Partial<Client> = { id: 'uuid-c1', name: 'Client A' };
      const paginatedResult: Pagination<Client> = {
        items: [client1 as Client],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        links: { first: '/clients?limit=10', previous: '', next: '', last: '/clients?page=1&limit=10' }
      };

      // Setup mocks before calling the service method
      mockPaginate.mockResolvedValue(paginatedResult);
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any); // Return the mock builder

      const result = await service.findAll(options);

      // Verify calls
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('client');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('client.created_at', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
      expect(result).toEqual(paginatedResult);
    });
  });

  // --- FINDONE Tests --- //
  describe('findOne', () => {
    it('should return a client if found', async () => {
      const clientId = 'uuid-find';
      const expectedClient: Partial<Client> = { id: clientId, name: 'Found Client' };

      repository.findOne.mockResolvedValue(expectedClient as Client);

      const result = await service.findOne(clientId);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
      expect(result).toEqual(expectedClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      const clientId = 'not-found-uuid';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(clientId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(clientId)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
    });
  });

  // --- UPDATE Tests --- //
  describe('update', () => {
    it('should update client name and return the client', async () => {
      const clientId = 'uuid-update';
      const updateClientDto: UpdateClientDto = { name: 'Updated Name' };
      const existingClient: Client = { id: clientId, name: 'Original', phone_number:'1', email: null, address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(), shows: [] };
      const preloadedClient: Client = { ...existingClient, ...updateClientDto, updated_at: new Date() };

      repository.preload.mockResolvedValue(preloadedClient);
      repository.save.mockResolvedValue(preloadedClient);

      const result = await service.update(clientId, updateClientDto);

      expect(repository.findOne).not.toHaveBeenCalled(); // Email not in DTO
      expect(repository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
      expect(repository.save).toHaveBeenCalledWith(preloadedClient);
      expect(result).toEqual(preloadedClient);
    });

     it('should update client email if new email is not conflicting', async () => {
        const clientId = 'uuid-update-email';
        const updateClientDto: UpdateClientDto = { email: 'new@example.com' };
        const existingClient: Client = { id: clientId, name:'Update Email', phone_number:'2', email:'old@example.com', address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(), shows: [] };
        const preloadedClient: Client = { ...existingClient, ...updateClientDto, updated_at: new Date() };

        repository.findOne.mockResolvedValue(null); // No conflict found
        repository.preload.mockResolvedValue(preloadedClient);
        repository.save.mockResolvedValue(preloadedClient);

        const result = await service.update(clientId, updateClientDto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { email: updateClientDto.email } });
        expect(repository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
        expect(repository.save).toHaveBeenCalledWith(preloadedClient);
        expect(result).toEqual(preloadedClient);
    });

    it('should throw error if updating to an existing email used by another client', async () => {
      const clientId = 'uuid-update-conflict';
      const updateClientDto: UpdateClientDto = { email: 'conflict@example.com' };
      const conflictingClient: Partial<Client> = { id: 'uuid-other', email: 'conflict@example.com' };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      repository.findOne.mockResolvedValue(conflictingClient);

      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(
        `Email ${updateClientDto.email} is already in use.`
      );
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: updateClientDto.email } });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Cannot update client ${clientId}. Email ${updateClientDto.email} is already in use by client ${conflictingClient.id}.`
      );
      expect(repository.preload).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should throw NotFoundException if client to update is not found (preload returns null)', async () => {
      const clientId = 'non-existent-update';
      const updateClientDto: UpdateClientDto = { name: 'No Client' };

      repository.preload.mockResolvedValue(null);

      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(repository.findOne).not.toHaveBeenCalled(); // Email not in DTO
      expect(repository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- REMOVE Tests --- //
  describe('remove', () => {
    it('should remove the client successfully', async () => {
      const clientId = 'uuid-remove';
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(clientId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(clientId);
    });

    it('should throw NotFoundException if client to remove is not found', async () => {
      const clientId = 'non-existent-remove';
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(clientId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(clientId)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(repository.delete).toHaveBeenCalledWith(clientId);
    });
  });
}); 