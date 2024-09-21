import { Response, Request } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import { v4 as uuid } from 'uuid';
import { JWT_SECRET, PORT } from "../utils/secret";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { BadRequestsException } from "../exceptions/exceptions";
import { SignUpSchema } from "../schemas/users";
import { ZodError } from 'zod';
import { getPublicIpAndLocation, getUserAgentInfo } from "../utils/userUtils";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../middlewares/welcomeMessage";
import fs from 'fs';
import path from 'path';



const authCtrl = {



    register: async (req: Request, res: Response) => {

        let profileImage = '';
        try {

            const { email, password, name, bio, ssn, phoneNumber, dateOfBirth, gender, userName } = req.body;
            // const files = req.files as Express.Multer.File[];
            // const profileImage = req.file?.filename;

            // Ensure all required fields are provided
            if (!email) throw new BadRequestsException('Email is required.', ErrorCode.VALIDATION_ERROR)
            if (!password) throw new BadRequestsException('Password is required.', ErrorCode.VALIDATION_ERROR)
            if (!userName) throw new BadRequestsException('User name is required.', ErrorCode.VALIDATION_ERROR)
            if (!name) throw new BadRequestsException('Name is required.', ErrorCode.VALIDATION_ERROR)

            // Validate request body against the schema (optional but keeps your validation centralized)
            SignUpSchema.parse(req.body);


            // All validations passed, now process the image if uploaded
            if (req.file) {
                const userFolderPath = path.join('uploads', userName);
                const imageFullPath = path.join(userFolderPath, req.file.filename);
                profileImage = `http://${req.hostname}:${PORT}/${imageFullPath}`;

                // Optionally create a folder if it doesn't exist
                if (!fs.existsSync(userFolderPath)) {
                    fs.mkdirSync(userFolderPath, { recursive: true });
                }

                // Move the image to the correct folder
                fs.renameSync(req.file.path, imageFullPath); // Moves the file
            }

            // Check if the user already exists by email and userName
            const userByEmail = await prismaClient.user.findFirst({ where: { email: email } });
            const userByUserName = await prismaClient.user.findFirst({ where: { userName: userName } });

            if (userByEmail) throw new BadRequestsException('User with this email already exists.', ErrorCode.USER_ALREADY_EXISTS);
            if (userByUserName) throw new BadRequestsException('User with this username already exists.', ErrorCode.USER_ALREADY_EXISTS)

            const userAgentString = req.headers['user-agent'] || '';
            const userAgentInfo = getUserAgentInfo(userAgentString);
            const { publicIp, location } = await getPublicIpAndLocation();

            // Construct the full URL for the profile image
            // const imagePath = profileImage ? `http://${req.hostname}:${PORT}/uploads/${userName}/${profileImage}` : '';

            // Create a new user in the database
            const user = await prismaClient.user.create({
                data: {
                    email,
                    password: hashSync(password, 10),
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
                    profileImage: profileImage
                }
            });

            // Send success response
            res.status(201).json({
                message: "Successfully created a user",
                status: "Success",
                user: user,
                timestamp: new Date().toISOString(),
                requestId: uuid(),  // Include a unique request ID if needed
                metadata: {
                    serverTime: new Date().toISOString()
                }
            });

            // Send welcome email (async)
            await sendWelcomeEmail(email, name);

        } catch (error: any) {
            // If there's an error and the profileImage is uploaded, delete it
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
                    errors: formattedErrors, // Provide the validation errors in the response
                });
            } else if (error instanceof BadRequestsException) {
                // Handle custom application errors
                return res.status(400).json({ message: error.message });
            } else {
                // Handle internal server error
                console.error('Internal server error:', error);  // Log the full error
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    },


    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            let user = await prismaClient.user.findFirst({ where: { email } })
            if (!user) throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)

            if (!compareSync(password, user.password)) {
                res.json({ message: `Incorrect password ${ErrorCode.INCORRECT_PASSWORD}` });
                throw new BadRequestsException('Incorrect password', ErrorCode.INCORRECT_PASSWORD)
            }

            if (!email) throw new NotFoundException('Please give your email.', ErrorCode.USER_NOT_FOUND)

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
            const token = {
                accessToken,
                refreshToken
            }


            // const access = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '3d' })
            // const refresh = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

            // const token = {
            //     access,
            //     refresh
            // }
            // res.json({ user, token })

            res.json({ user, token })


        } catch (error: any) {
            if (error instanceof NotFoundException || error instanceof BadRequestsException) {
                // Handle known errors
                res.status(400).json({ message: error.message });
            } else {
                // Handle unexpected errors
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    },

    // refreshToken : async (req: Request, res: Response) => {
    //     const { refreshToken } = req.cookies;

    //     if (!refreshToken) {
    //         return res.status(401).json({ message: 'Unauthorized' });
    //     }

    //     try {
    //         const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
    //         const newAccessToken = jwt.sign({ userId: payload.userId }, ACCESS_TOKEN_SECRET, { expiresIn: '3d' });

    //         res.cookie('accessToken', newAccessToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    //             sameSite: 'Strict',
    //         });

    //         res.status(200).json({ message: 'Token refreshed' });
    //     } catch (error) {
    //         res.status(401).json({ message: 'Unauthorized' });
    //     }
    // },


    // logout: async (req: Request, res: Response) => {
    //     res.clearCookie('jwtToken');

    //     res.json({ message: "Logout successful" });
    // },

    logout: async (req: Request, res: Response) => {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    },

    me: async (req: Request, res: Response) => {
        res.json((req as any)?.user);
    },

    changeMyPassword: async (req: Request, res: Response) => {

        // Ensure that req.user is of the correct type
        const user = req.user as { id: number };
        const { id: userId } = user; // Destructure the id property from user


        const { oldPassword, newPassword } = req.body;

        try {
            // Find the user by userId
            const user = await prismaClient.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND);
            }

            // Check if the old password matches the stored hashed password
            if (!compareSync(oldPassword, user.password)) {
                throw new BadRequestsException('Incorrect old password', ErrorCode.INCORRECT_PASSWORD);
            }

            // Hash the new password
            const hashedPassword = hashSync(newPassword, 10);

            // Update the user's password in the database using Prisma
            await prismaClient.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.json({ message: "Password changed successfully" });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestsException) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    },

    deleteMyAccount: async (req: Request, res: Response) => {

        try {
            await prismaClient.user.delete({
                where: {
                    id: +req.params.id
                }
            })
            res.json({ success: true })

        } catch (err) {
            throw new NotFoundException('User not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }

    },

};

export default authCtrl;