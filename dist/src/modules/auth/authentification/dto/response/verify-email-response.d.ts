export interface VerifyEmailResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
    };
}
