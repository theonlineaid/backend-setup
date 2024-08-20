import axios from "axios";
import { getPublicIp } from "./getPublicIp";
import { IPINFO_TOKEN } from "./secret";

export const getLocation = async () => {
    // Get the public IP address
    let publicIp = '';
    try {
        publicIp = await getPublicIp();
        console.log("Public IP Address:", publicIp);
    } catch (err: any) {
        console.error('Error fetching public IP:', err.message);
    }

    // Optional: Get additional location details
    let location = null;
    if (publicIp && publicIp !== '::1' && publicIp !== '127.0.0.1') {
        try {
            const response = await axios.get(`https://ipinfo.io/${publicIp}?token=${IPINFO_TOKEN}`);
            console.log("IPinfo Response:", response.data);
            location = response.data;
        } catch (err: any) {
            console.error('Error fetching location:', err.message);
        }
    } else {
        console.log("Local IP address detected, skipping location lookup.");
    }
}