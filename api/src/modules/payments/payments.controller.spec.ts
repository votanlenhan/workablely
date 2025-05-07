import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { RoleName } from '@/modules/roles/entities/role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { HttpStatus } from '@nestjs/common';

// Mock PaymentsService
const mockPaymentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock Guards if needed, or allow them to pass by not overriding
// For this controller, actual guard logic is not tested, only that they are applied.
// So we can use a simple pass-through mock or not mock them if not strictly necessary for controller logic tests.


describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockUser = { id: 'user-uuid', email: 'test@example.com', roles: [{ name: RoleName.ADMIN }] };
  const mockRequest = { user: mockUser };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
    // .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }) // Example if needing to mock guards
    // .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePaymentDto = { show_id: 's1', amount: 100, payment_date: new Date().toISOString() };
    const mockFullPayment: Payment = {
      id: 'p1',
      show_id: createDto.show_id,
      amount: createDto.amount,
      payment_date: new Date(createDto.payment_date!),
      payment_method: null,
      transaction_reference: null,
      notes: null,
      is_deposit: false,
      recorded_by_user_id: mockUser.id,
      created_at: new Date(),
      updated_at: new Date(),
      show: null as any,
      recordedBy: null as any,
    };

    it('should call service.create and return the result', async () => {
      mockPaymentsService.create.mockResolvedValue(mockFullPayment);
      const result = await controller.create(createDto, mockRequest as any);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(mockFullPayment);
    });
  });

  describe('findAll', () => {
    const mockPaymentItem: Payment = {
        id: 'p1', show_id: 's1', amount: 100, payment_date: new Date(), payment_method: null, transaction_reference: null, notes: null, is_deposit: false, recorded_by_user_id: 'u1', created_at: new Date(), updated_at: new Date(), show: null as any, recordedBy: null as any
    };
    const paginatedResult: Pagination<Payment> = {
      items: [mockPaymentItem],
      meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1},
      links: { first: '', previous: '', next: '', last: ''}
    };
    it('should call service.findAll with pagination options', async () => {
      mockPaymentsService.findAll.mockResolvedValue(paginatedResult);
      const result = await controller.findAll(1, 10);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, route: '/payments' });
      expect(result).toEqual(paginatedResult);
    });

    it('should cap limit at 100', async () => {
      mockPaymentsService.findAll.mockResolvedValue(paginatedResult); // Return value doesn't matter for this check
      await controller.findAll(1, 200);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 100, route: '/payments' });
    });
  });

  describe('findOne', () => {
    const paymentId = 'p1';
    const mockFullPayment: Payment = {
        id: paymentId, show_id: 's1', amount: 100, payment_date: new Date(), payment_method: null, transaction_reference: null, notes: null, is_deposit: false, recorded_by_user_id: 'u1', created_at: new Date(), updated_at: new Date(), show: null as any, recordedBy: null as any
    };
    it('should call service.findOne and return the result', async () => {
      mockPaymentsService.findOne.mockResolvedValue(mockFullPayment);
      const result = await controller.findOne(paymentId);
      expect(service.findOne).toHaveBeenCalledWith(paymentId);
      expect(result).toEqual(mockFullPayment);
    });
  });

  describe('update', () => {
    const paymentId = 'p1';
    const updateDto: UpdatePaymentDto = { amount: 150 };
    const mockUpdatedPayment: Payment = {
        id: paymentId, show_id: 's1', amount: 150, payment_date: new Date(), payment_method: null, transaction_reference: null, notes: null, is_deposit: false, recorded_by_user_id: 'u1', created_at: new Date(), updated_at: new Date(), show: null as any, recordedBy: null as any
    };
    it('should call service.update and return the result', async () => {
      mockPaymentsService.update.mockResolvedValue(mockUpdatedPayment);
      const result = await controller.update(paymentId, updateDto, mockRequest as any);
      expect(service.update).toHaveBeenCalledWith(paymentId, updateDto, mockUser.id);
      expect(result).toEqual(mockUpdatedPayment);
    });
  });

  describe('remove', () => {
    const paymentId = 'p1';
    it('should call service.remove', async () => {
      mockPaymentsService.remove.mockResolvedValue(undefined);
      await controller.remove(paymentId);
      expect(service.remove).toHaveBeenCalledWith(paymentId);
      // Note: HttpCode(HttpStatus.NO_CONTENT) means the actual response from controller will be empty
    });
  });

  describe('adminTest', () => {
    it('should return a success message for admin', () => {
        const result = controller.adminTest();
        expect(result).toEqual({ message: 'Payments admin test endpoint successful' });
    });
  });
}); 