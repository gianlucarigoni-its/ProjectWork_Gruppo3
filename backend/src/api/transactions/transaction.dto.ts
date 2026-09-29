import { IsPositive, IsDateString, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Transaction, TransactionCategory } from "./transaction.entity";
import { Type } from "class-transformer";

export class Filter {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

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

export class DownloadDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

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

export class TransferDto {
  @IsString()
  IBAN: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  amount: number;
}

export class TopUpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  operator: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  amount: number;
}

export class TransactionResponse {
  transactions: Transaction[];
  balance?: number;
}

export class TypeID {
  @IsString()
  @IsMongoId()
  id: string;
}
