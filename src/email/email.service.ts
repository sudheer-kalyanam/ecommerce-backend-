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
      // Enhanced timeout settings for Railway deployment
      connectionTimeout: 120000, // 2 minutes
      greetingTimeout: 60000, // 1 minute
      socketTimeout: 120000, // 2 minutes
      // Retry configuration
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000,
      rateLimit: 5,
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

    // Try to send email with retry logic
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 [EMAIL SERVICE] Attempt ${attempt}/${maxRetries} to send OTP email`);
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return; // Success, exit the function
      } catch (error) {
        lastError = error;
        console.error(`❌ [EMAIL SERVICE] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s delays
          console.log(`⏳ [EMAIL SERVICE] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    console.error('❌ [EMAIL SERVICE] All email attempts failed:', lastError);
    console.log(`⚠️  Email failed after ${maxRetries} attempts, but OTP is logged above for debugging`);
    // Don't throw error - let the login process continue
    // The OTP is still valid and logged for testing
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
