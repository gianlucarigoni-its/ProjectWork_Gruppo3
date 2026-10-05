import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsMongoId } from "class-validator";

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
  oldPassword!: string;

  @IsString()
  @Matches(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$"), {
    message: "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un simbolo.",
  })
  newPassword!: string;

  @IsString()
  confirmPassword!: string;
}

export class VerifyEmailDto {
  @IsString()
  token!: string;
}