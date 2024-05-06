// Create a file (e.g., express.d.ts) in your project's root directory

// Import the express module
import { User } from "@prisma/client";
import { Request } from 'express';

// Augment the Request interface to include the 'user' property
declare module 'express' {
    interface Request {
        user?: any; // Adjust the type of 'user' property as needed
    }
}
