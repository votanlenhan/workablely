import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ShowsService } from '@/modules/shows/shows.service';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new payment and updates the related show's financial details.
   */
  async create(createPaymentDto: CreatePaymentDto, creatorUserId?: string): Promise<Payment> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let savedPaymentId: string | undefined;

    try {
      const paymentEntity = this.paymentRepository.create({
        ...createPaymentDto,
        payment_date: createPaymentDto.payment_date ? new Date(createPaymentDto.payment_date) : new Date(),
        recorded_by_user_id: creatorUserId || createPaymentDto.recorded_by_user_id,
      });
      const savedPayment = await queryRunner.manager.save(Payment, paymentEntity);
      savedPaymentId = savedPayment.id;

      await this.showsService.updateShowFinancesAfterPayment(savedPayment.show_id, queryRunner);
      
      await queryRunner.commitTransaction();
      this.logger.log(`Transaction committed for payment creation: ${savedPaymentId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transaction rolled back for payment creation. Show ID: ${createPaymentDto.show_id}, Error: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not create payment due to a transaction error.');
    } finally {
      await queryRunner.release();
      this.logger.log('QueryRunner released after payment creation attempt.');
    }

    if (!savedPaymentId) {
      // This should ideally not be reached if errors are handled correctly above, but as a safeguard:
      this.logger.error('savedPaymentId is undefined after transaction, cannot fetch payment.');
      throw new InternalServerErrorException('Failed to obtain payment ID after transaction.');
    }

    // Re-fetch the payment using a new query, outside of the completed transaction
    try {
      const newPayment = await this.findOne(savedPaymentId);
      this.logger.log(`Payment with id ${newPayment.id} created successfully for show ${newPayment.show_id}.`);
      return newPayment;
    } catch (fetchError) {
      this.logger.error(`Successfully created payment ID ${savedPaymentId}, but failed to re-fetch it: ${fetchError.message}`, fetchError.stack);
      // Depending on requirements, you might still want to throw, or return a partial DTO if possible,
      // or indicate success but with a warning that the full entity couldn't be returned.
      // For now, re-throwing to indicate something is wrong with findOne or data consistency.
      throw new InternalServerErrorException(`Payment created (ID: ${savedPaymentId}) but failed to retrieve details.`);
    }
  }

  /**
   * Finds all payments with pagination.
   */
  async findAll(options: IPaginationOptions): Promise<Pagination<Payment>> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');
    queryBuilder
      .leftJoinAndSelect('payment.show', 'show')
      .leftJoinAndSelect('payment.recorded_by_user', 'recordedBy')
      .orderBy('payment.payment_date', 'DESC');
    
    this.logger.log(`Fetching all payments with options: ${JSON.stringify(options)}`);
    return paginate<Payment>(queryBuilder, options);
  }

  /**
   * Finds a single payment by its ID.
   */
  async findOne(id: string, queryRunner?: QueryRunner): Promise<Payment> {
    const repository = queryRunner ? queryRunner.manager.getRepository(Payment) : this.paymentRepository;
    const payment = await repository.findOne({
      where: { id },
      relations: ['show', 'recorded_by_user'],
    });
    if (!payment) {
      this.logger.warn(`Payment with ID "${id}" not found.`);
      throw new NotFoundException(`Payment with ID "${id}" not found.`);
    }
    return payment;
  }

  /**
   * Updates an existing payment and recalculates show finances.
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto, updaterUserId?: string): Promise<Payment> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let updatedPaymentId: string | undefined;

    try {
      const existingPayment = await this.findOne(id, queryRunner); 
      updatedPaymentId = existingPayment.id; // Store id before commit

      const paymentToUpdate = {
        ...existingPayment, 
        ...updatePaymentDto,
        payment_date: updatePaymentDto.payment_date ? new Date(updatePaymentDto.payment_date) : existingPayment.payment_date,
      };
      
      if (updatePaymentDto.show_id && updatePaymentDto.show_id !== existingPayment.show_id) {
        this.logger.warn('Changing show_id during payment update is not directly supported and requires recalculating finances for two shows.');
      }

      await queryRunner.manager.save(Payment, paymentToUpdate);
            
      await this.showsService.updateShowFinancesAfterPayment(existingPayment.show_id, queryRunner);
      if (updatePaymentDto.show_id && updatePaymentDto.show_id !== existingPayment.show_id) {
         await this.showsService.updateShowFinancesAfterPayment(updatePaymentDto.show_id, queryRunner);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Transaction committed for payment update: ${updatedPaymentId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transaction rolled back for payment update. Payment ID: ${id}, Error: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not update payment due to a transaction error.');
    } finally {
      await queryRunner.release();
      this.logger.log('QueryRunner released after payment update attempt.');
    }

    if (!updatedPaymentId) {
      this.logger.error('updatedPaymentId is undefined after transaction, cannot fetch payment.');
      throw new InternalServerErrorException('Failed to obtain payment ID after update transaction.');
    }

    try {
      const freshPayment = await this.findOne(updatedPaymentId);
      this.logger.log(`Payment with ID ${id} updated successfully.`);
      return freshPayment;
    } catch (fetchError) {
      this.logger.error(`Successfully updated payment ID ${updatedPaymentId}, but failed to re-fetch it: ${fetchError.message}`, fetchError.stack);
      throw new InternalServerErrorException(`Payment updated (ID: ${updatedPaymentId}) but failed to retrieve details.`);
    }
  }

  /**
   * Deletes a payment and updates the related show's financial details.
   */
  async remove(id: string): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentToDelete = await this.findOne(id, queryRunner);
      if (!paymentToDelete) { // Should be caught by findOne, but as a safeguard
        throw new NotFoundException(`Payment with ID "${id}" not found.`);
      }
      const { show_id } = paymentToDelete;

      const result = await queryRunner.manager.delete(Payment, id);
      if (result.affected === 0) {
        // This case should ideally be caught by findOne before delete
        throw new NotFoundException(`Payment with ID "${id}" not found for deletion.`);
      }

      // Update show's financial details
      await this.showsService.updateShowFinancesAfterPayment(show_id, queryRunner);

      await queryRunner.commitTransaction();
      this.logger.log(`Payment with ID ${id} for show ${show_id} deleted successfully.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete payment ID ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not delete payment.');
    } finally {
      await queryRunner.release();
    }
  }
} 