import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private sendMail;
    sendVerificationEmail(email: string, firstName: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void>;
    sendPasswordChangedEmail(email: string, firstName: string): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string): Promise<void>;
    private buildWelcomeTemplate;
    private baseTemplate;
    private buildVerificationTemplate;
    private buildPasswordResetTemplate;
    private buildPasswordChangedTemplate;
}
