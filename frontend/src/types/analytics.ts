export interface DashboardSummary {
 totalProducts: number;
 totalStockUnits: number;
 monthlyStockInVolume: number;
 monthlyStockOutVolume: number;
 lowStockCount: number;
 totalSuppliers: number;
}

export interface MonthlyTrendData {
 date: string;
 stockIn: number;
 stockOut: number;
}

export interface CategoryDistributionData {
 name: string;
 stock: number;
}

export interface TopLowStockData {
 id: string;
 sku: string;
 name: string;
 stock: number;
 minStock: number;
 unit: string;
}

export interface FastMovingData {
 sku: string;
 name: string;
 quantityOut: number;
 unit: string;
}

export interface DashboardCharts {
 monthlyTrend: MonthlyTrendData[];
 categoryDistribution: CategoryDistributionData[];
 topLowStock: TopLowStockData[];
 fastMovingProducts: FastMovingData[];
}

export interface StockReportItem {
 id: string;
 sku: string;
 name: string;
 category: string;
 supplier: string;
 unit: string;
 price: number;
 stock: number;
 minStock: number;
 totalAssetValue: number;
 rackLocation: string;
 isLowStock: boolean;
 status: string;
}

export interface MovementReportItem {
 id: string;
 date: string;
 transactionNo: string;
 type: 'IN' | 'OUT';
 sku: string;
 productName: string;
 category: string;
 quantity: number;
 unit: string;
 stockBefore: number;
 stockAfter: number;
 sourceOrDestination: string;
 createdBy: string;
}
