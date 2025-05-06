import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,

    // Inject ClientsService to validate client_id
    @Inject(forwardRef(() => ClientsService))
    private readonly clientsService: ClientsService,

    // Inject UsersService later to get creator user ID
    // @Inject(forwardRef(() => UsersService))
    // private readonly usersService: UsersService,
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
      creatorUserId: string | null // Pass creatorUserId explicitly for now
    ): Promise<Show> {
    // Validate client_id exists
    await this.clientsService.findOne(createShowDto.clientId);

    const show = this.showRepository.create({
        ...createShowDto,
        createdByUserId: creatorUserId,
        total_collected: createShowDto.deposit_amount ?? 0, // Initial collection is the deposit
        status: ShowStatus.PENDING, // Default status
    });

    // Calculate initial amount_due and payment_status
    show.amount_due = this.calculateAmountDue(show.total_price, show.total_collected);
    show.payment_status = this.determinePaymentStatus(show.total_price, show.total_collected);

    return this.showRepository.save(show);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Show>> {
    const queryBuilder = this.showRepository.createQueryBuilder('show');
    queryBuilder
      .leftJoinAndSelect('show.client', 'client') // Include client info
      .leftJoinAndSelect('show.created_by_user', 'creator') // Include creator info
      .orderBy('show.start_datetime', 'DESC'); // Default order by start time

    // Add filtering/searching capabilities later based on query params

    return paginate<Show>(queryBuilder, options);
  }

  async findOne(id: string): Promise<Show> {
    const show = await this.showRepository.findOne({
      where: { id },
      relations: ['client', 'created_by_user'], // Load relations
    });
    if (!show) {
      throw new NotFoundException(`Show with ID "${id}" not found`);
    }
    return show;
  }

  async update(id: string, updateShowDto: UpdateShowDto): Promise<Show> {
    // Fetch existing show first to recalculate dependent fields if needed
    const existingShow = await this.findOne(id); // Use findOne to ensure it exists

    // Check if client needs to be updated
    let clientRelation: Client | undefined = undefined;
    if (updateShowDto.clientId && updateShowDto.clientId !== existingShow.clientId) {
        // Validate new client exists
        clientRelation = await this.clientsService.findOne(updateShowDto.clientId);
        // The preload step below will handle setting the new clientId
    }

    // Use preload to merge data - careful not to overwrite calculated fields unintentionally
    const showToUpdate = await this.showRepository.preload({
        id: id,
        ...updateShowDto,
    });

    if (!showToUpdate) {
      // This should ideally not happen if findOne succeeded, but safety check
      throw new NotFoundException(`Show with ID "${id}" could not be preloaded for update`);
    }

    // Recalculate dependent fields if relevant inputs changed
    // Note: total_collected should ideally be updated via a separate payment recording mechanism
    const totalPrice = showToUpdate.total_price ?? existingShow.total_price;
    const totalCollected = showToUpdate.total_collected ?? existingShow.total_collected;

    showToUpdate.amount_due = this.calculateAmountDue(totalPrice, totalCollected);
    showToUpdate.payment_status = this.determinePaymentStatus(totalPrice, totalCollected);

    // Ensure status-related date fields are handled logically
    if (updateShowDto.status === ShowStatus.CANCELLED && !showToUpdate.cancelled_at) {
        showToUpdate.cancelled_at = new Date();
    } else if (updateShowDto.status === ShowStatus.DELIVERED && !showToUpdate.delivered_at) {
        showToUpdate.delivered_at = new Date();
    } else if (updateShowDto.status === ShowStatus.COMPLETED && !showToUpdate.completed_at) {
        showToUpdate.completed_at = new Date();
    }
    // Add more logic here if status transitions should reset certain dates

    return this.showRepository.save(showToUpdate);
  }

  // Add method to update total_collected when a payment is recorded later
  async recordPayment(showId: string, paymentAmount: number): Promise<Show> {
      const show = await this.findOne(showId);
      show.total_collected += paymentAmount;
      show.amount_due = this.calculateAmountDue(show.total_price, show.total_collected);
      show.payment_status = this.determinePaymentStatus(show.total_price, show.total_collected);
      // Potentially update Show status if payment completes the total
      if (show.payment_status === ShowPaymentStatus.PAID && show.status !== ShowStatus.COMPLETED && show.status !== ShowStatus.CANCELLED) {
          // Optionally transition to completed or another status if fully paid
          // show.status = ShowStatus.COMPLETED; // Example
      }
      return this.showRepository.save(show);
  }

  async remove(id: string): Promise<void> {
    const result = await this.showRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Show with ID "${id}" not found`);
    }
  }
} 