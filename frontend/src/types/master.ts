export interface Category {
 id: string;
 code: string;
 name: string;
 description?: string;
 status: 'ACTIVE' | 'INACTIVE';
 productCount?: number;
 createdAt: string;
 updatedAt: string;
}

export interface Supplier {
 id: string;
 code: string;
 name: string;
 contactPerson: string;
 phone: string;
 email: string;
 address: string;
 status: 'ACTIVE' | 'INACTIVE';
 createdAt: string;
 updatedAt: string;
}

export interface Product {
 id: string;
 sku: string;
 name: string;
 description?: string;
 categoryId: string;
 category: {
 id: string;
 code: string;
 name: string;
 };
 unit: string;
 supplierId: string;
 supplier: {
 id: string;
 code: string;
 name: string;
 };
 price: number;
 stock: number;
 minStock: number;
 rackLocation: string;
 status: 'ACTIVE' | 'INACTIVE';
 createdAt: string;
 updatedAt: string;
}

export interface ProductFilters {
 q?: string;
 categoryId?: string;
 supplierId?: string;
 status?: string;
 lowStock?: boolean;
 page?: number;
 limit?: number;
 sortBy?: string;
 sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
 page: number;
 limit: number;
 totalRecords: number;
 totalPages: number;
}
