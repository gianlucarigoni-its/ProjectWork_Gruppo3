import { Type } from "class-transformer";
import { IsDate, IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { Transaction, TransactionCategory, TransactionType } from "./transaction.entity";
import { Types } from "mongoose";

export class Filter {
  @IsOptional()
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

export class TransactionResponse {
  transactions: Transaction[];
  balance?: number;
}
