import api from '../config/axios';
import { ApiResponse } from '../types/auth';
import { Category, Supplier, Product, ProductFilters } from '../types/master';

export const categoryService = {
 async getCategories(params?: { q?: string; status?: string }): Promise<Category[]> {
 const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
 return response.data.data;
 },

 async createCategory(payload: { code: string; name: string; description?: string }): Promise<Category> {
 const response = await api.post<ApiResponse<Category>>('/categories', payload);
 return response.data.data;
 },

 async updateCategory(id: string, payload: { name?: string; description?: string; status?: string }): Promise<Category> {
 const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
 return response.data.data;
 },

 async deleteCategory(id: string): Promise<void> {
 await api.delete(`/categories/${id}`);
 }
};

export const supplierService = {
 async getSuppliers(params?: { q?: string; status?: string; page?: number; limit?: number }): Promise<{ data: Supplier[]; meta?: any }> {
 const response = await api.get<ApiResponse<Supplier[]>>('/suppliers', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 async createSupplier(payload: { code: string; name: string; contactPerson: string; phone: string; email: string; address: string }): Promise<Supplier> {
 const response = await api.post<ApiResponse<Supplier>>('/suppliers', payload);
 return response.data.data;
 },

 async updateSupplier(id: string, payload: Partial<Supplier>): Promise<Supplier> {
 const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload);
 return response.data.data;
 }
};

export const productService = {
 async getProducts(filters?: ProductFilters): Promise<{ data: Product[]; meta?: any }> {
 const params = {
 ...filters,
 lowStock: filters?.lowStock ? 'true' : undefined
 };
 const response = await api.get<ApiResponse<Product[]>>('/products', { params });
 return { data: response.data.data, meta: response.data.meta };
 },

 async getProductById(id: string): Promise<Product> {
 const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
 return response.data.data;
 },

 async createProduct(payload: {
 sku: string;
 name: string;
 description?: string;
 categoryId: string;
 unit: string;
 supplierId: string;
 price: number;
 stock: number;
 minStock: number;
 rackLocation: string;
 }): Promise<Product> {
 const response = await api.post<ApiResponse<Product>>('/products', payload);
 return response.data.data;
 },

 async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
 const response = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
 return response.data.data;
 },

 async toggleStatus(id: string): Promise<Product> {
 const response = await api.patch<ApiResponse<Product>>(`/products/${id}/status`);
 return response.data.data;
 }
};
