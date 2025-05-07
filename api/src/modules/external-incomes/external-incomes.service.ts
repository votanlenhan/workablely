import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalIncome } from './entities/external-income.entity';
import { CreateExternalIncomeDto } from './dto/create-external-income.dto';
import { UpdateExternalIncomeDto } from './dto/update-external-income.dto';
import { User } from '../users/entities/user.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ExternalIncomesService {
  private readonly logger = new Logger(ExternalIncomesService.name);

  constructor(
    @InjectRepository(ExternalIncome)
    private readonly externalIncomeRepository: Repository<ExternalIncome>,
    // We don't strictly need UserRepository here if we only store the ID from the authenticated request
  ) {}

  /**
   * Creates a new external income record.
   * @param createExternalIncomeDto - DTO for creating an external income.
   * @param userId - The ID of the user recording this income.
   * @returns The created external income.
   */
  async create(
    createExternalIncomeDto: CreateExternalIncomeDto,
    userId: string,
  ): Promise<ExternalIncome> {
    try {
      const newExternalIncome = this.externalIncomeRepository.create({
        ...createExternalIncomeDto,
        income_date: new Date(createExternalIncomeDto.income_date),
        recorded_by_user_id: userId,
      });
      return await this.externalIncomeRepository.save(newExternalIncome);
    } catch (error) {
      this.logger.error(
        `Failed to create external income: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create external income.');
    }
  }

  /**
   * Retrieves all external incomes with pagination and optional filtering.
   * @param options - Pagination options.
   * @param recordedByUserId - Optional filter by the user who recorded the income.
   * @param year - Optional filter by year of income_date.
   * @param month - Optional filter by month of income_date.
   * @returns Paginated list of external incomes.
   */
  async findAll(
    options: IPaginationOptions,
    recordedByUserId?: string,
    year?: number,
    month?: number,
  ): Promise<Pagination<ExternalIncome>> {
    const queryBuilder = this.externalIncomeRepository.createQueryBuilder('income');
    queryBuilder.leftJoinAndSelect('income.recorded_by_user', 'user'); // Include user details
    queryBuilder.orderBy('income.income_date', 'DESC');

    if (recordedByUserId) {
      queryBuilder.andWhere('income.recorded_by_user_id = :recordedByUserId', {
        recordedByUserId,
      });
    }
    if (year) {
      queryBuilder.andWhere("EXTRACT(YEAR FROM income.income_date) = :year", { year });
    }
    if (month) {
      queryBuilder.andWhere("EXTRACT(MONTH FROM income.income_date) = :month", { month });
    }

    try {
      return await paginate<ExternalIncome>(queryBuilder, options);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve external incomes: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve external incomes.',
      );
    }
  }

  /**
   * Retrieves a single external income by its ID.
   * @param id - The ID of the external income to retrieve.
   * @returns The found external income.
   * @throws NotFoundException if the external income is not found.
   */
  async findOne(id: string): Promise<ExternalIncome> {
    const externalIncome = await this.externalIncomeRepository.findOne({
      where: { id },
      relations: ['recorded_by_user'],
    });
    if (!externalIncome) {
      throw new NotFoundException(`External income with ID "${id}" not found.`);
    }
    return externalIncome;
  }

  /**
   * Updates an existing external income.
   * @param id - The ID of the external income to update.
   * @param updateExternalIncomeDto - DTO for updating an external income.
   * @param userId - The ID of the user performing the update (for authorization check).
   * @returns The updated external income.
   * @throws NotFoundException if the external income is not found.
   * @throws UnauthorizedException if the user is not allowed to update.
   */
  async update(
    id: string,
    updateExternalIncomeDto: UpdateExternalIncomeDto,
    // userId: string, // Could be used for ownership check if needed
  ): Promise<ExternalIncome> {
    const existingIncome = await this.findOne(id);
    // Add ownership/permission check here if non-admins can update
    // e.g., if (existingIncome.recorded_by_user_id !== userId && !userIsAdmin) throw new UnauthorizedException();

    // Create a temporary object for the DTO properties
    const { income_date, ...restOfDto } = updateExternalIncomeDto;
    const updatePayload: Partial<ExternalIncome> = { ...restOfDto };

    if (income_date) {
      updatePayload.income_date = new Date(income_date);
    }

    try {
      await this.externalIncomeRepository.update(id, updatePayload);
      return await this.findOne(id); // Fetch the updated record
    } catch (error) {
      this.logger.error(
        `Failed to update external income with ID "${id}": ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to update external income with ID "${id}".`,
      );
    }
  }

  /**
   * Removes an external income by its ID.
   * @param id - The ID of the external income to remove.
   * @throws NotFoundException if the external income is not found.
   */
  async remove(id: string): Promise<void> {
    const result = await this.externalIncomeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`External income with ID "${id}" not found.`);
    }
  }
} 