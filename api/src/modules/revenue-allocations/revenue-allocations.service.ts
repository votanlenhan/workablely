import { Injectable, Logger, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { RevenueAllocation } from './entities/revenue-allocation.entity';
import { Show } from '../shows/entities/show.entity';
import { ShowAssignment } from '../show-assignments/entities/show-assignment.entity';
import { ShowRole } from '../show-roles/entities/show-role.entity';
import { ConfigurationsService } from '../configurations/configurations.service';
import { ConfigurationKey } from '../configurations/entities/configuration-key.enum'; // Sẽ tạo enum này
import { User } from '../users/entities/user.entity';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

export interface AllocationDetail {
  allocated_role_name: string;
  user_id?: string;
  show_role_id?: string;
  amount: number;
  calculation_notes: string;
}

@Injectable()
export class RevenueAllocationsService {
  private readonly logger = new Logger(RevenueAllocationsService.name);

  constructor(
    @InjectRepository(RevenueAllocation)
    private readonly revenueAllocationRepository: Repository<RevenueAllocation>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowAssignment)
    private readonly showAssignmentRepository: Repository<ShowAssignment>,
    @InjectRepository(ShowRole) // Mặc dù không trực tiếp dùng nhiều, có thể cần để lấy tên ShowRole
    private readonly showRoleRepository: Repository<ShowRole>,
    private readonly configurationsService: ConfigurationsService,
    private readonly dataSource: DataSource,
  ) {}

  // --- Configuration Helper Methods ---
  private async getConfigurationValueAsNumber(
    key: ConfigurationKey, 
    defaultValue: number, 
    isCritical: boolean = false
  ): Promise<number> {
    try {
      const config = await this.configurationsService.findOneByKey(key);
      if (config && config.value_type === 'number') {
        const numValue = parseFloat(config.value);
        if (!isNaN(numValue)) {
          return numValue;
        }
      }
      // If config is not found or not a number, and it's critical, throw error
      if (isCritical) {
        this.logger.error(`Critical configuration for ${key} not found or invalid and no valid number value present.`);
        throw new InternalServerErrorException(`Required configuration ${key} is missing or invalid.`);
      }
      // Otherwise, use default value and log a warning
      this.logger.warn(`Configuration for ${key} not found or not a number, using default value: ${defaultValue}`);
      return defaultValue;
    } catch (error) {
      // If the error is the one we threw, rethrow it
      if (error instanceof InternalServerErrorException && error.message.includes(key)) {
        throw error;
      }
      // For other errors (e.g., DB connection issue during findOneByKey), or if it's critical and we landed here
      if (isCritical) {
        this.logger.error(`Error fetching critical configuration ${key}: ${error.message}`, error.stack);
        throw new InternalServerErrorException(`Failed to fetch critical configuration ${key}.`);
      }
      this.logger.warn(`Error fetching configuration ${key}, using default value ${defaultValue}: ${error.message}`);
      return defaultValue;
    }
  }

  // --- Core Calculation Logic ---
  async calculateAllocationsForShow(showId: string): Promise<AllocationDetail[]> {
    this.logger.log(`Starting revenue allocation calculation for showId: ${showId}`);
    const show = await this.showRepository.findOne({ 
      where: { id: showId }, 
      relations: ['assignments', 'assignments.user', 'assignments.show_role'] 
    });

    if (!show) {
      throw new NotFoundException(`Show with ID ${showId} not found.`);
    }
    if (!show.total_price || show.total_price <= 0) {
      this.logger.warn(`Show ${showId} has no total_price or total_price is zero/negative. No allocations will be made.`);
      return [];
    }

    const totalPrice = Number(show.total_price);
    const allocationDetails: AllocationDetail[] = [];

    // Get configuration percentages
    const photographerBudgetPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.BUDGET_PHOTOGRAPHER_PERCENT, 0.35, true);
    const bonus1SupportPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.BONUS_1_SUPPORT_PERCENT, 0.04, true);
    const bonus2SupportPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.BONUS_2_SUPPORT_PERCENT, 0.03, true);
    const selectivePercent = await this.getConfigurationValueAsNumber(ConfigurationKey.ROLE_SELECTIVE_PERCENT, 0);
    const blendPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.ROLE_BLEND_PERCENT, 0);
    const retouchPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.ROLE_RETOUCH_PERCENT, 0);
    const leadPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.FUND_LEAD_PERCENT, 0);
    const marketingPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.FUND_MARKETING_PERCENT, 0);
    const artDirectorPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.FUND_ART_DIRECTOR_PERCENT, 0);
    const managerPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.FUND_MANAGER_PERCENT, 0);
    const wishlistPercent = await this.getConfigurationValueAsNumber(ConfigurationKey.FUND_WISHLIST_PERCENT, 0);

    // If photographerBudgetPercent itself resolved to 0 due to missing critical config and default was 0, 
    // this might be an issue. The error should be thrown from getConfigurationValueAsNumber.
    // Let's add a check here to be absolutely sure, though the helper should handle it.
    if (photographerBudgetPercent === 0 && !(await this.configurationsService.findOneByKey(ConfigurationKey.BUDGET_PHOTOGRAPHER_PERCENT))) {
        // This double check ensures that if default was 0, but config truly missing, we error.
        // However, getConfigurationValueAsNumber with isCritical=true should have already thrown.
        // This is more of a safeguard / illustration if getConfigurationValueAsNumber wasn't strict enough.
        // For now, relying on the updated getConfigurationValueAsNumber.
    }

    // 1. Photographer Key & Support Calculation
    const keyAssignments = show.assignments.filter(a => a.show_role?.name.toUpperCase() === 'KEY');
    const supportAssignments = show.assignments.filter(a => a.show_role?.name.toUpperCase().startsWith('SUPPORT'));
    const keyPhotographer = keyAssignments.length > 0 ? keyAssignments[0] : null;
    const numSupports = supportAssignments.length;

    let photographerBudgetAmount = totalPrice * photographerBudgetPercent;
    let bonusAmount = 0;
    if (numSupports === 1) {
      bonusAmount = totalPrice * bonus1SupportPercent;
    } else if (numSupports >= 2) {
      bonusAmount = totalPrice * bonus2SupportPercent;
    }

    const shareableBudget = photographerBudgetAmount - bonusAmount;
    const numSharers = 1 + numSupports; // Key + Supports
    const individualShare = numSharers > 0 ? Math.max(0, shareableBudget / numSharers) : 0;

    if (keyPhotographer && keyPhotographer.user_id) {
      const keyTotal = individualShare + bonusAmount;
      allocationDetails.push({
        user_id: keyPhotographer.user_id,
        show_role_id: keyPhotographer.show_role_id,
        allocated_role_name: `Key Photographer (${keyPhotographer.user?.first_name} ${keyPhotographer.user?.last_name})`,
        amount: parseFloat(keyTotal.toFixed(2)),
        calculation_notes: `Photographer Budget: ${photographerBudgetAmount.toFixed(2)} (Share: ${individualShare.toFixed(2)} + Bonus: ${bonusAmount.toFixed(2)})`,
      });
    }

    supportAssignments.forEach((support, index) => {
      if (support.user_id) {
        allocationDetails.push({
          user_id: support.user_id,
          show_role_id: support.show_role_id,
          allocated_role_name: `Support Photographer ${index + 1} (${support.user?.first_name} ${support.user?.last_name})`,
          amount: parseFloat(individualShare.toFixed(2)),
          calculation_notes: `Shared part of Photographer Budget: ${individualShare.toFixed(2)}`,
        });
      }
    });

    // 2. Other Role-Based Allocations (Selective, Blend, Retouch)
    const selectiveAssignments = show.assignments.filter(a => a.show_role?.name.toUpperCase() === 'SELECTIVE');
    selectiveAssignments.forEach(sel => {
      if(sel.user_id){
        const amount = totalPrice * selectivePercent;
        allocationDetails.push({
          user_id: sel.user_id,
          show_role_id: sel.show_role_id,
          allocated_role_name: `Selective (${sel.user?.first_name} ${sel.user?.last_name})`,
          amount: parseFloat(amount.toFixed(2)),
          calculation_notes: `Based on ${selectivePercent*100}% of total price ${totalPrice.toFixed(2)}`,
        });
      }
    });

    const blendAssignments = show.assignments.filter(a => a.show_role?.name.toUpperCase() === 'BLEND');
    blendAssignments.forEach(bl => {
      if(bl.user_id){
        const amount = totalPrice * blendPercent;
        allocationDetails.push({
          user_id: bl.user_id,
          show_role_id: bl.show_role_id,
          allocated_role_name: `Blend (${bl.user?.first_name} ${bl.user?.last_name})`,
          amount: parseFloat(amount.toFixed(2)),
          calculation_notes: `Based on ${blendPercent*100}% of total price ${totalPrice.toFixed(2)}`,
        });
      }
    });

    const retouchAssignments = show.assignments.filter(a => a.show_role?.name.toUpperCase() === 'RETOUCH');
    retouchAssignments.forEach(rt => {
      if(rt.user_id){
        const amount = totalPrice * retouchPercent;
        allocationDetails.push({
          user_id: rt.user_id,
          show_role_id: rt.show_role_id,
          allocated_role_name: `Retouch (${rt.user?.first_name} ${rt.user?.last_name})`,
          amount: parseFloat(amount.toFixed(2)),
          calculation_notes: `Based on ${retouchPercent*100}% of total price ${totalPrice.toFixed(2)}`,
        });
      }
    });

    // 3. Fixed Fund Allocations (Lead, Marketing, Art Director, Manager, Wishlist)
    const funds = [
      { name: 'Lead Fund', percent: leadPercent, key_notes: 'Lead' },
      { name: 'Marketing Fund', percent: marketingPercent, key_notes: 'Marketing' },
      { name: 'Art Director Fund', percent: artDirectorPercent, key_notes: 'Art Director' },
      { name: 'Manager Fund', percent: managerPercent, key_notes: 'Manager' },
      { name: 'Wishlist Fund', percent: wishlistPercent, key_notes: 'Wishlist' },
    ];

    funds.forEach(fund => {
      const amount = totalPrice * fund.percent;
      allocationDetails.push({
        allocated_role_name: fund.name,
        amount: parseFloat(amount.toFixed(2)),
        calculation_notes: `Based on ${fund.percent*100}% of total price ${totalPrice.toFixed(2)} for ${fund.key_notes}`,
      });
    });

    // 4. Calculate Net Profit (Operation)
    const totalAllocatedToRolesAndFunds = allocationDetails.reduce((sum, alloc) => sum + alloc.amount, 0);
    const netProfit = totalPrice - totalAllocatedToRolesAndFunds;
    allocationDetails.push({
      allocated_role_name: 'Operation Net Profit',
      amount: parseFloat(netProfit.toFixed(2)),
      calculation_notes: `Total Price (${totalPrice.toFixed(2)}) - Total Allocated (${totalAllocatedToRolesAndFunds.toFixed(2)})`,
    });

    this.logger.log(`Calculated ${allocationDetails.length} allocation entries for showId: ${showId}`);
    return allocationDetails;
  }

  /**
   * Calculates and saves all revenue allocations for a given show.
   * This will delete existing allocations for the show and recreate them.
   */
  async calculateAndSaveAllocationsForShow(showId: string): Promise<RevenueAllocation[]> {
    const calculatedAllocations = await this.calculateAllocationsForShow(showId);
    if (calculatedAllocations.length === 0) {
      this.logger.log(`No allocations calculated for show ${showId}, nothing to save.`);
      // Optionally, ensure old allocations are deleted if the logic is to always reflect the latest calculation
      await this.revenueAllocationRepository.delete({ show_id: showId });
      return [];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(RevenueAllocation, { show_id: showId });

      const newAllocationEntities = calculatedAllocations.map(detail => {
        return this.revenueAllocationRepository.create({
          show_id: showId,
          user_id: detail.user_id,
          allocated_role_name: detail.allocated_role_name,
          show_role_id: detail.show_role_id,
          amount: detail.amount,
          calculation_notes: detail.calculation_notes,
          allocation_datetime: new Date(),
        });
      });

      if (newAllocationEntities.length === 0) {
        this.logger.log(`No new allocation entities to save for show ${showId} after mapping.`);
        await queryRunner.commitTransaction();
        return [];
      }

      const savedAllocations = await queryRunner.manager.save(newAllocationEntities);
      await queryRunner.commitTransaction();
      this.logger.log(`Successfully saved ${savedAllocations.length} allocations for show ${showId}.`);
      return savedAllocations;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error saving allocations for show ${showId}: ${error.message}`, error.stack);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(`Failed to save allocations for show ${showId}.`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByShowId(showId: string, options: IPaginationOptions): Promise<Pagination<RevenueAllocation>> {
    const queryBuilder = this.revenueAllocationRepository.createQueryBuilder('ra')
      .leftJoinAndSelect('ra.user', 'user')
      .leftJoinAndSelect('ra.show_role', 'show_role')
      .where('ra.show_id = :showId', { showId })
      .orderBy('ra.created_at', 'DESC');
    
    return paginate<RevenueAllocation>(queryBuilder, options);
  }

  async findOne(id: string): Promise<RevenueAllocation> {
    const allocation = await this.revenueAllocationRepository.findOne({ 
        where: { id },
        relations: ['user', 'show_role', 'show'] 
    });
    if (!allocation) {
      throw new NotFoundException(`RevenueAllocation with ID ${id} not found`);
    }
    return allocation;
  }
} 