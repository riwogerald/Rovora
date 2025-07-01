import nodemailer from 'nodemailer';
import { dev } from '$app/environment';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(
  dev 
    ? {
        // Development: Use Ethereal Email for testing
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      }
    : emailConfig
);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@rovora.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });

    if (dev) {
      console.log('📧 Email sent:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string, 
  username: string, 
  token: string
): Promise<boolean> {
  const verificationUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Rovora Account</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background: linear-gradient(135deg, #5855eb, #7c3aed);
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-icon">R</div>
          <div class="logo-text">Rovora</div>
        </div>
        <h1>Welcome to Rovora!</h1>
      </div>

      <div class="card">
        <h2>Hi ${username},</h2>
        <p>Thanks for signing up for Rovora, the enhanced social gaming platform! To get started with your gaming codex, please verify your email address.</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${verificationUrl}
        </p>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This verification link will expire in 2 hours. If you didn't create an account with Rovora, please ignore this email.
      </div>

      <div class="footer">
        <p>Happy gaming!</p>
        <p>The Rovora Team</p>
        <p style="margin-top: 20px;">
          <a href="${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}" style="color: #6366f1;">Visit Rovora</a> |
          <a href="${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/support" style="color: #6366f1;">Support</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Rovora!

    Hi ${username},

    Thanks for signing up for Rovora! To get started with your gaming codex, please verify your email address by clicking the link below:

    ${verificationUrl}

    This verification link will expire in 2 hours.

    If you didn't create an account with Rovora, please ignore this email.

    Happy gaming!
    The Rovora Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Rovora Account',
    html,
    text
  });
}

export async function sendPasswordResetEmail(
  email: string, 
  username: string, 
  token: string
): Promise<boolean> {
  const resetUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Rovora Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-icon">R</div>
          <div class="logo-text">Rovora</div>
        </div>
        <h1>Password Reset Request</h1>
      </div>

      <div class="card">
        <h2>Hi ${username},</h2>
        <p>We received a request to reset your Rovora account password. Click the button below to create a new password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${resetUrl}
        </p>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </div>

      <div class="footer">
        <p>The Rovora Team</p>
        <p style="margin-top: 20px;">
          <a href="${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/support" style="color: #6366f1;">Contact Support</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request

    Hi ${username},

    We received a request to reset your Rovora account password. Click the link below to create a new password:

    ${resetUrl}

    This reset link will expire in 1 hour.

    If you didn't request a password reset, please ignore this email and your password will remain unchanged.

    The Rovora Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Your Rovora Password',
    html,
    text
  });
}