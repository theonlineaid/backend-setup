import { Response, Request, NextFunction } from "express";
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
        if (!user) {
            throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)
        }
        if (!compareSync(password, user.password)) {
            throw new BadRequestsException('Incorrect password', ErrorCode.INCORRECT_PASSWORD)
        }
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)


        res.json({ user, token })
    },

    me: async (req: Request, res: Response) => {
        res.json((req as any)?.user);
    }

};

export default authCtrl;