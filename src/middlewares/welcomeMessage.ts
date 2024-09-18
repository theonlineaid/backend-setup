import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config({path: '.env'});

export const sendWelcomeEmail = async (email: string, name: string) => {
    // Set up email transporter (using Gmail as an example)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your email address
            pass: process.env.EMAIL_PASS,  // Your email password or app-specific password
        }
    });

    // Compose email content
    const mailOptions = {
        from: '"Online Aid" <onlineaid.info@gmail.com>',  // Sender address
        to: email,  // List of receivers
        subject: 'Welcome to Online Aid!',  // Subject line
        text: `Hi ${name},\n\nWelcome to Online Aid! We're excited to have you on board.\n\nThank you for joining us!\n\nBest regards,\nOnline Aid Team`,  // Plain text body
        html: `<h3>Hi ${name},</h3><p>Welcome to <b>Online Aid!</b> We're excited to have you on board.</p><p>Thank you for joining us!</p><p>Best regards,<br>Online Aid Team</p>`  // HTML body (optional)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};
