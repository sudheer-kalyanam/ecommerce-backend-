import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      tls: {
        // In development, allow self-signed certificates
        // In production, use proper SSL validation
        rejectUnauthorized: !isDevelopment,
        // Use modern TLS cipher suites
        ciphers: isDevelopment ? 'SSLv3' : undefined,
      },
      // Additional options for better compatibility
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      // Enable debug logging in development
      debug: isDevelopment,
      logger: isDevelopment,
    });
  }

  async sendOTP(email: string, otp: string) {
    // Always log OTP to console for debugging
    console.log(`\n🔐 OTP CODE FOR DEBUGGING:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Generated at: ${new Date().toLocaleString()}`);
    console.log(`📝 Valid for: 10 minutes\n`);

    const mailOptions = {
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Your OTP for Ecommerce App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      console.log(`⚠️  Email failed, but OTP is logged above for debugging`);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const mailOptions = {
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Welcome to Ecommerce App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${firstName}!</h2>
          <p>Thank you for joining our ecommerce platform. Your account has been successfully created.</p>
          <p>You can now start shopping and enjoy our services.</p>
          <p>Best regards,<br>The Ecommerce Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}
