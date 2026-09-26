export type RoleName = 'ADMIN_GUDANG' | 'SUPERVISOR' | 'ADMIN_SISTEM';

export interface User {
 id: string;
 email: string;
 fullName: string;
 role: RoleName;
 roleDescription?: string;
 status: 'ACTIVE' | 'INACTIVE';
 createdAt?: string;
}

export interface AuthResponseData {
 token: string;
 user: User;
}

export interface ApiResponse<T> {
 success: boolean;
 message: string;
 data: T;
 meta?: {
 page: number;
 limit: number;
 totalRecords: number;
 totalPages: number;
 };
 error?: {
 code: string;
 details?: any;
 };
}
