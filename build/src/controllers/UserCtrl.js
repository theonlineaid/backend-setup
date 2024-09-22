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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const users_1 = require("../schemas/users");
const notFound_1 = require("../exceptions/notFound");
const root_1 = require("../exceptions/root");
const exceptions_1 = require("../exceptions/exceptions");
const bcrypt_1 = require("bcrypt");
const userCtrl = {
    addAddress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        users_1.AddressSchema.parse(req.body);
        let user;
        // try {
        //     user = await prismaClient.user.findFirstOrThrow({
        //         where : {
        //             id: req.body.userId
        //         }
        //     })
        // } catch (error) {
        //     throw new NotFoundException('User not found!', ErrorCode.USER_NOT_FOUND)
        // }
        const address = yield __1.prismaClient.address.create({
            data: Object.assign(Object.assign({}, req.body), { userId: req.user.id })
        });
        res.json(address);
    }),
    updateAddress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const address = yield __1.prismaClient.address.update({
                where: {
                    id: +req.params.id
                },
                data: req.body
            });
            res.json(address);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Address not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
        }
    }),
    deleteAddress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield __1.prismaClient.address.delete({
                where: {
                    id: +req.params.id
                }
            });
            res.json({ success: true });
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Address not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
        }
    }),
    getAddressById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const address = yield __1.prismaClient.address.findFirst({
                where: {
                    id: +req.params.id
                }
            });
            res.json(address);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Address not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
        }
    }),
    getAllAddress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const addresses = yield __1.prismaClient.address.findMany({
            skip: req.query.skip ? +req.query.skip : 0,
            take: 5,
            where: {
                userId: req.user.id
            }
        });
        res.json(addresses);
    }),
    updateDefaultUserAddress: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validatedData = users_1.UpdateUserAddressSchema.parse(req.body);
        let shippingAddress;
        let billingAddress;
        console.log(validatedData);
        if (validatedData.defaultShippingAddress) {
            try {
                shippingAddress = yield __1.prismaClient.address.findFirstOrThrow({
                    where: {
                        id: validatedData.defaultShippingAddress
                    }
                });
            }
            catch (error) {
                throw new notFound_1.NotFoundException('Address not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
            }
            if (shippingAddress.userId != req.user.id) {
                throw new exceptions_1.BadRequestsException('Address does not belong to user', root_1.ErrorCode.ADDRESS_DOES_NOT_BELONG);
            }
        }
        if (validatedData.defaultBillingAddress) {
            try {
                billingAddress = yield __1.prismaClient.address.findFirstOrThrow({
                    where: {
                        id: validatedData.defaultBillingAddress
                    }
                });
            }
            catch (error) {
                throw new notFound_1.NotFoundException('Address not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
            }
            if (billingAddress.userId != req.user.id) {
                throw new exceptions_1.BadRequestsException('Address does not belong to user', root_1.ErrorCode.ADDRESS_DOES_NOT_BELONG);
            }
        }
        const updatedUser = yield __1.prismaClient.user.update({
            where: {
                id: req.user.id
            },
            data: validatedData
        });
        res.json(updatedUser);
    }),
    // ========= User relate functions by admin =========
    getAllUsersByAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // --> /users will return the first five users. or users?skip=0
        // --> /users?skip=5 will return the next five users.
        // --> /users?skip=10 will return the users after skipping the first ten users, and so on.
        const users = yield __1.prismaClient.user.findMany({
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
        });
        res.json(users);
    }),
    getSingleUserByAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield __1.prismaClient.user.findFirstOrThrow({
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
            });
            res.json(user);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.USER_NOT_FOUND);
        }
    }),
    addUserByAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        users_1.SignUpSchema.parse(req.body);
        const { email, password, name } = req.body;
        let user = yield __1.prismaClient.user.findFirst({ where: { email: email } });
        if (user) {
            new exceptions_1.BadRequestsException('User already exist.', root_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        user = yield __1.prismaClient.user.create({
            data: {
                email,
                password: (0, bcrypt_1.hashSync)(password, 10),
                name
            }
        });
        res.json(user);
    }),
    deleteUserByAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield __1.prismaClient.user.delete({
                where: {
                    id: +req.params.id
                }
            });
            res.json({ success: true });
        }
        catch (err) {
            throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.ADDRESS_NOT_FOUND);
        }
    }),
    changeUserRoleByAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Validation 
        try {
            const user = yield __1.prismaClient.user.update({
                where: {
                    id: +req.params.id
                },
                data: {
                    role: req.body.role
                }
            });
            res.json(user);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('User not found.', root_1.ErrorCode.USER_NOT_FOUND);
        }
    })
};
exports.default = userCtrl;
