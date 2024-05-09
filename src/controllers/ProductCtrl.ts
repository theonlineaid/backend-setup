import { Response, Request } from "express";
import { prismaClient } from "..";

const productCtrl = {
    createProduct: async (req: Request, res: Response) => {
        const product = await prismaClient.product.create({
            data: {
                ...req.body,
                tags: req.body.tags.join(',')
            }
        })
        res.json(product)
    }
};

export default productCtrl;