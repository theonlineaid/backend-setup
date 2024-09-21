"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const swaggerSpec_1 = require("../docs/swaggerSpec");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const error_1 = require("./middlewares/error");
const secret_1 = require("./utils/secret");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// import path from 'path';
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('tiny'));
// Middleware 
app.use(express_1.default.json());
// app.use(cors())
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true, // Enable cookies and credentials
}));
// Static folder to serve uploaded images
// app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use((0, cookie_parser_1.default)());
app.use(error_1.errorMiddleware);
app.use('/api', routes_1.default);
app.use('/api-docs', swaggerSpec_1.swaggerUi.serve, swaggerSpec_1.swaggerUi.setup(swaggerSpec_1.swaggerSpec));
exports.prismaClient = new client_1.PrismaClient({
    log: ['query']
}).$extends({
    result: {
        address: {
            formattedAddress: {
                needs: {
                    lineOne: true,
                    lineTwo: true,
                    city: true,
                    country: true,
                    pincode: true,
                },
                compute: (addr) => {
                    return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country}-${addr.pincode}`;
                }
            }
        }
    }
});
app.listen(secret_1.PORT, () => {
    console.log(`Server is running on port ${secret_1.PORT}`);
});
