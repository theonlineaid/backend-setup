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
exports.getPublicIpAndLocation = exports.getUserAgentInfo = void 0;
const device_detector_js_1 = __importDefault(require("device-detector-js"));
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const getPublicIp_1 = require("./getPublicIp");
const secret_1 = require("./secret");
const axios_1 = __importDefault(require("axios"));
const getUserAgentInfo = (userAgentString) => {
    var _a, _b, _c;
    const userAgentInfo = (0, ua_parser_js_1.default)(userAgentString);
    const deviceDetector = new device_detector_js_1.default();
    const userAgent = userAgentInfo.ua;
    const deviceInfo = deviceDetector.parse(userAgent);
    return Object.assign(Object.assign({}, userAgentInfo), { device: {
            model: ((_a = deviceInfo.device) === null || _a === void 0 ? void 0 : _a.model) || '',
            type: ((_b = deviceInfo.device) === null || _b === void 0 ? void 0 : _b.type) || '',
            vendor: ((_c = deviceInfo.device) === null || _c === void 0 ? void 0 : _c.brand) || '',
        } });
};
exports.getUserAgentInfo = getUserAgentInfo;
const getPublicIpAndLocation = () => __awaiter(void 0, void 0, void 0, function* () {
    let publicIp = '';
    try {
        publicIp = yield (0, getPublicIp_1.getPublicIp)();
    }
    catch (err) {
        console.error('Error fetching public IP:', err.message);
    }
    let location = null;
    if (publicIp && publicIp !== '::1' && publicIp !== '127.0.0.1') {
        try {
            const response = yield axios_1.default.get(`https://ipinfo.io/${publicIp}?token=${secret_1.IPINFO_TOKEN}`);
            location = response.data;
        }
        catch (err) {
            console.error('Error fetching location:', err.message);
        }
    }
    return { publicIp, location };
});
exports.getPublicIpAndLocation = getPublicIpAndLocation;
