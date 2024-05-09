import { Response, Request } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/secret";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { BadRequestsException } from "../exceptions/exceptions";
import { SignUpSchema } from "../schemas/users";

const authCtrl = {

    register: async (req: Request, res: Response) => {

        SignUpSchema.parse(req.body)
        const { email, password, name } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email: email } })

        if (user) {
            new BadRequestsException('User already exist.', ErrorCode.USER_ALREADY_EXISTS)
        }
        user = await prismaClient.user.create({
            data: {
                email,
                password: hashSync(password, 10),
                name
            }
        })

        res.json(user)
    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email } })
        if (!user) throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)

        if (!compareSync(password, user.password)) {
            throw new BadRequestsException('Incorrect password', ErrorCode.INCORRECT_PASSWORD)
        }

        if (!email) throw new NotFoundException('Please give your email.', ErrorCode.USER_NOT_FOUND)

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)

        res.json({ user, token })
    },

    logout: async (req: Request, res: Response) => {
        res.clearCookie('jwtToken');

        res.json({ message: "Logout successful" });
    },

    me: async (req: Request, res: Response) => {
        res.json((req as any)?.user);
    },

    changePassword: async (req: Request, res: Response) => {
        
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
    }

};

export default authCtrl;