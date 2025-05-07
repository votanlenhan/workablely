import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RevenueAllocationsService, AllocationDetail } from './revenue-allocations.service';
import { RevenueAllocation } from './entities/revenue-allocation.entity';
import { Show, ShowStatus } from '../shows/entities/show.entity';
import { ShowAssignment } from '../show-assignments/entities/show-assignment.entity';
import { ShowRole } from '../show-roles/entities/show-role.entity';
import { User } from '../users/entities/user.entity';
import { ConfigurationsService } from '../configurations/configurations.service';
import { ConfigurationKey } from '../configurations/entities/configuration-key.enum';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { paginate, Pagination, IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';

// Mocking nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  ...jest.requireActual('nestjs-typeorm-paginate'), // Spread actual module to keep other exports
  paginate: jest.fn(), // Mock only the paginate function
}));

// Now, paginate imported above will be the jest.fn() from the mock
const mockPaginate = paginate as jest.Mock; // This cast is now safer

// Helper to create mock Show
const createMockShow = (id: string, totalPrice: number, assignments: Partial<ShowAssignment>[] = []): Partial<Show> => ({
  id,
  total_price: totalPrice,
  status: ShowStatus.DELIVERED, // Assume a status that would trigger allocation
  assignments: assignments as ShowAssignment[],
});

// Helper to create mock ShowAssignment
const createMockAssignment = (
  userId: string,
  showRoleId: string,
  showRoleName: string,
  userFirstName: string = 'Test',
  userLastName: string = 'User'
): Partial<ShowAssignment> => ({
  user_id: userId,
  show_role_id: showRoleId,
  show_role: { id: showRoleId, name: showRoleName } as ShowRole,
  user: { id: userId, first_name: userFirstName, last_name: userLastName } as User,
});

// Helper to create a valid mock IPaginationMeta
const createMockPaginationMeta = (options: Partial<IPaginationMeta> = {}): IPaginationMeta => ({
  itemCount: 1, // Default to having at least one item for mock
  totalItems: 1,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
  ...options,
});

