// Create a file (e.g., express.d.ts) in your project's root directory

// Import the express module
import express from "express";
import { User } from "@prisma/client";

// Augment the Request interface to include the 'user' property
declare module 'express' {
    interface Request {
        user: User; // Adjust the type of 'user' property as needed
    }
}


// import { User } from "@prisma/client";
// import express  from "express";

// declare module 'express' {
//     export interface Request {
//         user: User
//     }
// }
