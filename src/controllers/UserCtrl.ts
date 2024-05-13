import { Response, Request } from "express";
import { prismaClient } from "..";
import { AddressSchema } from "../schemas/users";
import { User } from "@prisma/client";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";


const userCtrl = {
    addAddress: async (req: Request, res: Response) => {
        AddressSchema.parse(req.body)
        let user:User;

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

    }
}

export default userCtrl;