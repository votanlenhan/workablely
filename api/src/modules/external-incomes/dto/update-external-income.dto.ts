import { PartialType } from '@nestjs/swagger';
import { CreateExternalIncomeDto } from './create-external-income.dto';

export class UpdateExternalIncomeDto extends PartialType(CreateExternalIncomeDto) {} 