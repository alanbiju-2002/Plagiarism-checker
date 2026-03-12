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
}

module.exports = new EmailService();