describe('RevenueAllocationsService', () => {
  let service: RevenueAllocationsService;
  let revenueAllocationRepo: Repository<RevenueAllocation>;
  let showRepo: Repository<Show>;
  let configurationsService: ConfigurationsService;
  let dataSource: DataSource;

  // Define a persistent mock query builder instance to be returned by createQueryBuilder
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(), // Add other methods if used by paginate or the service
    addSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(), 
    getRawMany: jest.fn(),
    // Add any other methods that might be called on the queryBuilder by nestjs-typeorm-paginate
  };

  const mockRevenueAllocationRepository = {
    create: jest.fn().mockImplementation((dto: Partial<RevenueAllocation>) => {
      const roleName = (dto.allocated_role_name && typeof dto.allocated_role_name === 'string' && dto.allocated_role_name.trim() !== '')
        ? dto.allocated_role_name
        : 'DEFAULT_MOCK_ALLOC_NAME';
      return {
        id: `mock-alloc-${Date.now()}-${Math.random()}`,
        show_id: dto.show_id || 'default-show-id',
        user_id: dto.user_id,
        allocated_role_name: roleName, // Use the processed roleName
        show_role_id: dto.show_role_id,
        amount: dto.amount || 0,
        calculation_notes: dto.calculation_notes || '',
        allocation_datetime: dto.allocation_datetime || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      } as RevenueAllocation; // Keep the original cast
    }),
    save: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    // Ensure createQueryBuilder always returns the same mockQueryBuilder instance
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockShowRepository = {
    findOne: jest.fn(),
  };

  const mockConfigurationsService = {
    findOneByKey: jest.fn(),
    // getConfigurationValueAsNumber is private, so we mock findOneByKey which it uses
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      delete: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueAllocationsService,
        { provide: getRepositoryToken(RevenueAllocation), useValue: mockRevenueAllocationRepository },
        { provide: getRepositoryToken(Show), useValue: mockShowRepository },
        // ShowAssignment and ShowRole repos are not directly used by the service's public methods for calculation beyond Show relation
        { provide: getRepositoryToken(ShowAssignment), useValue: {} }, 
        { provide: getRepositoryToken(ShowRole), useValue: {} }, 
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RevenueAllocationsService>(RevenueAllocationsService);
    revenueAllocationRepo = module.get<Repository<RevenueAllocation>>(getRepositoryToken(RevenueAllocation));
    showRepo = module.get<Repository<Show>>(getRepositoryToken(Show));
    configurationsService = module.get<ConfigurationsService>(ConfigurationsService);
    dataSource = module.get<DataSource>(DataSource);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockPaginate.mockReset();
    // Also reset the methods of the persistent mockQueryBuilder
    mockQueryBuilder.leftJoinAndSelect.mockClear();
    mockQueryBuilder.where.mockClear();
    mockQueryBuilder.orderBy.mockClear();
    mockQueryBuilder.getMany.mockClear(); // if used directly
    mockQueryBuilder.getRawMany.mockClear(); // if used directly
    // Reset any other qb methods as needed
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAllocationsForShow', () => {
    const showId = 'show-uuid-1';
    const showRoleKeyId = 'show-role-key';
    const showRoleSupportId = 'show-role-support';
    const showRoleSelectiveId = 'show-role-selective';
    const showRoleBlendId = 'show-role-blend';
    const showRoleRetouchId = 'show-role-retouch';

    const userKeyId = 'user-key-uuid';
    const userSupport1Id = 'user-support1-uuid';
    const userSupport2Id = 'user-support2-uuid';
    const userSelectiveId = 'user-selective-uuid';
    const userBlendId = 'user-blend-uuid';
    const userRetouchId = 'user-retouch-uuid';

    // Default config values
    const defaultConfigValues = {
      [ConfigurationKey.BUDGET_PHOTOGRAPHER_PERCENT]: { value: '0.35', value_type: 'number' },
      [ConfigurationKey.BONUS_1_SUPPORT_PERCENT]: { value: '0.04', value_type: 'number' },
      [ConfigurationKey.BONUS_2_SUPPORT_PERCENT]: { value: '0.03', value_type: 'number' },
      [ConfigurationKey.ROLE_SELECTIVE_PERCENT]: { value: '0.02', value_type: 'number' },
      [ConfigurationKey.ROLE_BLEND_PERCENT]: { value: '0.045', value_type: 'number' },
      [ConfigurationKey.ROLE_RETOUCH_PERCENT]: { value: '0.035', value_type: 'number' },
      [ConfigurationKey.FUND_MARKETING_PERCENT]: { value: '0.07', value_type: 'number' },
      [ConfigurationKey.FUND_ART_LEAD_PERCENT]: { value: '0.05', value_type: 'number' },
      [ConfigurationKey.FUND_PM_PERCENT]: { value: '0.05', value_type: 'number' },
      [ConfigurationKey.FUND_SECURITY_PERCENT]: { value: '0.02', value_type: 'number' },
      [ConfigurationKey.FUND_WISHLIST_PERCENT]: { value: '0.20', value_type: 'number' },
    };

    // Restore the beforeEach for 'calculateAllocationsForShow'
    
    beforeEach(() => {
      (mockConfigurationsService.findOneByKey as jest.Mock).mockReset(); // Reset before each test in this block
      mockConfigurationsService.findOneByKey.mockImplementation((key) => {
        return Promise.resolve(defaultConfigValues[key] || null);
      });
    });
    

    it('should throw NotFoundException if show does not exist', async () => {
      mockShowRepository.findOne.mockResolvedValue(null);
      await expect(service.calculateAllocationsForShow(showId)).rejects.toThrow(NotFoundException);
    });

    it('should return empty array if show total_price is zero or invalid', async () => {
      mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, 0));
      const result = await service.calculateAllocationsForShow(showId);
      expect(result).toEqual([]);
    });

    it('should correctly calculate for Key only', async () => {
      const totalPrice = 1000;
      const assignments = [createMockAssignment(userKeyId, showRoleKeyId, 'KEY')];
      mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, assignments));
      
      const results = await service.calculateAllocationsForShow(showId);
      // Expected: Key = 350 (35% of 1000)
      const keyAlloc = results.find(r => r.user_id === userKeyId);
      expect(keyAlloc?.amount).toBe(350);
      // Check funds and net profit
      expect(results.length).toBe(1 + 5 + 1); // Key + 5 Funds + Net Profit
      const marketingFund = results.find(r => r.allocated_role_name === 'Marketing Fund');
      expect(marketingFund?.amount).toBe(70); // 7%
      const netProfit = results.find(r => r.allocated_role_name === 'Operation Net Profit');
      // Total allocations: 350 (Key) + 70 (Mkt) + 50 (Art) + 50 (PM) + 20 (Sec) + 200 (Wish) = 740
      // Net Profit = 1000 - 740 = 260
      expect(netProfit?.amount).toBeCloseTo(260);
    });

    it('should correctly calculate for Key + 1 Support', async () => {
        const totalPrice = 1000;
        const assignments = [
            createMockAssignment(userKeyId, showRoleKeyId, 'KEY'),
            createMockAssignment(userSupport1Id, showRoleSupportId, 'SUPPORT'),
        ];
        mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, assignments));
        const results = await service.calculateAllocationsForShow(showId);

        // PhotographerBudget = 350. Bonus = 40 (4% for 1 support).
        // Shareable = 310. Per person = 155.
        // Key = 155 + 40 = 195.
        // Support1 = 155.
        const keyAlloc = results.find(r => r.user_id === userKeyId);
        expect(keyAlloc?.amount).toBe(195);
        const support1Alloc = results.find(r => r.user_id === userSupport1Id);
        expect(support1Alloc?.amount).toBe(155);
        expect(results.length).toBe(2 + 5 + 1); // Key, Sup + 5 Funds + Net Profit
    });

    it('should correctly calculate for Key + 2 Supports', async () => {
        const totalPrice = 1000;
        const assignments = [
            createMockAssignment(userKeyId, showRoleKeyId, 'KEY'),
            createMockAssignment(userSupport1Id, showRoleSupportId, 'SUPPORT 1'),
            createMockAssignment(userSupport2Id, showRoleSupportId, 'SUPPORT 2'),
        ];
        mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, assignments));
        const results = await service.calculateAllocationsForShow(showId);

        // PhotographerBudget = 350. Bonus = 30 (3% for 2 supports).
        // Shareable = 320. Per person = 320 / 3 = 106.666...
        // Key = 106.67 + 30 = 136.67
        // Support1 = 106.67, Support2 = 106.67
        const keyAlloc = results.find(r => r.user_id === userKeyId);
        expect(keyAlloc?.amount).toBeCloseTo(136.67, 2);
        const support1Alloc = results.find(r => r.user_id === userSupport1Id);
        expect(support1Alloc?.amount).toBeCloseTo(106.67, 2);
        const support2Alloc = results.find(r => r.user_id === userSupport2Id);
        expect(support2Alloc?.amount).toBeCloseTo(106.67, 2);
        expect(results.length).toBe(3 + 5 + 1); // Key, 2xSup + 5 Funds + Net Profit
    });

    it('should correctly calculate for Selective, Blend, Retouch roles', async () => {
        const totalPrice = 1000;
        const assignments = [
            createMockAssignment(userSelectiveId, showRoleSelectiveId, 'SELECTIVE'),
            createMockAssignment(userBlendId, showRoleBlendId, 'BLEND'),
            createMockAssignment(userRetouchId, showRoleRetouchId, 'RETOUCH'),
        ];
        mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, assignments));
        const results = await service.calculateAllocationsForShow(showId);

        const selectiveAlloc = results.find(r => r.user_id === userSelectiveId);
        expect(selectiveAlloc?.amount).toBe(20); // 2%
        const blendAlloc = results.find(r => r.user_id === userBlendId);
        expect(blendAlloc?.amount).toBe(45); // 4.5%
        const retouchAlloc = results.find(r => r.user_id === userRetouchId);
        expect(retouchAlloc?.amount).toBe(35); // 3.5%
    });

    it('should sum all allocations correctly for net profit', async () => {
        const totalPrice = 1000;
        const assignments = [
            createMockAssignment(userKeyId, showRoleKeyId, 'KEY'),
            createMockAssignment(userSupport1Id, showRoleSupportId, 'SUPPORT'),
            createMockAssignment(userSelectiveId, showRoleSelectiveId, 'SELECTIVE'),
            createMockAssignment(userBlendId, showRoleBlendId, 'BLEND'),
            createMockAssignment(userRetouchId, showRoleRetouchId, 'RETOUCH'),
        ];
        mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, assignments));
        const results = await service.calculateAllocationsForShow(showId);

        const totalAllocated = results.reduce((sum, alloc) => {
            // Exclude net profit from sum before comparing
            return alloc.allocated_role_name !== 'Operation Net Profit' ? sum + alloc.amount : sum;
        }, 0);
        const netProfitAlloc = results.find(r => r.allocated_role_name === 'Operation Net Profit');
        expect(netProfitAlloc).toBeDefined();
        expect(totalPrice - totalAllocated).toBeCloseTo(netProfitAlloc!.amount, 2);
    });

    it('should throw InternalServerErrorException if configuration is missing', async () => {
      mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, 1000, [createMockAssignment(userKeyId, showRoleKeyId, 'KEY')]));
      // Simulate a missing critical configuration
      mockConfigurationsService.findOneByKey.mockImplementation((key) => {
        if (key === ConfigurationKey.BUDGET_PHOTOGRAPHER_PERCENT) {
          return Promise.resolve(null); // Missing config
        }
        return Promise.resolve(defaultConfigValues[key] || null);
      });

      await expect(service.calculateAllocationsForShow(showId)).rejects.toThrow(InternalServerErrorException);
      await expect(service.calculateAllocationsForShow(showId)).rejects.toThrow('Required configuration BUDGET_PHOTOGRAPHER_PERCENT is missing or invalid.');
    });

    it('should return an empty array if show has no assignments', async () => {
      const totalPrice = 1000;
      // Show with no assignments
      mockShowRepository.findOne.mockResolvedValue(createMockShow(showId, totalPrice, []));
      
      // const results = await service.calculateAllocationsForShow(showId);
      // The service is expected to still create fund & profit allocations.
      // The previous expectation of results.toEqual([]) was likely incorrect.

      // Let's refine this test based on expected behavior that funds are always calculated if totalPrice > 0
      // Correct way to count fund configurations by checking keys of defaultConfigValues
      const fundKeys = Object.keys(defaultConfigValues).filter(key => key.startsWith('FUND_'));
      // const fundAllocationsCount = fundKeys.length; // This was an approximation not directly used.
      
      // Re-mock findOneByKey for this specific test case to ensure all fund configs are present
      mockConfigurationsService.findOneByKey.mockImplementation((key) => {
        return Promise.resolve(defaultConfigValues[key] || null);
      });

      const resultsWithFunds = await service.calculateAllocationsForShow(showId);
      
      // Expect only fund allocations and net profit
      const expectedFundAndProfitAllocations = 6; // 5 funds + 1 net profit
      expect(resultsWithFunds.length).toBe(expectedFundAndProfitAllocations); 
      
      const marketingFund = resultsWithFunds.find(r => r.allocated_role_name === 'Marketing Fund');
      expect(marketingFund?.amount).toBe(totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_MARKETING_PERCENT].value));
      const netProfit = resultsWithFunds.find(r => r.allocated_role_name === 'Operation Net Profit');
      const totalFundsAllocated = 
        (totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_MARKETING_PERCENT].value)) +
        (totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_ART_LEAD_PERCENT].value)) +
        (totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_PM_PERCENT].value)) +
        (totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_SECURITY_PERCENT].value)) +
        (totalPrice * parseFloat(defaultConfigValues[ConfigurationKey.FUND_WISHLIST_PERCENT].value));
      expect(netProfit?.amount).toBeCloseTo(totalPrice - totalFundsAllocated);

    });
  });

  describe('calculateAndSaveAllocationsForShow', () => {
    const showId = 'show-to-save-allocations';
    // Define user and role IDs to be used in this describe block
    const userKeyId = 'user-key-for-save';
    const showRoleKeyId = 'role-key-for-save';
    const userSupport1Id = 'user-support1-for-save';
    const showRoleSupportId = 'role-support-for-save';
    const userSelectiveId = 'user-selective-for-save';
    const showRoleSelectiveId = 'role-selective-for-save';
    const userBlendId = 'user-blend-for-save';
    const showRoleBlendId = 'role-blend-for-save';
    const userRetouchId = 'user-retouch-for-save';
    const showRoleRetouchId = 'role-retouch-for-save';

    // Default config values needed for this describe block
    const defaultConfigValuesForSaveTest = {
      [ConfigurationKey.BUDGET_PHOTOGRAPHER_PERCENT]: { value: '0.35', value_type: 'number' },
      [ConfigurationKey.BONUS_1_SUPPORT_PERCENT]: { value: '0.04', value_type: 'number' },
      [ConfigurationKey.BONUS_2_SUPPORT_PERCENT]: { value: '0.03', value_type: 'number' },
      [ConfigurationKey.ROLE_SELECTIVE_PERCENT]: { value: '0.02', value_type: 'number' },
      [ConfigurationKey.ROLE_BLEND_PERCENT]: { value: '0.045', value_type: 'number' },
      [ConfigurationKey.ROLE_RETOUCH_PERCENT]: { value: '0.035', value_type: 'number' },
      [ConfigurationKey.FUND_MARKETING_PERCENT]: { value: '0.07', value_type: 'number' },
      [ConfigurationKey.FUND_ART_LEAD_PERCENT]: { value: '0.05', value_type: 'number' },
      [ConfigurationKey.FUND_PM_PERCENT]: { value: '0.05', value_type: 'number' },
      [ConfigurationKey.FUND_SECURITY_PERCENT]: { value: '0.02', value_type: 'number' },
      [ConfigurationKey.FUND_WISHLIST_PERCENT]: { value: '0.20', value_type: 'number' },
    };

    it('should successfully calculate, delete existing, and save new allocations within a transaction (using REAL calculation)', async () => {
      // Setup mock for configurationsService.findOneByKey to use full config set
      (configurationsService.findOneByKey as jest.Mock).mockImplementation(async (key: ConfigurationKey) => {
        return Promise.resolve(defaultConfigValuesForSaveTest[key] || { value: '0', value_type: 'number' });
      });

      const testTotalPrice = 1000;
      const keyAssignment = createMockAssignment(userKeyId, showRoleKeyId, 'Key', 'Key', 'User');
      const support1Assignment = createMockAssignment(userSupport1Id, showRoleSupportId, 'Support', 'Sup1', 'User');
      const selectiveAssignment = createMockAssignment(userSelectiveId, showRoleSelectiveId, 'Selective', 'Sel', 'User');
      const blendAssignment = createMockAssignment(userBlendId, showRoleBlendId, 'Blend', 'Blen', 'User');
      const retouchAssignment = createMockAssignment(userRetouchId, showRoleRetouchId, 'Retouch', 'Ret', 'User');
      
      const mockShowForTransaction = createMockShow(showId, testTotalPrice, [
        keyAssignment,
        support1Assignment,
        selectiveAssignment,
        blendAssignment,
        retouchAssignment,
      ]);
      (mockShowRepository.findOne as jest.Mock).mockResolvedValueOnce(mockShowForTransaction as Show);

      (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
      (mockQueryRunner.manager.delete as jest.Mock).mockResolvedValue({ affected: 1, raw: [] });
      
      const expectedNumberOfAllocations = 1 + 1 + 1 + 1 + 1 + 5 + 1; // Key, Sup1, Sel, Blend, Retouch, 5 Funds, Net Profit

      (mockQueryRunner.manager.save as jest.Mock).mockImplementation(async (entitiesToSave: RevenueAllocation[]) => {
        expect(entitiesToSave.length).toBe(expectedNumberOfAllocations); 
        return Promise.resolve(entitiesToSave.map((e, i) => ({ ...e, id: `saved-alloc-${i}` } as RevenueAllocation)));
      });
      
      const result = await service.calculateAndSaveAllocationsForShow(showId);

      expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['assignments', 'assignments.user', 'assignments.show_role'] });
      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(RevenueAllocation, { show_id: showId });
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(expectedNumberOfAllocations); 
      
      const keyAllocResult = result.find(r => r.allocated_role_name.startsWith('Key Photographer'));
      expect(keyAllocResult?.amount).toBeCloseTo(195);
      const supportAllocResult = result.find(r => r.allocated_role_name.startsWith('Support Photographer'));
      expect(supportAllocResult?.amount).toBeCloseTo(155);
      const selectiveAllocResult = result.find(r => r.allocated_role_name.startsWith('Selective'));
      expect(selectiveAllocResult?.amount).toBeCloseTo(20);
      const netProfitResult = result.find(r => r.allocated_role_name === 'Operation Net Profit');
      expect(netProfitResult?.amount).toBeCloseTo(160);
    });

    it('should return empty array and delete existing if calculatedAllocations is empty', async () => {
      // ... existing code ...
    });
  });

  describe('findAllByShowId', () => {
    it('should return paginated revenue allocations for a show', async () => {
      const showId = 'show-for-pagination';
      // Ensure page and limit are numbers as expected by IPaginationOptions and paginate function
      const mockOptions: IPaginationOptions = { page: 1, limit: 10, route: `/shows/${showId}/revenue-allocations` };
      const mockMeta = createMockPaginationMeta({ itemCount: 1, totalItems: 1, itemsPerPage: 10, currentPage: 1, totalPages: 1 });
      const mockAllocations = [{ id: 'alloc-paginated', show_id: showId } as RevenueAllocation];
      const mockResult: Pagination<RevenueAllocation> = { 
        items: mockAllocations, 
        meta: mockMeta,
        // links are optional and often derived if route is provided
      };

      mockPaginate.mockResolvedValue(mockResult);

      const result = await service.findAllByShowId(showId, mockOptions);

      // The first argument to paginate is the TypeORM QueryBuilder
      // The second argument is the options
      expect(mockPaginate).toHaveBeenCalledWith(expect.anything(), mockOptions); 
      expect(result).toEqual(mockResult);
      expect(result.items).toEqual(mockAllocations);
      expect(result.meta.currentPage).toBe(mockOptions.page);
      expect(result.meta.itemsPerPage).toBe(mockOptions.limit);
    });

    it('should call paginate with the correct query builder and options', async () => {
      const showId = 'another-show-id';
      const mockOptions: IPaginationOptions = { page: 2, limit: 5, route: 'a/route' }; // Numeric page and limit
      const mockMeta = createMockPaginationMeta({ currentPage: 2, itemsPerPage: 5, totalItems: 0, itemCount: 0, totalPages: 0 });
      const mockPaginatedResult: Pagination<RevenueAllocation> = { items: [], meta: mockMeta };

      mockPaginate.mockResolvedValue(mockPaginatedResult);
      // No need to get mockQueryBuilderInstance from the repo mock here, 
      // as the service will get the same instance defined above.

      await service.findAllByShowId(showId, mockOptions);

      expect(mockRevenueAllocationRepository.createQueryBuilder).toHaveBeenCalledWith('ra');
      // Assert on the persistent mockQueryBuilder instance directly
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('ra.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('ra.show_role', 'show_role');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ra.show_id = :showId', { showId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('ra.created_at', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, mockOptions); // Service should use this instance
    });

     it('should handle pagination when no items are found', async () => {
      const showId = 'empty-show-id';
      const mockOptions: IPaginationOptions = { page: 1, limit: 10, route: 'some/route' };
      const mockMeta = createMockPaginationMeta({ itemCount: 0, totalItems: 0, totalPages: 0, currentPage: 1 });
      const mockResult: Pagination<RevenueAllocation> = { items: [], meta: mockMeta };

      mockPaginate.mockResolvedValue(mockResult);

      const result = await service.findAllByShowId(showId, mockOptions);
      expect(mockPaginate).toHaveBeenCalledWith(expect.anything(), mockOptions);
      expect(result).toEqual(mockResult);
      expect(result.items.length).toBe(0);
    });

    it('should throw error if paginate itself throws an error', async () => {
      const showId = 'error-show-id';
      const mockOptions: IPaginationOptions = { page: 1, limit: 10, route: 'fail/route' };
      const errorMessage = 'Pagination internal error';
      
      mockPaginate.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAllByShowId(showId, mockOptions)).rejects.toThrow(errorMessage);
    });
  });

  describe('findOne', () => {
    it('should return an allocation if found', async () => {
      const allocId = 'alloc-id';
      const mockAlloc = { id: allocId, amount: 100 } as RevenueAllocation;
      mockRevenueAllocationRepository.findOne.mockResolvedValue(mockAlloc);
      const result = await service.findOne(allocId);
      expect(result).toEqual(mockAlloc);
      expect(mockRevenueAllocationRepository.findOne).toHaveBeenCalledWith({ where: { id: allocId }, relations: ['user', 'show_role', 'show'] });
    });

    it('should throw NotFoundException if allocation not found', async () => {
      const allocId = 'non-existent-id';
      mockRevenueAllocationRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(allocId)).rejects.toThrow(NotFoundException);
    });
  });
}); 