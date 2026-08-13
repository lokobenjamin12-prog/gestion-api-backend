export interface VerifyEmailControllerResponse {
    message: string;
    user: {
        id: string;
        email: string;
        firstName: string;
    };
}