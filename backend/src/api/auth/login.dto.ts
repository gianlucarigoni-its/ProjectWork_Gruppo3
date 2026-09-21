import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email non valida" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password obbligatoria" })
  password!: string;
}