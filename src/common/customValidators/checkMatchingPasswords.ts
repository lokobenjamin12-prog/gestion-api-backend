import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPasswordMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const record = args.object as Record<string, unknown>;
          const relatedValue = record[property];
          return value === relatedValue;
        },
        defaultMessage() {
          return `${propertyName} must match ${property}`;
        },
      },
    });
  };
}
