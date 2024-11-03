"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserAddressSchema = exports.AddressSchema = exports.SignUpSchema = void 0;
const zod_1 = require("zod");
exports.SignUpSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    userName: zod_1.z.string()
        .min(4, "Username must be at least 4 characters long")
        .max(12, "Username must not exceed 12 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers") // Alphanumeric only
        .transform((val) => val.toLowerCase()) // Convert to lowercase
});
exports.AddressSchema = zod_1.z.object({
    lineOne: zod_1.z.string(),
    lineTwo: zod_1.z.string().optional(),
    pincode: zod_1.z.string().length(6),
    type: zod_1.z.string().max(10),
    country: zod_1.z.string(),
    city: zod_1.z.string(),
});
exports.UpdateUserAddressSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    defaultShippingAddress: zod_1.z.number().optional(),
    defaultBillingAddress: zod_1.z.number().optional()
});
