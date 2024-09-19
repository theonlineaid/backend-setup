import { Response, Request } from "express";
import { prismaClient } from "..";
import { AddressSchema, SignUpSchema, UpdateUserAddressSchema } from "../schemas/users";
import { Address, User } from "@prisma/client";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { BadRequestsException } from "../exceptions/exceptions";
import { hashSync } from "bcrypt";


const userCtrl = {
    addAddress: async (req: Request, res: Response) => {
        AddressSchema.parse(req.body)
        let user: User;

        // try {
        //     user = await prismaClient.user.findFirstOrThrow({
        //         where : {
        //             id: req.body.userId
        //         }
        //     })

        // } catch (error) {
        //     throw new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND)
        // }

        const address = await prismaClient.address.create({
            data: {
                ...req.body,
                userId: req.user.id
            }
        })

        res.json(address)

    },

    updateAddress: async (req: Request, res: Response) => {
        try {
            const address = await prismaClient.address.update({
                where: {
                    id: +req.params.id
                },
                data: req.body
            })
            res.json(address)
        } catch (err) {
            throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }
    },

    deleteAddress: async (req: Request, res: Response) => {

        try {
            await prismaClient.address.delete({
                where: {
                    id: +req.params.id
                }
            })
            res.json({ success: true })

        } catch (err) {
            throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }

    },

    getAddressById: async (req: Request, res: Response) => {
        try {
            const address = await prismaClient.address.findFirst({
                where: {
                    id: +req.params.id
                }
            })
            res.json(address)
        } catch (err) {
            throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
        }
    },

    getAllAddress: async (req: Request, res: Response) => {
        const addresses = await prismaClient.address.findMany({

            skip: req.query.skip ? +req.query.skip : 0,
            take: 5,

            where: {
                userId: req.user.id
            }
        })

        res.json(addresses)

    },

    updateDefaultUserAddress: async (req: Request, res: Response) => {
        const validatedData = UpdateUserAddressSchema.parse(req.body)
        let shippingAddress: Address;
        let billingAddress: Address;
        console.log(validatedData)
        if (validatedData.defaultShippingAddress) {
            try {
                shippingAddress = await prismaClient.address.findFirstOrThrow({
                    where: {
                        id: validatedData.defaultShippingAddress
                    }
                })

            } catch (error) {
                throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
            }
            if (shippingAddress.userId != req.user.id) {
                throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG)
            }
        }
        if (validatedData.defaultBillingAddress) {
            try {
                billingAddress = await prismaClient.address.findFirstOrThrow({
                    where: {
                        id: validatedData.defaultBillingAddress
                    }
                })

            } catch (error) {
                throw new NotFoundException('Address not found.', ErrorCode.ADDRESS_NOT_FOUND)
            }
            if (billingAddress.userId != req.user.id) {
                throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG)
            }
        }

        const updatedUser = await prismaClient.user.update({
            where: {
                id: req.user.id
            },
            data: validatedData
        })
        res.json(updatedUser)


    },

    // ========= User relate functions by admin =========
    getAllUsersByAdmin: async (req: Request, res: Response) => {

        // --> /users will return the first five users. or users?skip=0
        // --> /users?skip=5 will return the next five users.
        // --> /users?skip=10 will return the users after skipping the first ten users, and so on.
        const users = await prismaClient.user.findMany({
            skip: req.query.skip ? +req.query.skip : 0,
            take: 5,

            // We don't need password 
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                role: true,
                password: false
            }
        })
        res.json(users)

    },

    getSingleUserByAdmin: async (req: Request, res: Response) => {
        try {
            const user = await prismaClient.user.findFirstOrThrow({
                where: {
                    id: +req.params.id
                },
                // include: {
                //     addresses: true
                // }

                // We dont need password 
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true,
                    createdAt: true,
                    updatedAt: true,
                    role: true,
                    password: false
                }
            })
            res.json(user)

        } catch (err) {
            throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)
        }
    },

    addUserByAdmin: async (req: Request, res: Response) => {
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

    deleteUserByAdmin: async (req: Request, res: Response) => {
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

    changeUserRoleByAdmin: async (req: Request, res: Response) => {
        // Validation 
        try {
            const user = await prismaClient.user.update({
                where: {
                    id: +req.params.id
                },
                data: {
                    role: req.body.role
                }
            })
            res.json(user)

        } catch (err) {
            throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND)
        }
    }
}

export default userCtrl;