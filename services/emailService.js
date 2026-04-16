const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * Send rejection email to student
     * @param {string} studentEmail 
     * @param {string} assignmentTitle 
     * @param {string} reason 
     */
    async sendRejectionEmail(studentEmail, assignmentTitle, reason) {
        const isPlaceholder = process.env.EMAIL_USER === 'your-email@gmail.com' ||
            process.env.EMAIL_PASS === 'your-app-password';

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || isPlaceholder) {
            console.warn('⚠️ EMAIL NOT SENT: SMTP credentials are not configured or are still using placeholder values.');
            console.warn('Please update EMAIL_USER and EMAIL_PASS in your .env file.');
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"Plagiarism Checker" <${process.env.EMAIL_USER}>`,
                to: studentEmail,
                subject: `Assignment Rejected: ${assignmentTitle}`,
                text: `Hello,\n\nYour submission for the assignment "${assignmentTitle}" has been rejected.\n\nReason: ${reason}\n\nPlease review the feedback and resubmit if allowed.\n\nRegards,\nYour Teacher`,
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d32f2f;">Assignment Rejected</h2>
            <p>Hello,</p>
            <p>Your submission for the assignment <strong>"${assignmentTitle}"</strong> has been rejected.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Please review the feedback on your dashboard and resubmit if the deadline has not passed.</p>
            <br>
            <p>Regards,<br>Plagiarism Checker System</p>
          </div>
        `,
            });

            console.log('Rejection email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending rejection email:', error);
            // Don't throw the error to avoid breaking the core logic if email fails
        }
    }

    /**
     * Send an OTP email to the user for password reset.
     * @param {string} toEmail - The recipient's email address
     * @param {string} otp - The one-time password to send
     */
    async sendOtpEmail(toEmail, otp) {
        const isPlaceholder = process.env.EMAIL_USER === 'your-email@gmail.com' ||
            process.env.EMAIL_PASS === 'your-app-password';

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || isPlaceholder) {
            console.warn('⚠️ EMAIL NOT SENT: SMTP credentials are not configured or are still using placeholder values.');
            console.warn('Please update EMAIL_USER and EMAIL_PASS in your .env file.');
            return false;
        }

        try {
            const mailOptions = {
                from: `"Plagiarism Checker" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: 'Your Password Reset OTP',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">We received a request to reset your password. Here is your One-Time Password (OTP):</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; color: #fff; background-color: #007bff; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p style="font-size: 16px; color: #555;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
                    <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
                  </div>
                `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('OTP Email sent: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
