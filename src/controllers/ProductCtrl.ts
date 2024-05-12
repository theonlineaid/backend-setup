import { Response, Request } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";

type CustomStringFilter = {
    contains: string;
    mode: 'insensitive'; // Define the 'mode' property with a specific value
};

const productCtrl = {
    createProduct: async (req: Request, res: Response) => {
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

            // Check if the product ID is provided
            if (!productId || isNaN(productId)) {
                throw new NotFoundException('Product ID not provided or invalid.', ErrorCode.BAD_REQUEST);
            }

            // Attempt to delete the product
            const deleteProduct = await prismaClient.product.delete({
                where: { id: productId }
            });

            // Check if the product was successfully deleted
            if (!deleteProduct) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }

            // Respond with a success message
            res.json({ message: 'Product deleted successfully.' });
        } catch (err) {
            // Handle errors and return a meaningful response to the client;
            if (err instanceof NotFoundException) {
                // If the product was not found, return a 404 Not Found error
                res.status(404).json({ error: err.message });
            } else {
                // For other errors, return a generic 500 Internal Server Error
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    },
    listProducts: async (req: Request, res: Response) => {
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

    // getProductById: async (req: Request, res: Response) => {
    //     try {
    //         const productId = parseInt(req.params.id); // Parse the product ID from the request parameters
    //         console.log(productId)

    //         // Find the product with the specified ID
    //         const product = await prismaClient.product.findFirst({
    //             where: {
    //                 id: productId // Pass the product ID as an argument
    //             }
    //         });

    //         // Check if the product exists
    //         if (!product) {
    //             throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
    //         }

    //         // Send the response with the found product
    //         res.json(product);
    //     } catch (error) {
    //         // Handle any errors
    //         console.error(error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // },


    searchProducts: async (req: Request, res: Response) => {
        try {
            const searchQuery = req.query.q?.toString() || '';

            // Get pagination options from query parameters or use defaults
            // const skip = req.query.skip ? +req.query.skip : 0;
            // const take = req.query.take ? +req.query.take : 5;

            // Find products that match the search query
            const products = await prismaClient.product.findMany({
                where: {
                    OR: [
                        { name: { contains: searchQuery}},
                        { description: { contains: searchQuery}},
                        { tags: { contains: searchQuery}},
                    ],
                },
                // skip: skip,
                // take: take,
            });

            // Send the response with the search results
            res.json(products);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

};

export default productCtrl;