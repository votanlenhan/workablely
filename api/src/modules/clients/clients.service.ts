import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, currentUserId?: string): Promise<Client> {
    // Log the user ID for debugging purposes
    if (currentUserId) {
      console.log(`[ClientsService] Create method called by user ID: ${currentUserId}`);
    } else {
      console.warn('[ClientsService] Create method called without currentUserId.');
    }

    // Check if email exists if provided
    if (createClientDto.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: createClientDto.email },
      });
      if (existingClient) {
        throw new ConflictException(
          `Client with email ${createClientDto.email} already exists.`,
        );
      }
    }
    const newClient = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(newClient);
  }

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<Client>> {
    const queryBuilder = this.clientRepository.createQueryBuilder('client');
    queryBuilder.orderBy('client.created_at', 'DESC'); // Default sort order
    return paginate<Client>(queryBuilder, options);
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    // Check if email is being updated and if it conflicts
    if (updateClientDto.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });
      if (existingClient && existingClient.id !== id) {
        // Consider throwing a BadRequestException
        console.warn(
          `Cannot update client ${id}. Email ${updateClientDto.email} is already in use by client ${existingClient.id}.`,
        );
        // Optionally, remove email from DTO to prevent update
        // delete updateClientDto.email;
        throw new Error(`Email ${updateClientDto.email} is already in use.`); // Or handle differently
      }
    }

    // Use preload to get entity merged with update DTO, handles partial updates
    const client = await this.clientRepository.preload({
      id: id,
      ...updateClientDto,
    });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
  }
}
