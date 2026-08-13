"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsPasswordStrong = IsPasswordStrong;
const class_validator_1 = require("class-validator");
function IsPasswordStrong(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isPasswordStrong',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    if (value.length < 8) {
                        return false;
                    }
                    if (!/[A-Z]/.test(value)) {
                        return false;
                    }
                    if (!/[0-9]/.test(value)) {
                        return false;
                    }
                    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
                        return false;
                    }
                    return true;
                },
                defaultMessage(args) {
                    return `${args.property} must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character`;
                },
            },
        });
    };
}
//# sourceMappingURL=checkPasswordStrength.js.map