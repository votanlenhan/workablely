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

// Simplified mock setup
const mockClientRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockQueryBuilder = {
  orderBy: jest.fn().mockReturnThis(),
  // Add other methods if needed and ensure they return `mockReturnThis()`
  // getMany: jest.fn(), // Example for pagination
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    // Reset repository mocks before each test
    Object.values(mockClientRepository).forEach(mockFn => mockFn.mockClear());
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());
    mockClientRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    // Reset and setup default mock for paginate here
    mockPaginate.mockClear();
    mockPaginate.mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    }); 

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
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

      mockClientRepository.findOne.mockResolvedValue(null);
      mockClientRepository.create.mockReturnValue(expectedClient);
      mockClientRepository.save.mockResolvedValue(expectedClient);

      const result = await service.create(createClientDto);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { email: createClientDto.email } });
      expect(mockClientRepository.create).toHaveBeenCalledWith(createClientDto);
      expect(mockClientRepository.save).toHaveBeenCalledWith(expectedClient);
      expect(result).toEqual(expectedClient);
    });

    it('should create a client when email is not provided', async () => {
        const createClientDto: CreateClientDto = { name: 'No Email Client', phone_number: '456' };
        const expectedClient: Client = {
            id: 'uuid-2', name: 'No Email Client', phone_number: '456', email: null,
            address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(),
            shows: [],
        };

        mockClientRepository.create.mockReturnValue(expectedClient);
        mockClientRepository.save.mockResolvedValue(expectedClient);

        const result = await service.create(createClientDto);

        expect(mockClientRepository.findOne).not.toHaveBeenCalled();
        expect(mockClientRepository.create).toHaveBeenCalledWith(createClientDto);
        expect(mockClientRepository.save).toHaveBeenCalledWith(expectedClient);
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

      mockClientRepository.findOne.mockResolvedValue(existingClient);
      mockClientRepository.create.mockReturnValue(expectedNewClient);
      mockClientRepository.save.mockResolvedValue(expectedNewClient);

      await service.create(createClientDto);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { email: createClientDto.email } });
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Client with email ${createClientDto.email} already exists.`);
      expect(mockClientRepository.create).toHaveBeenCalledWith(createClientDto);
      expect(mockClientRepository.save).toHaveBeenCalledWith(expectedNewClient);
      consoleWarnSpy.mockRestore(); // Restore console.warn
    });
  });

  // --- FINDALL Tests --- //
  describe('findAll', () => {
    it('should return a paginated list of clients', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/clients' };
      const client1: Partial<Client> = { id: 'uuid-1', name: 'Client 1', shows:[] };
      const paginatedResult = {
        items: [client1],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        links: { first: '/clients?limit=10', previous: '', next: '', last: '/clients?page=1&limit=10' }
      };
      
      mockPaginate.mockResolvedValue(paginatedResult as any);

      const result = await service.findAll(options);

      expect(mockClientRepository.createQueryBuilder).toHaveBeenCalled();
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

      mockClientRepository.findOne.mockResolvedValue(expectedClient as Client);

      const result = await service.findOne(clientId);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
      expect(result).toEqual(expectedClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      const clientId = 'not-found-uuid';
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(clientId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(clientId)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
    });
  });

  // --- UPDATE Tests --- //
  describe('update', () => {
    it('should update client name and return the client', async () => {
      const clientId = 'uuid-update';
      const updateClientDto: UpdateClientDto = { name: 'Updated Name' };
      const existingClient: Client = { id: clientId, name: 'Original', phone_number:'1', email: null, address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(), shows: [] };
      const preloadedClient: Client = { ...existingClient, ...updateClientDto, updated_at: new Date() };

      mockClientRepository.preload.mockResolvedValue(preloadedClient);
      mockClientRepository.save.mockResolvedValue(preloadedClient);

      const result = await service.update(clientId, updateClientDto);

      expect(mockClientRepository.findOne).not.toHaveBeenCalled(); // Email not in DTO
      expect(mockClientRepository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
      expect(mockClientRepository.save).toHaveBeenCalledWith(preloadedClient);
      expect(result).toEqual(preloadedClient);
    });

     it('should update client email if new email is not conflicting', async () => {
        const clientId = 'uuid-update-email';
        const updateClientDto: UpdateClientDto = { email: 'new@example.com' };
        const existingClient: Client = { id: clientId, name:'Update Email', phone_number:'2', email:'old@example.com', address: null, source: null, notes: null, created_at: new Date(), updated_at: new Date(), shows: [] };
        const preloadedClient: Client = { ...existingClient, ...updateClientDto, updated_at: new Date() };

        mockClientRepository.findOne.mockResolvedValue(null); // No conflict found
        mockClientRepository.preload.mockResolvedValue(preloadedClient);
        mockClientRepository.save.mockResolvedValue(preloadedClient);

        const result = await service.update(clientId, updateClientDto);

        expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { email: updateClientDto.email } });
        expect(mockClientRepository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
        expect(mockClientRepository.save).toHaveBeenCalledWith(preloadedClient);
        expect(result).toEqual(preloadedClient);
    });

    it('should throw error if updating to an existing email used by another client', async () => {
      const clientId = 'uuid-update-conflict';
      const updateClientDto: UpdateClientDto = { email: 'conflict@example.com' };
      const conflictingClient: Partial<Client> = { id: 'uuid-other', email: 'conflict@example.com' };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockClientRepository.findOne.mockResolvedValue(conflictingClient);

      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(
        `Email ${updateClientDto.email} is already in use.`
      );
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({ where: { email: updateClientDto.email } });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Cannot update client ${clientId}. Email ${updateClientDto.email} is already in use by client ${conflictingClient.id}.`
      );
      expect(mockClientRepository.preload).not.toHaveBeenCalled();
      expect(mockClientRepository.save).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should throw NotFoundException if client to update is not found (preload returns null)', async () => {
      const clientId = 'non-existent-update';
      const updateClientDto: UpdateClientDto = { name: 'No Client' };

      mockClientRepository.preload.mockResolvedValue(null);

      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(clientId, updateClientDto)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(mockClientRepository.findOne).not.toHaveBeenCalled(); // Email not in DTO
      expect(mockClientRepository.preload).toHaveBeenCalledWith({ id: clientId, ...updateClientDto });
      expect(mockClientRepository.save).not.toHaveBeenCalled();
    });
  });

  // --- REMOVE Tests --- //
  describe('remove', () => {
    it('should remove the client successfully', async () => {
      const clientId = 'uuid-remove';
      mockClientRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(clientId)).resolves.toBeUndefined();
      expect(mockClientRepository.delete).toHaveBeenCalledWith(clientId);
    });

    it('should throw NotFoundException if client to remove is not found', async () => {
      const clientId = 'non-existent-remove';
      mockClientRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(clientId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(clientId)).rejects.toThrow(`Client with ID "${clientId}" not found`);
      expect(mockClientRepository.delete).toHaveBeenCalledWith(clientId);
    });
  });
}); 