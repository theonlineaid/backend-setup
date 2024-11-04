import fs from 'fs';
import path from 'path';
import jwt from "jsonwebtoken";
import { ZodError } from 'zod';
import { v4 as uuid } from 'uuid';
import { prismaClient } from "..";
import { Response, Request } from "express";
import { hashSync, compareSync } from "bcrypt";
import { ErrorCode } from "../exceptions/root";
import { SignUpSchema } from "../schemas/users";
import { JWT_SECRET, PORT } from "../utils/secret";
import { NotFoundException } from "../exceptions/notFound";
import { BadRequestsException } from "../exceptions/exceptions";
import { sendWelcomeEmail } from "../middlewares/welcomeMessage";
import { getPublicIpAndLocation, getUserAgentInfo } from "../utils/userUtils";



const authCtrl = {

    register: async (req: Request, res: Response) => {
        let profileImage: string | undefined = ''; // Get the uploaded file's name

        try {
            const { email, password, name, bio, ssn, phoneNumber, dateOfBirth, gender, userName } = req.body;
            profileImage = req.file?.filename; // Get the uploaded file's name

            // Ensure all required fields are provided
            if (!email) throw new BadRequestsException('Email is required.', ErrorCode.VALIDATION_ERROR);
            if (!password) throw new BadRequestsException('Password is required.', ErrorCode.VALIDATION_ERROR);
            if (!userName) throw new BadRequestsException('User name is required.', ErrorCode.VALIDATION_ERROR);
            if (!name) throw new BadRequestsException('Name is required.', ErrorCode.VALIDATION_ERROR);

            // Validate request body against the schema
            SignUpSchema.parse(req.body);

            // Check if the user already exists by email and userName
            const userByEmail = await prismaClient.user.findFirst({ where: { email } });
            const userByUserName = await prismaClient.user.findFirst({ where: { userName } });

            if (userByEmail) throw new BadRequestsException('User with this email already exists.', ErrorCode.USER_ALREADY_EXISTS);
            if (userByUserName) throw new BadRequestsException('User with this username already exists.', ErrorCode.USER_ALREADY_EXISTS);

            // Retrieve user agent info and public IP
            const userAgentString = req.headers['user-agent'] || '';
            const userAgentInfo = getUserAgentInfo(userAgentString);
            const { publicIp, location } = await getPublicIpAndLocation();

            

            // Create a new user in the database
            const user = await prismaClient.user.create({
                data: {
                    email,
                    password: hashSync(password, 10), // Hash the password
                    name,
                    userName,
                    bio: bio || '', // Default to an empty string if bio is not provided
                    ssn,
                    phoneNumber,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // Convert dateOfBirth to a Date object
                    gender,
                    userAgentInfo,
                    ipAddress: publicIp, // Store IP address
                    location,
                    profileImage: profileImage || '' // Store the uploaded image file name, if exists
                }
            });

            sendWelcomeEmail(email, name);

            // Send success response
            res.status(201).json({
                message: "Successfully created a user",
                status: "Success",
                user: user,
                timestamp: new Date().toISOString(),
                requestId: uuid(),
                metadata: {
                    serverTime: new Date().toISOString()
                }
            });

           

        } catch (error: any) {

            if (req.file && profileImage) {
                fs.unlinkSync(req.file.path); // Deletes the uploaded file
            }
            if (error instanceof ZodError) {
                // Handle Zod validation errors
                const formattedErrors = error.errors.map((err: any) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                return res.status(400).json({
                    message: "Validation error",
                    errors: formattedErrors,
                });
            } else if (error instanceof BadRequestsException) {
                // Handle custom application errors
                return res.status(400).json({ message: error.message });
            } else {
                // Handle internal server error
                console.error('Internal server error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            // Check if user exists
            const user = await prismaClient.user.findFirst({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: `User not found ${ErrorCode.USER_NOT_FOUND}.` });
            }

            // Check if password matches
            if (!compareSync(password, user.password)) {
                return res.status(400).json({ message: `Incorrect password ${ErrorCode.INCORRECT_PASSWORD}` });
            }

            // Ensure email is provided
            if (!email) {
                return res.status(400).json({ message: `Please provide your email. ${ErrorCode.EMAIL_NOT_FOUND}` });
            }

            // Generate tokens
            const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '3d' });
            const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

            // Set tokens in cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Respond with user and tokens
            res.json({ user, token: { accessToken, refreshToken } });

        } catch (error: any) {
            if (error instanceof NotFoundException || error instanceof BadRequestsException) {
                // Handle known errors
                res.status(400).json({ message: error.message });
            } else {
                // Handle unexpected errors
                res.status(500).json({ message: 'Internal server error' });
            }
            // // Handle unexpected errors
            // res.status(500).json({ message: 'Internal server error' });
        }
    },

    logout: async (req: Request, res: Response) => {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    },

    me: async (req: Request, res: Response) => {
        res.json((req as any)?.user);
    },

    changeMyPassword: async (req: Request, res: Response) => {
        const { id: userId } = req.params; // Get the user ID from the request parameters
        const { oldPassword, newPassword } = req.body;

        try {
            // Find the user by userId from the request parameters
            const user = await prismaClient.user.findUnique({ where: { id: Number(userId) } });
            if (!user) {
                // If the user does not exist, return an error
                return res.status(404).json({ error: 'User not found.' });
            }

            // Check if the old password matches the stored hashed password
            if (!compareSync(oldPassword, user.password)) {
                throw new BadRequestsException('Incorrect old password', ErrorCode.INCORRECT_PASSWORD);
            }

            // Hash the new password
            const hashedPassword = hashSync(newPassword, 10);

            // Update the user's password in the database using Prisma
            await prismaClient.user.update({
                where: { id: user.id }, // Use the existing user ID
                data: { password: hashedPassword }
            });

            // Respond with a success message
            res.json({ message: "Password changed successfully" });
        } catch (error) {
            // Handle known errors
            if (error instanceof NotFoundException || error instanceof BadRequestsException) {
                res.status(400).json({ error: error.message });
            } else {
                // Handle unexpected errors
                console.error('Error changing password:', error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    },

    deleteMyAccount: async (req: Request, res: Response) => {
        try {
            // Fetch the user from the database to retrieve their profile image and folder path
            const user: any = await prismaClient.user.findUnique({
                where: {
                    id: +req.params.id
                },
            });

            if (!user) {
                throw new NotFoundException('User not found.', ErrorCode.ADDRESS_NOT_FOUND);
            }

            // If the user has a profile image, attempt to delete it
            if (user?.profileImage) {
                const userFolderPath = path.join('uploads', user.userName); // Assuming you store images in a folder named after the username

                // Delete the profile image file if it exists
                const imageFileName: any = user.profileImage.split('/').pop(); // Extract file name from profileImage URL
                const imageFullPath = path.join(userFolderPath, imageFileName);

                if (fs.existsSync(imageFullPath)) {
                    fs.unlinkSync(imageFullPath); // Deletes the image file
                }

                // Delete the user folder if it exists and is empty
                if (fs.existsSync(userFolderPath)) {
                    fs.rmSync(userFolderPath, { recursive: true, force: true });
                    // @deprecated
                    // fs.rmdirSync(userFolderPath, { recursive: true });
                }

            }

            // Delete the user from the database
            await prismaClient.user.delete({
                where: {
                    id: +req.params.id
                }
            });

            // Respond with success
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (err) {
            // Handle user not found error or other exceptions
            if (err instanceof NotFoundException) {
                return res.status(404).json({ message: err.message });
            }

            console.error('Error deleting account:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Update user profile and cover images
    updateUser: async (req: Request, res: Response) => {
        let profileImage: string | undefined; // Initialize variable for profile image
    
        try {
            const userId = req.user?.id; // Get user ID from the authenticated user (via auth middleware)
            const { userName } = req.body;
    
            // Validate userId
            if (!userId || isNaN(Number(userId))) {
                throw new BadRequestsException('Invalid user ID.', ErrorCode.VALIDATION_ERROR);
            }
    
            // Retrieve existing user data
            const existingUser = await prismaClient.user.findUnique({ where: { id: Number(userId) } });
    
            if (!existingUser) {
                throw new BadRequestsException('User not found.', ErrorCode.USER_NOT_FOUND);
            }
    
            // Handle profile image upload
            if (req.file) {
                profileImage = req.file?.filename; // Get the new profile image filename
    
                // Construct the path for the old profile image
                const oldProfileImagePath = path.join('uploads', existingUser.userName, existingUser.profileImage);
                // Delete the old profile image if it exists
                if (existingUser.profileImage && fs.existsSync(oldProfileImagePath)) {
                    fs.unlinkSync(oldProfileImagePath); // Delete the old profile image
                }
            } else {
                throw new BadRequestsException('Profile image is required.', ErrorCode.VALIDATION_ERROR);
            }
    
            // Update user profile image in the database
            const updatedUser = await prismaClient.user.update({
                where: { id: Number(userId) },
                data: {
                    profileImage: `uploads/${existingUser.userName}/${profileImage}`, // Update the path in the database
                    userName: userName || existingUser.userName, // Update userName if provided, else keep the old one
                    // You can add other fields to update here (email, bio, etc.)
                },
            });
    
            // Send success response
            res.status(200).json({
                message: 'Profile image updated successfully',
                status: 'Success',
                user: updatedUser,
                timestamp: new Date().toISOString(),
            });
    
        } catch (error: any) {
            // Handle any errors that may have occurred
            if (error instanceof BadRequestsException) {
                return res.status(400).json({ message: error.message });
            } else {
                console.error('Internal server error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
}

export default authCtrl;