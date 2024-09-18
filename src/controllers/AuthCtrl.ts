import { Response, Request } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from 'uuid';
import { IPINFO_TOKEN, JWT_SECRET } from "../utils/secret";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { BadRequestsException } from "../exceptions/exceptions";
import { SignUpSchema } from "../schemas/users";
import parser, { IResult } from 'ua-parser-js';
import axios from 'axios';
import { getPublicIp } from "../utils/getPublicIp";
import DeviceDetector from "device-detector-js";
import { sendWelcomeEmail } from "../middlewares/welcomeMessage";
import { InternalException } from "../exceptions/internalException";

const authCtrl = {

    register: async (req: Request, res: Response) => {
        try {
            // Destructure the necessary fields from the request body
            const { email, password, name, bio, ssn, phoneNumber, dateOfBirth, gender, profileImage, userName } = req.body;

            // Ensure all required fields are provided
            if (!email) {
                throw new BadRequestsException('Email is required.', ErrorCode.VALIDATION_ERROR);
            }
            if (!password) {
                throw new BadRequestsException('Password is required.', ErrorCode.VALIDATION_ERROR);
            }
            if (!userName) {
                throw new BadRequestsException('User name is required.', ErrorCode.VALIDATION_ERROR);
            }
            if (!name) {
                throw new BadRequestsException('Name is required.', ErrorCode.VALIDATION_ERROR);
            }

            // Validate request body against the schema (optional but keeps your validation centralized)
            SignUpSchema.parse(req.body);

            // Check if the user already exists by email and userName
            const userByEmail = await prismaClient.user.findFirst({ where: { email: email } });
            const userByUserName = await prismaClient.user.findFirst({ where: { userName: userName } });

            if (userByEmail) {
                throw new BadRequestsException('User with this email already exists.', ErrorCode.USER_ALREADY_EXISTS);
            }

            if (userByUserName) {
                throw new BadRequestsException('User with this username already exists.', ErrorCode.USER_ALREADY_EXISTS);
            }
            // =========================================
            // Parse user agent information
            const userAgentString = req.headers['user-agent'] || '';
            const userAgentInfo: IResult = parser(userAgentString);

            const deviceDetector = new DeviceDetector();
            const userAgent = userAgentInfo.ua;
            const deviceInfo = deviceDetector.parse(userAgent);

            // Update userAgentInfo with device details
            userAgentInfo.device = {
                model: deviceInfo.device?.model || '',
                type: deviceInfo.device?.type || '',
                vendor: deviceInfo.device?.brand || '',
            };

            // Get the public IP address
            let publicIp = '';
            try {
                publicIp = await getPublicIp();
            } catch (err: any) {
                console.error('Error fetching public IP:', err.message);
            }

            // Get additional location details based on IP address
            let location = null;
            if (publicIp && publicIp !== '::1' && publicIp !== '127.0.0.1') {
                try {
                    const response = await axios.get(`https://ipinfo.io/${publicIp}?token=${IPINFO_TOKEN}`);
                    location = response.data;
                } catch (err: any) {
                    console.error('Error fetching location:', err.message);
                }
            }

            // =========================================


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
                    profileImage
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
            // await sendWelcomeEmail(email, name);

        } catch (error: any) {
            // Send error response in JSON format
            if (error instanceof BadRequestsException) {
                res.status(400).json({ message: error.message });
            } else {
                console.error('Internal server error:', error);  // Log the full error for debugging
                res.status(500).json({ message: 'Internal server error' });
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