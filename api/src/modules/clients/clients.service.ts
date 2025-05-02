import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async createClient(createClientDto: CreateClientDto): Promise<Client> {
    // Check if email exists if provided
    if (createClientDto.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: createClientDto.email },
      });
      if (existingClient) {
        // Consider throwing a BadRequestException instead if this is a hard rule
        console.warn(
          `Client with email ${createClientDto.email} already exists.`,
        );
      }
    }
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAllClients(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async findClientById(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return client;
  }

  async updateClient(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<Client> {
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

    const client = await this.clientRepository.preload({
      id: id,
      ...updateClientDto,
    });
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return this.clientRepository.save(client);
  }

  async removeClient(id: string): Promise<void> {
    const client = await this.findClientById(id); // Reuse findById to handle not found exception
    await this.clientRepository.remove(client);
  }
}
