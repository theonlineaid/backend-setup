import { z } from 'zod';

export const SignUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    userName: z.string()
        .min(4, "Username must be at least 4 characters long")
        .max(12, "Username must not exceed 12 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers") // Alphanumeric only
        .transform((val) => val.toLowerCase())  // Convert to lowercase
});


export const AddressSchema = z.object({
    lineOne: z.string(),
    lineTwo: z.string().optional(),
    pincode: z.string().length(6),
    type: z.string().max(10),
    country: z.string(),
    city: z.string(),
})

export const UpdateUserAddressSchema = z.object({
    name: z.string().optional(),
    defaultShippingAddress: z.number().optional(),
    defaultBillingAddress: z.number().optional()
})