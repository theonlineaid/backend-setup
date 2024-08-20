import DeviceDetector from "device-detector-js";

export const deviceDetector = (ua: any) => {
    const deviceDetector = new DeviceDetector();
    const userAgent = ua
    const device = deviceDetector.parse(userAgent);
}