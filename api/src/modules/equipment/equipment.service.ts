import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, QueryFailedError } from 'typeorm';
import { Equipment, EquipmentStatus } from '@/modules/equipment/entities/equipment.entity';
import { CreateEquipmentDto } from '@/modules/equipment/dto/create-equipment.dto';
import { UpdateEquipmentDto } from '@/modules/equipment/dto/update-equipment.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    this.logger.log(`Creating new equipment with name: ${createEquipmentDto.name}`);
    const newEquipment = this.equipmentRepository.create({
        ...createEquipmentDto,
        purchase_date: createEquipmentDto.purchase_date ? new Date(createEquipmentDto.purchase_date) : undefined,
    });
    try {
      return await this.equipmentRepository.save(newEquipment);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') { // Unique constraint violation
        this.logger.error(`Failed to create equipment. Serial number '${createEquipmentDto.serial_number}' likely already exists.`, error.stack);
        throw new ConflictException(`Equipment with serial number '${createEquipmentDto.serial_number}' already exists.`);
      }
      this.logger.error(`Failed to create equipment: ${error.message}`, error.stack);
      throw error; // Re-throw other errors
    }
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Equipment>> {
    this.logger.log('Fetching all equipment with pagination');
    return paginate<Equipment>(this.equipmentRepository, options, {
        relations: [], // Add relations like 'assignments' if needed for list view
        order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string, findOptions?: FindOneOptions<Equipment>): Promise<Equipment> {
    this.logger.log(`Fetching equipment with id: ${id}`);
    const equipment = await this.equipmentRepository.findOne({ where: { id }, ...findOptions });
    if (!equipment) {
      this.logger.warn(`Equipment with id ${id} not found`);
      throw new NotFoundException(`Equipment with id ${id} not found`);
    }
    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment> {
    this.logger.log(`Updating equipment with id: ${id}`);
    const equipment = await this.findOne(id); // Checks if equipment exists

    const updatePayload = {
        ...updateEquipmentDto,
        ...(updateEquipmentDto.purchase_date && { purchase_date: new Date(updateEquipmentDto.purchase_date) }),
    };

    Object.assign(equipment, updatePayload);

    try {
        return await this.equipmentRepository.save(equipment);
    } catch (error) {
        if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
            this.logger.error(`Failed to update equipment. Serial number '${updateEquipmentDto.serial_number}' likely already exists.`, error.stack);
            throw new ConflictException(`Equipment with serial number '${updateEquipmentDto.serial_number}' already exists.`);
        }
        this.logger.error(`Failed to update equipment: ${error.message}`, error.stack);
        throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing equipment with id: ${id}`);
    const equipment = await this.findOne(id); // Ensure equipment exists
    // Note: If equipment has active assignments, you might want to prevent deletion or handle it.
    // This will be handled by onDelete: 'CASCADE' or similar on the relation in EquipmentAssignment or via service logic.
    // For now, we assume soft-delete is handled by BaseEntity or TypeORM settings if configured.
    // If hard delete is needed, use this.equipmentRepository.remove(equipment);
    // If soft delete is explicitly managed here:
    // equipment.status = EquipmentStatus.RETIRED; // Or some other status indicating deletion
    // await this.equipmentRepository.save(equipment);
    // For now, using TypeORM's remove which respects soft-delete if enabled on entity/repo.
    await this.equipmentRepository.remove(equipment); 
  }
} 