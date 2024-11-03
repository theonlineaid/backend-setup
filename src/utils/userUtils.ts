import DeviceDetector from "device-detector-js";
import parser, { IResult } from 'ua-parser-js';
import { getPublicIp } from "./getPublicIp";
import { IPINFO_TOKEN } from "./secret";
import axios from 'axios';


export const getUserAgentInfo = (userAgentString: string) => {
    const userAgentInfo: IResult = parser(userAgentString);
    const deviceDetector = new DeviceDetector();
    const userAgent = userAgentInfo.ua;
    const deviceInfo = deviceDetector.parse(userAgent);

    return {
        ...userAgentInfo,
        device: {
            model: deviceInfo.device?.model || '',
            type: deviceInfo.device?.type || '',
            vendor: deviceInfo.device?.brand || '',
        },
    };
};

export const getPublicIpAndLocation = async () => {
    let publicIp = '';
    try {
        publicIp = await getPublicIp();
    } catch (err: any) {
        console.error('Error fetching public IP:', err.message);
    }

    let location = null;
    if (publicIp && publicIp !== '::1' && publicIp !== '127.0.0.1') {
        try {
            const response = await axios.get(`https://ipinfo.io/${publicIp}?token=${IPINFO_TOKEN}`);
            location = response.data;
        } catch (err: any) {
            console.error('Error fetching location:', err.message);
        }
    }

    return { publicIp, location };
};
