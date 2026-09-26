import api from '../config/axios';
import { ApiResponse, User, RoleName } from '../types/auth';

export interface AuditLogItem {
 id: string;
 action: string;
 module: string;
 recordId?: string;
 details?: any;
 ipAddress: string;
 createdAt: string;
 user?: {
 id: string;
 email: string;
 fullName: string;
 role: RoleName;
 } | null;
}

export interface NotificationItem {
 id: string;
 userId?: string;
 title: string;
 message: string;
 type: string;
 isRead: boolean;
 createdAt: string;
}

export const systemService = {
 // User Management
 async getUsers(params?: { q?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ data: User[]; meta?: any }> {
 const response = await api.get<ApiResponse<User[]>>('/users', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 async createUser(payload: { email: string; password: string; fullName: string; roleName: RoleName }): Promise<User> {
 const response = await api.post<ApiResponse<User>>('/users', payload);
 return response.data.data;
 },

 async toggleUserStatus(id: string): Promise<User> {
 const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`);
 return response.data.data;
 },

 // Audit Logs
 async getAuditLogs(params?: { q?: string; module?: string; page?: number; limit?: number }): Promise<{ data: AuditLogItem[]; meta?: any }> {
 const response = await api.get<ApiResponse<AuditLogItem[]>>('/audit-logs', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 // Notifications
 async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
 const response = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications');
 return response.data.data;
 },

 async markAsRead(id: string): Promise<void> {
 await api.patch(`/notifications/${id}/read`);
 }
};
