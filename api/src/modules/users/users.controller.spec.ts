import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMock } from '@golevelup/ts-jest'; // Or use jest.fn() for simpler mocks

// Mock UsersService methods used by the controller
const mockUsersService = {
  createUser: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  updateUser: jest.fn(),
  removeUser: jest.fn(),
  // Add other methods if controller uses them
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService; // Keep reference if needed

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      // Provide the mocked service
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService, 
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService); // Get the mocked instance
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add actual test cases for controller methods
  // Example:
  // describe('create', () => {
  //   it('should call usersService.createUser with correct params', async () => {
  //     const dto = { email: 'test@test.com', password: 'pass', first_name:'a', last_name:'b' };
  //     const expectedResult = { id: 'uuid', ...dto, roles: [] }; 
  //     mockUsersService.createUser.mockResolvedValue(expectedResult);

  //     const result = await controller.create(dto);
  //     expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
  //     expect(result).toEqual(expectedResult);
  //   });
  // });

  // ... Add tests for findAll, findOne, update, remove ...

});
