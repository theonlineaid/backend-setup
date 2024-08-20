
import parser from 'ua-parser-js';
import { Response, Request } from "express";


export const getUserAgent = (req:Request) => {
    const userAgentString = req.headers['user-agent'];
    const userAgentInfo = parser(userAgentString);
}