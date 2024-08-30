import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Onlineaid API',
            version: '1.0.0',
            description: 'A simple API documentation',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}/api`,
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],// Adjust the path to your route files
});

export { swaggerSpec, swaggerUi };
