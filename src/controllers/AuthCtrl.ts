import { Response, Request } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";

const authCtrl = {

    register: async (req: Request, res: Response) => {
        const { email, password, name } = req.body;

        let user = await prismaClient.user.findFirst({ where: { email: email } })


        if (user) {
            res.status(400).json({ message: `User already exists` })
            throw Error('User already exists');
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
        const { email } = req.body;
        try {
            const user = await prismaClient.user.findFirst({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: `User doesn't exist` });
            }
            // Generate JWT token without including the password
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
            // Send user data and token back to the client
            res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // login: async (req: Request, res: Response) => {
    //     const { email, password } = req.body;

    //     let user = await prismaClient.user.findFirst({ where: { email } })


    //     if (!user) {
    //         throw Error(`User doesn't exists`)
    //     }

    //     if (!compareSync(password, user.password)) {
    //         res.status(400).json({ message: `Incorrect password` })
    //     }

    //     const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })

    //     res.json({user, token})

    // },
};

export default authCtrl;