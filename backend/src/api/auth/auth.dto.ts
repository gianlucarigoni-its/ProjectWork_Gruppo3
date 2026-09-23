import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Email non valida" })
  username!: string;

  @IsString()
  @MinLength(8, { message: "La password deve contenere almeno 8 caratteri" })
  @Matches(/(?=.*[A-Z])/, { message: "La password deve contenere almeno una lettera maiuscola" })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: "La password deve contenere almeno un simbolo" })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Conferma password obbligatoria" })
  confermaPassword!: string;

  @IsString()
  @IsNotEmpty({ message: "Nome titolare obbligatorio" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Cognome titolare obbligatorio" })
  lastName!: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Email non valida" })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: "Password obbligatoria" })
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @Matches(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"), {
    message: "password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.",
  })
  newPassword: string;
}
