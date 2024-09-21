"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const bcrypt_1 = require("bcrypt");
const uuid_1 = require("uuid");
const secret_1 = require("../utils/secret");
const notFound_1 = require("../exceptions/notFound");
const root_1 = require("../exceptions/root");
const exceptions_1 = require("../exceptions/exceptions");
const users_1 = require("../schemas/users");
const zod_1 = require("zod");
const userUtils_1 = require("../utils/userUtils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const authCtrl = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let profileImage = ''; // Get the uploaded file's name
        try {
            const { email, password, name, bio, ssn, phoneNumber, dateOfBirth, gender, userName } = req.body;
            profileImage = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename; // Get the uploaded file's name
            // Ensure all required fields are provided
            if (!email)
                throw new exceptions_1.BadRequestsException('Email is required.', root_1.ErrorCode.VALIDATION_ERROR);
            if (!password)
                throw new exceptions_1.BadRequestsException('Password is required.', root_1.ErrorCode.VALIDATION_ERROR);
            if (!userName)
                throw new exceptions_1.BadRequestsException('User name is required.', root_1.ErrorCode.VALIDATION_ERROR);
            if (!name)
                throw new exceptions_1.BadRequestsException('Name is required.', root_1.ErrorCode.VALIDATION_ERROR);
            // Validate request body against the schema
            users_1.SignUpSchema.parse(req.body);
            // Check if the user already exists by email and userName
            const userByEmail = yield __1.prismaClient.user.findFirst({ where: { email } });
            const userByUserName = yield __1.prismaClient.user.findFirst({ where: { userName } });
            if (userByEmail)
                throw new exceptions_1.BadRequestsException('User with this email already exists.', root_1.ErrorCode.USER_ALREADY_EXISTS);
            if (userByUserName)
                throw new exceptions_1.BadRequestsException('User with this username already exists.', root_1.ErrorCode.USER_ALREADY_EXISTS);
            // Retrieve user agent info and public IP
            const userAgentString = req.headers['user-agent'] || '';
            const userAgentInfo = (0, userUtils_1.getUserAgentInfo)(userAgentString);
            const { publicIp, location: any } = yield (0, userUtils_1.getPublicIpAndLocation)();
            // Create a new user in the database
            const user = yield __1.prismaClient.user.create({
                data: {
                    email,
                    password: (0, bcrypt_1.hashSync)(password, 10), // Hash the password
                    name,
                    userName,
                    bio: bio || '', // Default to an empty string if bio is not provided
                    ssn,
                    phoneNumber,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // Convert dateOfBirth to a Date object
                    gender,
                    userAgentInfo,
                    ipAddress: publicIp, // Store IP address
                    location,
                    profileImage: profileImage || '' // Store the uploaded image file name, if exists
                }
            });
            // Send success response
            res.status(201).json({
                message: "Successfully created a user",
                status: "Success",
                user: user,
                timestamp: new Date().toISOString(),
                requestId: (0, uuid_1.v4)(),
                metadata: {
                    serverTime: new Date().toISOString()
                }
            });
        }
        catch (error) {
            if (req.file && profileImage) {
                fs_1.default.unlinkSync(req.file.path); // Deletes the uploaded file
            }
            if (error instanceof zod_1.ZodError) {
                // Handle Zod validation errors
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({
                    message: "Validation error",
                    errors: formattedErrors,
                });
            }
            else if (error instanceof exceptions_1.BadRequestsException) {
                // Handle custom application errors
                return res.status(400).json({ message: error.message });
            }
            else {
                // Handle internal server error
                console.error('Internal server error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            let user = yield __1.prismaClient.user.findFirst({ where: { email } });
            if (!user)
                throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.USER_NOT_FOUND);
            if (!(0, bcrypt_1.compareSync)(password, user.password)) {
                res.json({ message: `Incorrect password ${root_1.ErrorCode.INCORRECT_PASSWORD}` });
                throw new exceptions_1.BadRequestsException('Incorrect password', root_1.ErrorCode.INCORRECT_PASSWORD);
            }
            if (!email)
                throw new notFound_1.NotFoundException('Please give your email.', root_1.ErrorCode.USER_NOT_FOUND);
            const accessToken = jsonwebtoken_1.default.sign({ userId: user.id }, secret_1.JWT_SECRET, { expiresIn: '3d' });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, secret_1.JWT_SECRET, { expiresIn: '7d' });
            // Set tokens in cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            const token = {
                accessToken,
                refreshToken
            };
            // const access = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '3d' })
            // const refresh = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
            // const token = {
            //     access,
            //     refresh
            // }
            // res.json({ user, token })
            res.json({ user, token });
        }
        catch (error) {
            if (error instanceof notFound_1.NotFoundException || error instanceof exceptions_1.BadRequestsException) {
                // Handle known errors
                res.status(400).json({ message: error.message });
            }
            else {
                // Handle unexpected errors
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }),
    // refreshToken : async (req: Request, res: Response) => {
    //     const { refreshToken } = req.cookies;
    //     if (!refreshToken) {
    //         return res.status(401).json({ message: 'Unauthorized' });
    //     }
    //     try {
    //         const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
    //         const newAccessToken = jwt.sign({ userId: payload.userId }, ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
    //         res.cookie('accessToken', newAccessToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    //             sameSite: 'Strict',
    //         });
    //         res.status(200).json({ message: 'Token refreshed' });
    //     } catch (error) {
    //         res.status(401).json({ message: 'Unauthorized' });
    //     }
    // },
    // logout: async (req: Request, res: Response) => {
    //     res.clearCookie('jwtToken');
    //     res.json({ message: "Logout successful" });
    // },
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    }),
    me: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(req === null || req === void 0 ? void 0 : req.user);
    }),
    changeMyPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Ensure that req.user is of the correct type
        const user = req.user;
        const { id: userId } = user; // Destructure the id property from user
        const { oldPassword, newPassword } = req.body;
        try {
            // Find the user by userId
            const user = yield __1.prismaClient.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.USER_NOT_FOUND);
            }
            // Check if the old password matches the stored hashed password
            if (!(0, bcrypt_1.compareSync)(oldPassword, user.password)) {
                throw new exceptions_1.BadRequestsException('Incorrect old password', root_1.ErrorCode.INCORRECT_PASSWORD);
            }
            // Hash the new password
            const hashedPassword = (0, bcrypt_1.hashSync)(newPassword, 10);
            // Update the user's password in the database using Prisma
            yield __1.prismaClient.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
            res.json({ message: "Password changed successfully" });
        }
        catch (error) {
            if (error instanceof notFound_1.NotFoundException || error instanceof exceptions_1.BadRequestsException) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }),
    // deleteMyAccount: async (req: Request, res: Response) => {
    //     try {
    //         await prismaClient.user.delete({
    //             where: {
    //                 id: +req.params.id
    //             }
    //         })
    //         res.json({ success: true })
    //     } catch (err) {
    //         throw new NotFoundException('User not found.', ErrorCode.ADDRESS_NOT_FOUND)
    //     }
    // },
    deleteMyAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch the user from the database to retrieve their profile image and folder path
            const user = yield __1.prismaClient.user.findUnique({
                where: {
                    id: +req.params.id
                },
            });
            if (!user) {
                throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
            }
            // If the user has a profile image, attempt to delete it
            if (user === null || user === void 0 ? void 0 : user.profileImage) {
                const userFolderPath = path_1.default.join('uploads', user.userName); // Assuming you store images in a folder named after the username
                // Delete the profile image file if it exists
                const imageFileName = user.profileImage.split('/').pop(); // Extract file name from profileImage URL
                const imageFullPath = path_1.default.join(userFolderPath, imageFileName);
                if (fs_1.default.existsSync(imageFullPath)) {
                    fs_1.default.unlinkSync(imageFullPath); // Deletes the image file
                }
                // Delete the user folder if it exists and is empty
                if (fs_1.default.existsSync(userFolderPath)) {
                    fs_1.default.rmdirSync(userFolderPath, { recursive: true }); // Deletes the folder and any remaining content
                }
            }
            // Delete the user from the database
            yield __1.prismaClient.user.delete({
                where: {
                    id: +req.params.id
                }
            });
            // Respond with success
            res.json({ success: true });
        }
        catch (err) {
            // Handle user not found error or other exceptions
            if (err instanceof notFound_1.NotFoundException) {
                return res.status(404).json({ message: err.message });
            }
            console.error('Error deleting account:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }),
};
exports.default = authCtrl;
