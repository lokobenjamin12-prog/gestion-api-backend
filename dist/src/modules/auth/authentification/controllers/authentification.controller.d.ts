import type { Response, Request } from 'express';
import { AuthentificationService } from '../services/authentification.service';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, VerifyEmailDto } from '../dto';
import { ResendVerificationEmailDto } from '../dto/request/resend-Verification-Email.dto';
import { CreateUserDto } from '../../user/dto/request/user.dto';
import { RegisterResponse } from '../dto/response/register-response';
import { VerifyEmailControllerResponse } from '../dto/response/verify-email-controller-response';
import { ResendVerificationEmailResponse } from '../dto/response/resend-verification-email-response';
import { LoginControllerResponse } from '../dto/response/login-controller-response';
import { RefreshControllerResponse } from '../dto/response/refresh-controller-response';
import { ForgotPasswordResponse } from '../dto/response/forgot-password-response';
import { ResetPasswordResponse } from '../dto/response/reset-password-response';
import { LogoutResponse } from '../dto/response/logout-response';
import { GetMeResponse } from '../dto/response/get-me-response';
import { UpdateProfileDto } from '../dto/request/update-profile.dto';
import { ChangePasswordProfileDto } from '../dto/request/change-password.dto';
export declare class AuthentificationController {
    private readonly authService;
    constructor(authService: AuthentificationService);
    register(createUserDto: CreateUserDto, actorId: string, req: any): Promise<RegisterResponse>;
    verifyEmail(dto: VerifyEmailDto, response: Response): Promise<VerifyEmailControllerResponse>;
    resendVerificationEmail(emailDto: ResendVerificationEmailDto, req: any): Promise<ResendVerificationEmailResponse>;
    login(loginDto: LoginDto, response: Response): Promise<LoginControllerResponse>;
    refresh(req: Request, response: Response): Promise<RefreshControllerResponse>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse>;
    logout(req: any, response: Response): Promise<LogoutResponse>;
    getMe(req: any): Promise<GetMeResponse>;
    updateMe(dto: UpdateProfileDto, req: any): Promise<GetMeResponse>;
    changePassword(dto: ChangePasswordProfileDto, req: any): Promise<{
        message: string;
    }>;
    uploadMyProfilePicture(file: Express.Multer.File, req: any): Promise<any>;
}
