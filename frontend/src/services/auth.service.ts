import api from '../config/axios';
import { ApiResponse, AuthResponseData, User } from '../types/auth';

export interface LoginPayload {
 email: string;
 password: string;
}

export const authService = {
 async login(payload: LoginPayload): Promise<AuthResponseData> {
 const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
 return response.data.data;
 },

 async getMe(): Promise<User> {
 const response = await api.get<ApiResponse<User>>('/auth/me');
 return response.data.data;
 }
};
