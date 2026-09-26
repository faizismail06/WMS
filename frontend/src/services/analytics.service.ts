import api from '../config/axios';
import { ApiResponse } from '../types/auth';
import { DashboardSummary, DashboardCharts, StockReportItem, MovementReportItem } from '../types/analytics';

export const analyticsService = {
 async getSummary(): Promise<DashboardSummary> {
 const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
 return response.data.data;
 },

 async getCharts(): Promise<DashboardCharts> {
 const response = await api.get<ApiResponse<DashboardCharts>>('/dashboard/charts');
 return response.data.data;
 },

 async getStockReport(params?: { categoryId?: string; status?: string }): Promise<StockReportItem[]> {
 const response = await api.get<ApiResponse<StockReportItem[]>>('/reports/stock', { params });
 return response.data.data;
 },

 async getMovementReport(params?: { startDate?: string; endDate?: string; type?: string; categoryId?: string }): Promise<MovementReportItem[]> {
 const response = await api.get<ApiResponse<MovementReportItem[]>>('/reports/movements', { params });
 return response.data.data;
 }
};
