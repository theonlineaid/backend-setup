import dotenv from "dotenv";
dotenv.config({path: '.env'});


export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET! || "20834f2347webhdw7825631tr2165231b231hb23g162rt6";
export const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '22621f6278535b';
export const EMAIL_PASS = process.env.EMAIL_PASS || 'Post8220';
export const EMAIL_USER = process.env.EMAIL_USER || 'omorfaruk.dev@gmail.com';
export const APP_PASS = process.env.APP_PASS || 'oxio fcym upea ktcy';
