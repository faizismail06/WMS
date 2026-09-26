import api from '../config/axios';
import { ApiResponse } from '../types/auth';
import { StockTransaction, StockInPayload, StockOutPayload, TransactionFilters } from '../types/transaction';

export const transactionService = {
 async getTransactions(filters?: TransactionFilters): Promise<{ data: StockTransaction[]; meta?: any }> {
 const response = await api.get<ApiResponse<StockTransaction[]>>('/stock-transactions', { params: filters });
 return { data: response.data.data, meta: response.data.meta };
 },

 async createStockIn(payload: StockInPayload): Promise<StockTransaction> {
 const response = await api.post<ApiResponse<StockTransaction>>('/stock-transactions/in', payload);
 return response.data.data;
 },

 async createStockOut(payload: StockOutPayload): Promise<StockTransaction> {
 const response = await api.post<ApiResponse<StockTransaction>>('/stock-transactions/out', payload);
 return response.data.data;
 }
};
