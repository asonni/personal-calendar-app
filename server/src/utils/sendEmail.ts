import nodemailer from 'nodemailer';

type TEmailOptions = {
  email: string;
  subject: string;
  message: string;
};

const sendEmail = async (options: TEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
