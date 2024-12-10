import { Response, Request } from "express";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";
import { ProductSchema } from "../schemas/product";
import { prismaClient } from "..";

const productCtrl = {
    createProduct: async (req: Request, res: Response) => {

        try {
            ProductSchema.parse(req.body)

            const product = await prismaClient.product.create({
                data: {
                    name: req.body.name,
                    sku: req.body.sku,
                    description: req.body.description,
                    category: req.body.category,
                    subcategory: req.body.subcategory,
                    price: req.body.price,
                    tags: req.body.tags.join(','), // Convert array to a comma-separated string
                    originalPrice: req.body.originalPrice,
                    discountPercentage: req.body.discountPercentage,
                    stock: req.body.stock,
                    youtubeUrl: req.body.youtubeUrl,
                    brand: req.body.brand,
                    specifications: req.body.specifications,
                    variants: req.body.variants,
                    slug: req.body.slug,
                    metaTitle: req.body.metaTitle,
                    metaDescription: req.body.metaDescription,
                    isFeatured: req.body.isFeatured,
                    isActive: req.body.isActive,
                    isTrash: req.body.isTrash,
                    // Add product images if provided
                    images: req.body.images
                        ? {
                            create: req.body.images.map((image: string) => ({ url: image }))
                        }
                        : undefined,
                },
            });
            res.json(product)
        } catch (err) {
            console.log(err)
        }
    },

    updateProduct: async (req: Request, res: Response) => {
        try {
            const product = req.body;
            if (product.tags) {
                product.tags = product.tags.join(',')
            }
            const updateProduct_ = await prismaClient.product.update({
                where: {
                    id: +req.params.id
                },
                data: product
            })
            res.json(updateProduct_)

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
        try {
            // Get the value of 'skip' from the query parameters or default to 0
            const skip = req.query.skip ? +req.query.skip : 0;

            // Count the total number of products
            const count = await prismaClient.product.count();

            // Fetch products with pagination
            const products = await prismaClient.product.findMany({
                skip: skip,
                take: 5 // initially show only five 
            });

            // Send the response with product count and data
            res.json({
                count: count,
                status: "Success",
                data: products
            });

        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            throw new NotFoundException('Products not found.', ErrorCode.PRODUCT_NOT_FOUND);
        }

    },
    searchProducts: async (req: Request, res: Response) => {
        try {
            // Get the search query from the request parameters
            const searchQuery = req.query.q?.toString();

            if (!searchQuery) {
                return res.status(400).json({ error: 'Search query is required.' });
            }

            // Get pagination options from query parameters or use defaults
            const skip = req.query?.skip ? +req.query?.skip : 0;
            const take = req.query.take ? +req.query.take : 5;

            // Find products that match the search query
            const products = await prismaClient.product.findMany({
                where: {
                    OR: [
                        { name: { contains: searchQuery } },
                        { description: { contains: searchQuery } },
                        { tags: { contains: searchQuery } },
                    ]
                },
                skip: skip,
                take: take,
            });

            if (!products || products.length === 0) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            // Send the response with the search results
            res.json({ products });
            console.log("Search Query:", searchQuery);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
        }
    },

    // searchProducts: async (req: Request, res: Response) => {
    //     try {
    //         // Get the search query from the request parameters
    //         const searchQuery = req.query.q?.toString();

    //         // Get pagination options from query parameters or use defaults
    //         const skip = req.query?.skip ? +req.query?.skip : 0;
    //         const take = req.query.take ? +req.query.take : 5;

    //         // Find products that match the search query
    //         const products = await prismaClient.product.findMany({
    //             where: {
    //                 name: {
    //                     search: searchQuery
    //                 },
    //                 description: {
    //                     search: searchQuery,
    //                 },
    //                 tags: {
    //                     search: searchQuery,
    //                 }
    //             },

    //             skip: skip,
    //             take: take,
    //         });

    //         if (!products || products.length === 0) {
    //             throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
    //         }
    //         // Send the response with the search results
    //         res.json({ products });

    //     } catch (error) {
    //         res.status(500).json({ error: 'Internal Server Error to try search' });
    //         console.error(error)
    //         throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
    //     }
    //     console.log("search product ======================")
    // },

    getSingleProduct: async (req: Request, res: Response) => {
        try {
            const productId = parseInt(req.params.id);

            // Find the product with the specified ID
            const product = await prismaClient.product.findFirst({
                where: {
                    id: productId
                },
                include: {
                    reviews: true // Include the reviews related to this product
                }
            });

            if (!product) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
        }

        console.log("Single product ======================")
    },
};

export default productCtrl;