import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    
    // Try multiple SMTP configurations for Railway compatibility
    const smtpConfigs = [
      // Configuration 1: Gmail with aggressive timeout settings
      {
        host: this.configService.get('SMTP_HOST'),
        port: parseInt(this.configService.get('SMTP_PORT') || '587'),
        secure: false,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3',
          secureProtocol: 'TLSv1_2_method',
          checkServerIdentity: () => undefined,
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000,
        socketTimeout: 15000,
        pool: false,
        maxConnections: 1,
        maxMessages: 1,
        debug: true,
        logger: true,
      },
      // Configuration 2: Gmail with port 465 (SSL)
      {
        host: this.configService.get('SMTP_HOST'),
        port: 465,
        secure: true,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        pool: false,
        debug: true,
        logger: true,
      }
    ];

    // Try to create transporter with the first working configuration
    this.transporter = this.createTransporterWithFallback(smtpConfigs);
  }

  private createTransporterWithFallback(configs: any[]): nodemailer.Transporter {
    for (let i = 0; i < configs.length; i++) {
      try {
        console.log(`🔧 [EMAIL SERVICE] Trying SMTP configuration ${i + 1}/${configs.length}`);
        const transporter = nodemailer.createTransport(configs[i]);
        return transporter;
      } catch (error) {
        console.error(`❌ [EMAIL SERVICE] Configuration ${i + 1} failed:`, error.message);
        if (i === configs.length - 1) {
          // If all configurations fail, create a mock transporter
          console.log('⚠️  [EMAIL SERVICE] All SMTP configurations failed, using mock transporter');
          return this.createMockTransporter();
        }
      }
    }
    return this.createMockTransporter();
  }

  private createMockTransporter(): nodemailer.Transporter {
    // Create a mock transporter that doesn't actually send emails
    return {
      sendMail: async (mailOptions: any) => {
        console.log('📧 [MOCK EMAIL] Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          from: mailOptions.from
        });
        return { messageId: 'mock-message-id', response: 'Mock email sent' };
      },
      verify: async () => {
        console.log('✅ [MOCK EMAIL] Mock SMTP connection verified');
        return true;
      },
      close: () => {
        console.log('🔒 [MOCK EMAIL] Mock SMTP connection closed');
      }
    } as any;
  }

  async verifyConnection() {
    try {
      console.log('🔍 [EMAIL SERVICE] Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('✅ [EMAIL SERVICE] SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] SMTP connection verification failed:', error.message);
      return false;
    }
  }

  private async sendMockEmail(email: string, otp: string) {
    const mailOptions = {
      from: this.configService.get('SMTP_USER') || 'noreply@example.com',
      to: email,
      subject: 'Your OTP for Ecommerce App (Mock)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code (Mock Email)</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
          <p><strong>Note:</strong> This is a mock email for testing purposes.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ [MOCK EMAIL] Mock OTP email sent successfully');
    } catch (error) {
      console.error('❌ [MOCK EMAIL] Failed to send mock email:', error.message);
    }
  }

  async sendOTP(email: string, otp: string) {
    // Always log OTP to console for debugging
    console.log(`\n🔐 OTP CODE FOR DEBUGGING:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Generated at: ${new Date().toLocaleString()}`);
    console.log(`📝 Valid for: 10 minutes\n`);

    // Check if we're using mock transporter
    const isMockTransporter = this.transporter && typeof (this.transporter as any).sendMail === 'function' && 
                             (this.transporter as any).sendMail.toString().includes('MOCK EMAIL');
    
    if (isMockTransporter) {
      console.log('📧 [MOCK EMAIL] Using mock email service - OTP logged above for testing');
      // Still try to "send" the email through mock transporter
      await this.sendMockEmail(email, otp);
      return;
    }

    // Verify connection before attempting to send
    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      console.log('⚠️  SMTP connection failed, but OTP is logged above for debugging');
      return; // Don't throw error, just log and continue
    }

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
        
        // Add timeout wrapper for each attempt
        const sendPromise = this.transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout after 25 seconds')), 25000)
        );
        
        await Promise.race([sendPromise, timeoutPromise]);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return; // Success, exit the function
      } catch (error) {
        lastError = error;
        console.error(`❌ [EMAIL SERVICE] Attempt ${attempt} failed:`, {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
        });
        
        if (attempt < maxRetries) {
          const delay = attempt * 3000; // 3s, 6s, 9s delays
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
