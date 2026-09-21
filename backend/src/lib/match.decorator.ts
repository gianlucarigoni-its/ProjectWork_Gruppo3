import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "Match" })
class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [nomeProprietaDaConfrontare] = args.constraints;
    const oggettoCorrelato = args.object as Record<string, unknown>;
    return value === oggettoCorrelato[nomeProprietaDaConfrontare];
  }

  defaultMessage(args: ValidationArguments): string {
    const [nomeProprietaDaConfrontare] = args.constraints;
    return `Il campo ${args.property} deve coincidere con ${nomeProprietaDaConfrontare}`;
  }
}

export function Match(nomeProprietaDaConfrontare: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [nomeProprietaDaConfrontare],
      validator: MatchConstraint,
    });
  };
}