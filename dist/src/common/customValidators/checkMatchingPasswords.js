"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsPasswordMatch = IsPasswordMatch;
const class_validator_1 = require("class-validator");
function IsPasswordMatch(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isPasswordMatch',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value, args) {
                    const record = args.object;
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
//# sourceMappingURL=checkMatchingPasswords.js.map