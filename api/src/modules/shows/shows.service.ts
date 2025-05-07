import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Show, ShowStatus, ShowPaymentStatus } from './entities/show.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
// Use alias path for ClientsService
import { ClientsService } from '@/modules/clients/clients.service';
// import { UsersService } from '@/modules/users/users.service'; // Keep commented for now
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Client } from '@/modules/clients/entities/client.entity';
import { RevenueAllocationsService } from '../revenue-allocations/revenue-allocations.service';

@Injectable()
export class ShowsService {
  private readonly logger = new Logger(ShowsService.name);

  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,

    // Inject ClientsService to validate client_id
    @Inject(forwardRef(() => ClientsService))
    private readonly clientsService: ClientsService,

    // Inject UsersService later to get creator user ID
    // @Inject(forwardRef(() => UsersService))
    // private readonly usersService: UsersService,

    @Inject(forwardRef(() => RevenueAllocationsService))
    private readonly revenueAllocationsService: RevenueAllocationsService,
  ) {}

  /**
   * Calculates amount_due based on total_price and total_collected.
   */
  private calculateAmountDue(totalPrice: number, totalCollected: number): number {
    return Math.max(0, totalPrice - totalCollected);
  }

  /**
   * Determines payment_status based on total_price and total_collected.
   */
  private determinePaymentStatus(
    totalPrice: number,
    totalCollected: number,
  ): ShowPaymentStatus {
    if (totalCollected <= 0) {
      return ShowPaymentStatus.UNPAID;
    } else if (totalCollected < totalPrice) {
      return ShowPaymentStatus.PARTIALLY_PAID;
    } else {
      return ShowPaymentStatus.PAID;
    }
  }

  async create(
      createShowDto: CreateShowDto,
      creatorUserId: string | null
    ): Promise<Show> {
    await this.clientsService.findOne(createShowDto.clientId);
    const showEntityData = {
        ...createShowDto,
        created_by_user_id: creatorUserId === null ? undefined : creatorUserId,
        total_collected: createShowDto.deposit_amount ?? 0,
        status: ShowStatus.PENDING,
        start_datetime: new Date(createShowDto.start_datetime),
        end_datetime: createShowDto.end_datetime ? new Date(createShowDto.end_datetime) : null,
        deposit_date: createShowDto.deposit_date ? new Date(createShowDto.deposit_date) : null,
        post_processing_deadline: createShowDto.post_processing_deadline ? new Date(createShowDto.post_processing_deadline) : null,
    };
    const show = this.showRepository.create(showEntityData);
    show.deposit_amount = createShowDto.deposit_amount ?? null;
    show.amount_due = this.calculateAmountDue(show.total_price, show.total_collected);
    show.payment_status = this.determinePaymentStatus(show.total_price, show.total_collected);
    this.logger.log(`Creating new show with title: ${show.title || 'Untitled'}`);
    return this.showRepository.save(show);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Show>> {
    const queryBuilder = this.showRepository.createQueryBuilder('show');
    queryBuilder
      .leftJoinAndSelect('show.client', 'client')
      .leftJoinAndSelect('show.createdBy', 'createdByUser')
      .leftJoinAndSelect('show.assignments', 'assignments')
      .leftJoinAndSelect('show.payments', 'payments')
      .orderBy('show.start_datetime', 'DESC');
    this.logger.log(`Finding all shows with options: ${JSON.stringify(options)}`);
    return paginate<Show>(queryBuilder, options);
  }

  async findOne(id: string): Promise<Show> {
    this.logger.log(`Finding show with ID: ${id}`);
    const show = await this.showRepository.findOne({
      where: { id },
      relations: ['client', 'createdBy', 'assignments', 'payments'],
    });
    if (!show) {
      this.logger.warn(`Show with ID "${id}" not found`);
      throw new NotFoundException(`Show with ID "${id}" not found`);
    }
    return show;
  }

  async update(id: string, updateShowDto: UpdateShowDto): Promise<Show> {
    this.logger.log(`Updating show with ID: ${id}`);
    const existingShow = await this.findOne(id);
    if (updateShowDto.clientId && updateShowDto.clientId !== existingShow.clientId) {
        await this.clientsService.findOne(updateShowDto.clientId);
    }

    const showToUpdate = await this.showRepository.preload({
        id: id,
        ...updateShowDto,
        start_datetime: updateShowDto.start_datetime ? new Date(updateShowDto.start_datetime) : undefined,
        end_datetime: updateShowDto.end_datetime ? new Date(updateShowDto.end_datetime) : undefined,
        deposit_date: updateShowDto.deposit_date ? new Date(updateShowDto.deposit_date) : undefined,
        post_processing_deadline: updateShowDto.post_processing_deadline ? new Date(updateShowDto.post_processing_deadline) : undefined,
        delivered_at: updateShowDto.delivered_at ? new Date(updateShowDto.delivered_at) : undefined,
        completed_at: updateShowDto.completed_at ? new Date(updateShowDto.completed_at) : undefined,
        cancelled_at: updateShowDto.cancelled_at ? new Date(updateShowDto.cancelled_at) : undefined,
    });

    if (!showToUpdate) {
      this.logger.warn(`Show with ID "${id}" could not be preloaded for update`);
      throw new NotFoundException(`Show with ID "${id}" could not be preloaded for update`);
    }

    const totalPrice = showToUpdate.total_price ?? existingShow.total_price;
    const totalCollected = existingShow.total_collected; 

    showToUpdate.amount_due = this.calculateAmountDue(totalPrice, totalCollected);
    showToUpdate.payment_status = this.determinePaymentStatus(totalPrice, totalCollected);

    if (updateShowDto.status === ShowStatus.CANCELLED && !showToUpdate.cancelled_at) {
        showToUpdate.cancelled_at = new Date();
    } else if (updateShowDto.status === ShowStatus.DELIVERED && !showToUpdate.delivered_at) {
        showToUpdate.delivered_at = new Date();
    } else if (updateShowDto.status === ShowStatus.COMPLETED && !showToUpdate.completed_at) {
        showToUpdate.completed_at = new Date();
    }

    const savedShow = await this.showRepository.save(showToUpdate);

    if (savedShow.status === ShowStatus.DELIVERED || savedShow.status === ShowStatus.COMPLETED) {
      this.logger.log(`Show ${savedShow.id} status is ${savedShow.status}, triggering revenue allocation.`);
      try {
        await this.revenueAllocationsService.calculateAndSaveAllocationsForShow(savedShow.id);
        this.logger.log(`Revenue allocation successfully triggered for show ${savedShow.id}.`);
      } catch (error) {
        this.logger.error(`Failed to calculate or save revenue allocations for show ${savedShow.id}: ${error.message}`, error.stack);
      }
    }
    return savedShow;
  }

  /**
   * Updates the financial fields of a show (total_collected, amount_due, payment_status)
   * based on its current payments. This method should be called within a transaction
   * when payments are created, updated, or deleted.
   * @param showId The ID of the show to update.
   * @param queryRunner The QueryRunner to use for the database operations.
   */
  async updateShowFinancesAfterPayment(showId: string, queryRunner?: QueryRunner | null): Promise<Show> {
    this.logger.log(`Updating finances for show ID: ${showId}`);
    const showRepo = queryRunner
      ? queryRunner.manager.getRepository(Show)
      : this.showRepository;
    
    const show = await showRepo.findOne({
        where: { id: showId },
        relations: ['payments'],
    });

    if (!show) {
      this.logger.error(`Show with ID "${showId}" not found during finance update.`);
      throw new NotFoundException(`Show with ID "${showId}" not found.`);
    }

    show.total_collected = show.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    show.amount_due = this.calculateAmountDue(show.total_price, show.total_collected);
    show.payment_status = this.determinePaymentStatus(show.total_price, show.total_collected);
    
    const depositPayment = show.payments.find(p => p.is_deposit);
    if (depositPayment) {
        show.deposit_amount = Number(depositPayment.amount);
        show.deposit_date = depositPayment.payment_date;
    } else if (show.payments.length > 0 && !show.deposit_amount) {
        // This logic might need refinement based on business rules for deposits
        // For now, if no explicit deposit, ensure deposit_amount reflects that, or is null if no payments
        // show.deposit_amount = show.payments.length > 0 ? Number(show.payments[0].amount) : null; // Example: first payment as deposit
        // show.deposit_date = show.payments.length > 0 ? show.payments[0].payment_date : null;
    }
    if (show.payments.length === 0) {
        show.deposit_amount = null;
        show.deposit_date = null;
    }

    this.logger.log(`Recalculated finances for show ${showId}: collected=${show.total_collected}, due=${show.amount_due}, status=${show.payment_status}`);
    return showRepo.save(show);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing show with ID: ${id}`);
    const result = await this.showRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Show with ID "${id}" not found for deletion`);
      throw new NotFoundException(`Show with ID "${id}" not found`);
    }
  }
} 