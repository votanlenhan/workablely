import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowRole } from './entities/show-role.entity';
import { CreateShowRoleDto } from './dto/create-show-role.dto';
import { UpdateShowRoleDto } from './dto/update-show-role.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class ShowRolesService {
  constructor(
    @InjectRepository(ShowRole)
    private readonly showRoleRepository: Repository<ShowRole>,
  ) {}

  async create(createShowRoleDto: CreateShowRoleDto): Promise<ShowRole> {
    const newShowRole = this.showRoleRepository.create(createShowRoleDto);
    // Consider adding a check for unique name before saving
    try {
        return await this.showRoleRepository.save(newShowRole);
    } catch (error) {
        // Handle potential unique constraint violation (e.g., PostgreSQL error code 23505)
        if (error.code === '23505') {
            throw new Error(`ShowRole with name "${newShowRole.name}" already exists.`);
        }
        throw error; // Re-throw other errors
    }
  }

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<ShowRole>> {
    const queryBuilder = this.showRoleRepository.createQueryBuilder('show_role');
    queryBuilder.orderBy('show_role.name', 'ASC');
    return paginate<ShowRole>(queryBuilder, options);
  }

  async findOne(id: string): Promise<ShowRole> {
    const showRole = await this.showRoleRepository.findOne({ where: { id } });
    if (!showRole) {
      throw new NotFoundException(`ShowRole with ID "${id}" not found`);
    }
    return showRole;
  }

  async update(id: string, updateShowRoleDto: UpdateShowRoleDto): Promise<ShowRole> {
    const showRole = await this.showRoleRepository.preload({
      id: id,
      ...updateShowRoleDto,
    });
    if (!showRole) {
      throw new NotFoundException(`ShowRole with ID "${id}" not found`);
    }
    // Consider adding a check for unique name before saving update
     try {
        return await this.showRoleRepository.save(showRole);
    } catch (error) {
        if (error.code === '23505') {
            throw new Error(`ShowRole with name "${showRole.name}" already exists.`);
        }
        throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.showRoleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ShowRole with ID "${id}" not found`);
    }
  }
} 