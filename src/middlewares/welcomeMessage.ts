import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { APP_PASS, EMAIL_USER } from '../utils/secret';
dotenv.config({ path: '.env' });

export const sendWelcomeEmail = async (email: string, name: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: EMAIL_USER,
            pass: APP_PASS,  // Your email password or app-specific password
        }
    });

    const mailOptions = {
        from: '"Online Aid" <omorfaruk.dev@gmail.com>',  // Sender address
        to: email,  // List of receivers
        subject: 'Welcome to Online Aid!',  // Subject line
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
            <div style="text-align: center; padding: 10px 0;">
                <img src="https://i.ibb.co/DpK6Z0m/1673291260756.png" alt="Online Aid Logo" style="width: 100px; margin-bottom: 20px;" />
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333;">Hi ${name},</h2>
                <p style="font-size: 16px; color: #555;">
                    Welcome to <b>Online Aid!</b> We're thrilled to have you on board. Our mission is to help you in any way we can, and we hope you enjoy your experience with us.
                </p>
                <p style="font-size: 16px; color: #555;">To get started, visit the link below:</p>
                 <br />
                <br />
                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://onlineaid.vercel.app" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Visit Online Aid</a>
                </div>
                 <br />
                <br />
                <p style="font-size: 16px; color: #555;">
                    If you have any questions, feel free to reach out to us at any time. We're here to help!
                </p>
                <p style="font-size: 16px; color: #555;">Thank you for joining us!</p>
                <p style="font-size: 16px; color: #555;">Best regards,</p>
                <br />
                <p style="font-size: 16px; color: #333;"><strong>Online Aid Team</strong></p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                <p>© 2024 Online Aid. All rights reserved.</p>
                <p>
                    <a href="https://onlineaid.vercel.app/privacy" style="color: #4CAF50; text-decoration: none;">Privacy Policy</a> | 
                    <a href="https://onlineaid.vercel.app/terms" style="color: #4CAF50; text-decoration: none;">Terms of Service</a>
                </p>
            </div>
        </div>
        `,  // HTML body with inline styles for a better look
    };

    await transporter.sendMail(mailOptions);
};
