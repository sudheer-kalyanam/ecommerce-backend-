"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        const isDevelopment = this.configService.get('NODE_ENV') === 'development';
        const smtpConfig = {
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
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1,
            debug: true,
            logger: true,
        };
        this.transporter = nodemailer.createTransport(smtpConfig);
    }
    async verifyConnection() {
        try {
            console.log('🔍 [EMAIL SERVICE] Verifying SMTP connection...');
            await this.transporter.verify();
            console.log('✅ [EMAIL SERVICE] SMTP connection verified successfully');
            return true;
        }
        catch (error) {
            console.error('❌ [EMAIL SERVICE] SMTP connection verification failed:', error.message);
            return false;
        }
    }
    async sendOTP(email, otp) {
        console.log(`\n🔐 OTP CODE FOR DEBUGGING:`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Generated at: ${new Date().toLocaleString()}`);
        console.log(`📝 Valid for: 10 minutes\n`);
        const isConnected = await this.verifyConnection();
        if (!isConnected) {
            console.log('⚠️  SMTP connection failed, but OTP is logged above for debugging');
            return;
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
        const maxRetries = 3;
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📧 [EMAIL SERVICE] Attempt ${attempt}/${maxRetries} to send OTP email`);
                const sendPromise = this.transporter.sendMail(mailOptions);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Email send timeout after 25 seconds')), 25000));
                await Promise.race([sendPromise, timeoutPromise]);
                console.log(`✅ OTP email sent successfully to ${email}`);
                return;
            }
            catch (error) {
                lastError = error;
                console.error(`❌ [EMAIL SERVICE] Attempt ${attempt} failed:`, {
                    message: error.message,
                    code: error.code,
                    command: error.command,
                    response: error.response,
                });
                if (attempt < maxRetries) {
                    const delay = attempt * 3000;
                    console.log(`⏳ [EMAIL SERVICE] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        console.error('❌ [EMAIL SERVICE] All email attempts failed:', lastError);
        console.log(`⚠️  Email failed after ${maxRetries} attempts, but OTP is logged above for debugging`);
    }
    async sendWelcomeEmail(email, firstName) {
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
        }
        catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map