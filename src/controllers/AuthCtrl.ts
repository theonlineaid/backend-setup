import { Response, Request } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { IPINFO_TOKEN, JWT_SECRET } from "../utils/secret";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { BadRequestsException } from "../exceptions/exceptions";
import { SignUpSchema } from "../schemas/users";
import parser from 'ua-parser-js';
import axios from 'axios';
import { getPublicIp } from "../utils/getPublicIp";

const authCtrl = {

    register: async (req: Request, res: Response) => {

        SignUpSchema.parse(req.body)
        // Destructure the necessary fields from the request body
        const { email, password, name, bio, ssn, phoneNumber, dateOfBirth, gender } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email: email } })

        if (user) {
            new BadRequestsException('User already exist.', ErrorCode.USER_ALREADY_EXISTS)
        }
        const userAgentString = req.headers['user-agent'];
        const userAgentInfo = parser(userAgentString);

        // Get the public IP address
        let publicIp = '';
        try {
            publicIp = await getPublicIp();
            console.log("Public IP Address:", publicIp);
        } catch (err: any) {
            console.error('Error fetching public IP:', err.message);
        }

        // Optional: Get additional location details
        let location = null;
        if (publicIp && publicIp !== '::1' && publicIp !== '127.0.0.1') {
            try {
                const response = await axios.get(`https://ipinfo.io/${publicIp}?token=${IPINFO_TOKEN}`);
                console.log("IPinfo Response:", response.data);
                location = response.data;
            } catch (err: any) {
                console.error('Error fetching location:', err.message);
            }
        } else {
            console.log("Local IP address detected, skipping location lookup.");
        }

        user = await prismaClient.user.create({
            data: {
                email,
                password: hashSync(password, 10),
                name,
                bio: bio || '', // Default to an empty string if bio is not provided
                ssn,
                phoneNumber,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // Convert dateOfBirth to a Date object
                gender,
                userAgentInfo,
                ipAddress: publicIp, // Store IP address
                location
            }
        })

        res.json(user)


    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email } })
        if (!user) throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)

        if (!compareSync(password, user.password)) {
            res.json({ message: `Incorrect password ${ErrorCode.INCORRECT_PASSWORD}` });
            throw new BadRequestsException('Incorrect password', ErrorCode.INCORRECT_PASSWORD)
        }

        if (!email) throw new NotFoundException('Please give your email.', ErrorCode.USER_NOT_FOUND)


        const access = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15d' })
        const refresh = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        const token = {
            access,
            refresh
        }

        res.json({ user, token })
    },

    logout: async (req: Request, res: Response) => {
        res.clearCookie('jwtToken');

        res.json({ message: "Logout successful" });
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