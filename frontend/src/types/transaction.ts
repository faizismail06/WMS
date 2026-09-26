export type TransactionType = 'IN' | 'OUT';

export interface StockTransactionItem {
 id: string;
 transactionId: string;
 productId: string;
 product: {
 id: string;
 sku: string;
 name: string;
 unit: string;
 };
 quantity: number;
 unitPrice: number;
 totalPrice: number;
 stockBefore: number;
 stockAfter: number;
}

export interface StockTransaction {
 id: string;
 transactionNo: string;
 type: TransactionType;
 date: string;
 supplierId?: string;
 supplier?: {
 id: string;
 code: string;
 name: string;
 };
 destination?: string;
 notes?: string;
 createdById: string;
 createdBy: {
 id: string;
 fullName: string;
 email: string;
 };
 items: StockTransactionItem[];
 createdAt: string;
}

export interface StockInPayload {
 supplierId: string;
 notes?: string;
 items: {
 productId: string;
 quantity: number;
 unitPrice: number;
 }[];
}

export interface StockOutPayload {
 destination: string;
 notes?: string;
 items: {
 productId: string;
 quantity: number;
 }[];
}

export interface TransactionFilters {
 type?: 'IN' | 'OUT';
 q?: string;
 startDate?: string;
 endDate?: string;
 page?: number;
 limit?: number;
}
