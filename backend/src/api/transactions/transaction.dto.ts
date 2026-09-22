import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, Min } from "class-validator";
import { Transaction, TransactionCategory } from "./transaction.entity";
import { Type } from "class-transformer";

export class Filter {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  num?: number;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @IsOptional()
  @IsDateString({ strict: true })
  from?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  to?: string;
}

export class Download {
  @IsOptional()
  @IsNumber()
  @Min(1)
  num?: number;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @IsOptional()
  @IsDateString({ strict: true })
  from?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  to?: string;
}

export class TransactionResponse {
  transactions: Transaction[];
  balance?: number;
}
