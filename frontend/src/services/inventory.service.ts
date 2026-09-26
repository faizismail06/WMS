import api from '../config/axios';
import { ApiResponse } from '../types/auth';
import { StockAdjustment, StockOpname } from '../types/inventory';

export const adjustmentService = {
 async getAdjustments(params?: { q?: string; reason?: string; page?: number; limit?: number }): Promise<{ data: StockAdjustment[]; meta?: any }> {
 const response = await api.get<ApiResponse<StockAdjustment[]>>('/stock-adjustments', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 async createAdjustment(payload: {
 productId: string;
 actualStock: number;
 reason: string;
 notes?: string;
 }): Promise<StockAdjustment> {
 const response = await api.post<ApiResponse<StockAdjustment>>('/stock-adjustments', payload);
 return response.data.data;
 }
};

export const opnameService = {
 async getOpnames(params?: { q?: string; status?: string; page?: number; limit?: number }): Promise<{ data: StockOpname[]; meta?: any }> {
 const response = await api.get<ApiResponse<StockOpname[]>>('/stock-opnames', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 async getOpnameById(id: string): Promise<StockOpname> {
 const response = await api.get<ApiResponse<StockOpname>>(`/stock-opnames/${id}`);
 return response.data.data;
 },

 async createOpname(payload: { title: string; period: string; notes?: string }): Promise<StockOpname> {
 const response = await api.post<ApiResponse<StockOpname>>('/stock-opnames', payload);
 return response.data.data;
 },

 async updateCounts(id: string, items: { id: string; physicalStock: number; notes?: string }[]): Promise<void> {
 await api.put(`/stock-opnames/${id}/counts`, { items });
 },

 async submitOpname(id: string): Promise<StockOpname> {
 const response = await api.post<ApiResponse<StockOpname>>(`/stock-opnames/${id}/submit`);
 return response.data.data;
 },

 async verifyOpname(id: string, payload: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string }): Promise<StockOpname> {
 const response = await api.post<ApiResponse<StockOpname>>(`/stock-opnames/${id}/verify`, payload);
 return response.data.data;
 }
};
