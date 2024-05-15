import { Response, Request } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { ProductSchema } from "../schemas/product";

const productCtrl = {
    createProduct: async (req: Request, res: Response) => {
        
        ProductSchema.parse(req.body)

        const product = await prismaClient.product.create({
            data: {
                ...req.body,
                tags: req.body.tags.join(',')
            }
        })
        res.json(product)
    },

    updataProduct: async (req: Request, res: Response) => {
        try {
            const product = req.body;
            if (product.tags) {
                product.tags = product.tags.join(',')
            }
            const updateProduct = await prismaClient.product.update({
                where: {
                    id: +req.params.id
                },
                data: product
            })
            res.json(updateProduct)

        } catch (err) {
            throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND)
        }
    },

    deleteProduct: async (req: Request, res: Response) => {

        try {
            const productId = +req.params.id;

            await prismaClient.product.delete({
                where: {
                    id: productId
                }
            })
            res.json({ success: true, message: 'Product deleted successfully.' })

        } catch (err) {
            throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND)
        }

    },


    getAllProducts: async (req: Request, res: Response) => {
        // Get the value of 'skip' from the query parameters or default to 0
        const skip = req.query.skip ? +req.query.skip : 0;

        // Count the total number of products
        const count = await prismaClient.product.count();

        // Fetch products with pagination
        const products = await prismaClient.product.findMany({
            skip: skip,
            take: 5 // initially show only five producs 
        });

        // Send the response with product count and data
        res.json({
            count: count,
            data: products
        });

    },

    getSingleProduct: async (req: Request, res: Response) => {
        try {
            const productId = parseInt(req.params.id);

            // Find the product with the specified ID
            const product = await prismaClient.product.findFirst({
                where: {
                    id: productId // Pass the product ID as an argument
                }
            });

            if (!product) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // searchProducts: async (req: Request, res: Response) => {
    //     // Get the search query from the request parameters
    //     const searchQuery = req.query.q?.toString() || '';
    
    //     // Get pagination options from query parameters or use defaults
    //     const skip = req.query.skip ? +req.query.skip : 0;
    //     const take = req.query.take ? +req.query.take : 5;
    
    //     // Find products that match the search query
    //     const products = await prismaClient.product.findMany({
    //         where: {
    //             OR: [
    //                 { name: { contains: searchQuery, mode: 'insensitive' as 'insensitive' } as CustomStringFilter },
    //                 { description: { contains: searchQuery, mode: 'insensitive' as 'insensitive' } as CustomStringFilter },
    //                 { tags: { contains: searchQuery, mode: 'insensitive' as 'insensitive' } as CustomStringFilter },
    //             ],
    //         },
    //         skip: skip,
    //         take: take,
    //     });
    
    
    //     // Send the response with the search results
    //     res.json(products);
    // }
    

};

export default productCtrl;