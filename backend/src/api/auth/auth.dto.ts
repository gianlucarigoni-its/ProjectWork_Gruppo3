import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";
import { Match } from "../../lib/match.decorator";

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
  @Match("password", { message: "Le password non coincidono" })
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
