import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    verifyConnection(): Promise<boolean>;
    sendOTP(email: string, otp: string): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
}
