import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/entities/user.entity'; // Assuming path
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(User) // To fetch user details if needed for recorded_by_user
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    recordedByUserId: string,
  ): Promise<Expense> {
    this.logger.log(
      `Creating new expense: ${createExpenseDto.description} by user ${recordedByUserId}`,
    );
    try {
      const recordedByUser = await this.userRepository.findOneBy({ id: recordedByUserId });
      if (!recordedByUser) {
        // This case should ideally not happen if JwtAuthGuard is working correctly
        this.logger.warn(`User not found for ID: ${recordedByUserId} during expense creation.`);
        // Depending on strictness, you might throw BadRequestException or proceed without linking user
      }

      const expense = this.expenseRepository.create({
        ...createExpenseDto,
        expense_date: new Date(createExpenseDto.expense_date), // Convert string to Date
        recorded_by_user_id: recordedByUserId,
        // recorded_by_user: recordedByUser, // Optional: if you want to embed the user object
      });
      return await this.expenseRepository.save(expense);
    } catch (error) {
      this.logger.error(
        `Failed to create expense: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create expense.');
    }
  }

  async findAll(
    options: IPaginationOptions,
    filters: {
      recorded_by_user_id?: string;
      category?: string;
      is_wishlist_expense?: boolean;
      month?: number; // YYYY-MM, e.g., 2024-07
      year?: number;
    } = {},
  ): Promise<Pagination<Expense>> {
    this.logger.log('Fetching all expenses with pagination');
    const queryBuilder = this.expenseRepository.createQueryBuilder('expense');

    queryBuilder.leftJoinAndSelect('expense.recorded_by_user', 'recorded_by_user');
    queryBuilder.select([
        'expense.id',
        'expense.description',
        'expense.amount',
        'expense.expense_date',
        'expense.category',
        'expense.is_wishlist_expense',
        'expense.payment_method',
        'expense.vendor',
        'expense.receipt_url',
        'expense.notes',
        'expense.created_at',
        'expense.updated_at',
        'expense.recorded_by_user_id',
        'recorded_by_user.id',
        'recorded_by_user.first_name',
        'recorded_by_user.last_name',
        'recorded_by_user.email',
    ]);

    if (filters.recorded_by_user_id) {
      queryBuilder.andWhere('expense.recorded_by_user_id = :userId', {
        userId: filters.recorded_by_user_id,
      });
    }
    if (filters.category) {
      queryBuilder.andWhere('expense.category = :category', {
        category: filters.category,
      });
    }
    if (filters.is_wishlist_expense !== undefined) {
      queryBuilder.andWhere('expense.is_wishlist_expense = :isWishlist', {
        isWishlist: filters.is_wishlist_expense,
      });
    }
     if (filters.year && filters.month) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM expense.expense_date) = :year', { year: filters.year })
                  .andWhere('EXTRACT(MONTH FROM expense.expense_date) = :month', { month: filters.month });
    } else if (filters.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM expense.expense_date) = :year', { year: filters.year });
    }


    queryBuilder.orderBy('expense.expense_date', 'DESC');

    return paginate<Expense>(queryBuilder, options);
  }

  async findOne(id: string): Promise<Expense> {
    this.logger.log(`Fetching expense with id: ${id}`);
    const expense = await this.expenseRepository.findOne({
        where: { id },
        relations: ['recorded_by_user'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found.`);
    }
    return expense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    // updatedByUserId: string, // If you need to track who updated
  ): Promise<Expense> {
    this.logger.log(`Updating expense with id: ${id}`);
    const expense = await this.findOne(id); // Ensures it exists

    const updatePayload = { ...updateExpenseDto };
    if (updateExpenseDto.expense_date) {
      updatePayload.expense_date = new Date(updateExpenseDto.expense_date) as any; // Convert to Date
    }

    // We don't typically update recorded_by_user_id on edit, but if needed, handle here.

    this.expenseRepository.merge(expense, updatePayload);
    try {
      return await this.expenseRepository.save(expense);
    } catch (error) {
      this.logger.error(
        `Failed to update expense ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not update expense.');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing expense with id: ${id}`);
    const expense = await this.findOne(id); // Check if exists
    const result = await this.expenseRepository.delete(expense.id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Expense with ID "${id}" could not be deleted.`,
      );
    }
  }
} 