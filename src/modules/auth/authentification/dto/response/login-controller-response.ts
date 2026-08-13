import { LoginResponse } from "./login-response";

export interface LoginControllerResponse {
    message: string;
    user: LoginResponse['user'];
}