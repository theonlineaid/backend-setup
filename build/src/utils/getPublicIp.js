"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicIp = void 0;
const http_1 = __importDefault(require("http"));
const getPublicIp = () => {
    return new Promise((resolve, reject) => {
        http_1.default.get('http://api.ipify.org/', (resp) => {
            let ip = '';
            resp.on('data', (chunk) => {
                ip += chunk;
            });
            resp.on('end', () => {
                resolve(ip);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};
exports.getPublicIp = getPublicIp;
