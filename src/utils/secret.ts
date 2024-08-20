import dotenv from "dotenv";
dotenv.config({path: '.env'});


export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET! || "20834f2347webhdw7825631tr2165231b231hb23g162rt6";
export const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '22621f6278535b'