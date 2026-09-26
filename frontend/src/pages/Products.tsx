import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productService, categoryService, supplierService } from '../services/master.service';
import { Product, Category, Supplier, PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
 Package,
 Plus,
 Search,
 Edit2,
 AlertTriangle,
 Eye,
 Filter,
 AlertCircle,
 MapPin,
 Tag,
 DollarSign,
 ToggleLeft,
 ToggleRight,
} from 'lucide-react';

const productSchema = z.object({
 sku: z.string().min(3, 'SKU minimal 3 karakter').max(30),
 name: z.string().min(2, 'Nama barang wajib diisi'),
 description: z.string().optional(),
 categoryId: z.string().min(1, 'Pilih kategori barang'),
 unit: z.string().min(1, 'Satuan barang wajib diisi'),
 supplierId: z.string().min(1, 'Pilih supplier barang'),
 price: z.coerce.number().positive('Harga harus lebih dari 0'),
 stock: z.coerce.number().int().nonnegative('Stok awal tidak boleh negatif'),
 minStock: z.coerce.number().int().nonnegative('Minimum stok wajib diisi'),
 rackLocation: z.string().min(1, 'Lokasi rak wajib diisi'),
});

type ProductFormData = z.infer<typeof productSchema>;

export const Products: React.FC = () => {
 const { user } = useAuth();
 const [products, setProducts] = useState<Product[]>([]);
 const [categories, setCategories] = useState<Category[]>([]);
 const [suppliers, setSuppliers] = useState<Supplier[]>([]);

 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 // Filters state
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [selectedCategory, setSelectedCategory] = useState<string>('');
 const [filterTab, setFilterTab] = useState<'ALL' | 'LOW_STOCK' | 'INACTIVE'>('ALL');
 const [page, setPage] = useState<number>(1);

 // Modals state
 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [detailProduct, setDetailProduct] = useState<Product | null>(null);

 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const canManage = user?.role === 'ADMIN_GUDANG';

 const {
 register,
 handleSubmit,
 reset,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm<ProductFormData>({
 resolver: zodResolver(productSchema),
 });

 const fetchDropdownData = async () => {
 try {
 const [catList, supRes] = await Promise.all([
 categoryService.getCategories({ status: 'ACTIVE' }),
 supplierService.getSuppliers({ status: 'ACTIVE', limit: 100 }),
 ]);
 setCategories(catList);
 setSuppliers(supRes.data);
 } catch (err) {
 console.error('Failed to load dropdown data:', err);
 }
 };

 const fetchProducts = async () => {
 setIsLoading(true);
 try {
 const res = await productService.getProducts({
 q: searchQuery,
 categoryId: selectedCategory || undefined,
 status: filterTab === 'INACTIVE' ? 'INACTIVE' : undefined,
 lowStock: filterTab === 'LOW_STOCK',
 page,
 limit: 10,
 });
 setProducts(res.data);
 setMeta(res.meta);
 } catch (err: any) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchDropdownData();
 }, []);

 useEffect(() => {
 fetchProducts();
 }, [searchQuery, selectedCategory, filterTab, page]);

 const handleOpenCreateModal = () => {
 setEditingProduct(null);
 reset({
 sku: '',
 name: '',
 description: '',
 categoryId: categories[0]?.id || '',
 unit: 'PCS',
 supplierId: suppliers[0]?.id || '',
 price: 0,
 stock: 0,
 minStock: 5,
 rackLocation: '',
 });
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const handleOpenEditModal = (product: Product) => {
 setEditingProduct(product);
 setValue('sku', product.sku);
 setValue('name', product.name);
 setValue('description', product.description || '');
 setValue('categoryId', product.categoryId);
 setValue('unit', product.unit);
 setValue('supplierId', product.supplierId);
 setValue('price', Number(product.price));
 setValue('stock', product.stock);
 setValue('minStock', product.minStock);
 setValue('rackLocation', product.rackLocation);
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: ProductFormData) => {
 setErrorMessage(null);
 try {
 if (editingProduct) {
 await productService.updateProduct(editingProduct.id, data);
 setSuccessMessage('Data barang berhasil diperbarui.');
 } else {
 await productService.createProduct(data);
 setSuccessMessage('Barang baru berhasil ditambahkan.');
 }
 setIsModalOpen(false);
 fetchProducts();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyimpan data barang.');
 }
 };

 const handleToggleStatus = async (product: Product) => {
 try {
 await productService.toggleStatus(product.id);
 setSuccessMessage(`Status barang '${product.sku}' berhasil diubah.`);
 fetchProducts();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal mengubah status barang.');
 }
 };

 const formatCurrency = (val: number) => {
 return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
 };

 const columns: Column<Product>[] = [
 {
 header: 'SKU & Rak',
 accessor: 'sku',
 render: (prd) => (
 <div>
 <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 text-xs">
 {prd.sku}
 </span>
 <div className="flex items-center text-slate-400 text-[11px] mt-1">
 <MapPin className="w-3 h-3 text-amber-400 mr-1" />
 <span className="font-medium text-slate-300">{prd.rackLocation}</span>
 </div>
 </div>
 ),
 },
 {
 header: 'Nama Barang',
 accessor: 'name',
 render: (prd) => (
 <div className="max-w-xs">
 <span className="font-semibold text-white block truncate">{prd.name}</span>
 <span className="text-slate-400 text-[11px] line-clamp-1">{prd.description || '-'}</span>
 </div>
 ),
 },
 {
 header: 'Kategori & Supplier',
 render: (prd) => (
 <div className="space-y-0.5">
 <Badge variant="info">{prd.category?.name || '-'}</Badge>
 <p className="text-[11px] text-slate-400 font-medium truncate">{prd.supplier?.name || '-'}</p>
 </div>
 ),
 },
 {
 header: 'Stok Persediaan',
 accessor: 'stock',
 render: (prd) => {
 const isLow = prd.stock <= prd.minStock;
 return (
 <div className="space-y-1">
 <div className="flex items-center space-x-1.5">
 <span className={`font-bold text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
 {prd.stock} {prd.unit}
 </span>
 {isLow && (
 <span className="p-0.5 rounded bg-rose-500/20 text-rose-400" title="Stok Menipis!">
 <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
 </span>
 )}
 </div>
 <p className="text-[10px] text-slate-500">Min: {prd.minStock} {prd.unit}</p>
 </div>
 );
 },
 },
 {
 header: 'Harga Satuan',
 accessor: 'price',
 render: (prd) => (
 <span className="font-semibold text-slate-200">{formatCurrency(Number(prd.price))}</span>
 ),
 },
 {
 header: 'Status',
 accessor: 'status',
 render: (prd) => (
 <Badge variant={prd.status === 'ACTIVE' ? 'success' : 'neutral'}>
 {prd.status}
 </Badge>
 ),
 },
 {
 header: 'Aksi',
 render: (prd) => (
 <div className="flex items-center space-x-1.5">
 <button
 onClick={() => setDetailProduct(prd)}
 className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
 title="Lihat Detail Barang"
 >
 <Eye className="w-4 h-4" />
 </button>
 {canManage && (
 <>
 <button
 onClick={() => handleOpenEditModal(prd)}
 className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
 title="Edit Data Barang"
 >
 <Edit2 className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleToggleStatus(prd)}
 className={`p-1.5 rounded-lg transition ${
 prd.status === 'ACTIVE'
 ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
 : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
 }`}
 title={prd.status === 'ACTIVE' ? 'Nonaktifkan Barang' : 'Aktifkan Barang'}
 >
 {prd.status === 'ACTIVE' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
 </button>
 </>
 )}
 </div>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2">
 <Package className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Pengelolaan Data Barang</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Manajemen lengkap katalog produk persediaan, lokasi rak, harga, dan kontrol batas stok minimum.
 </p>
 </div>

 {canManage && (
 <button
 onClick={handleOpenCreateModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Barang Baru</span>
 </button>
 )}
 </div>

 {/* Notifications */}
 {errorMessage && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-400 text-sm">
 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
 <span>{errorMessage}</span>
 </div>
 )}

 {successMessage && (
 <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
 {successMessage}
 </div>
 )}

 {/* Filter Toolbar & Quick Tabs */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
 {/* Quick Filter Tabs */}
 <div className="flex items-center space-x-2">
 <button
 onClick={() => { setFilterTab('ALL'); setPage(1); }}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 filterTab === 'ALL'
 ? 'bg-indigo-600 text-white shadow-md'
 : 'bg-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 Semua Produk
 </button>
 <button
 onClick={() => { setFilterTab('LOW_STOCK'); setPage(1); }}
 className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 filterTab === 'LOW_STOCK'
 ? 'bg-rose-600 text-white shadow-md'
 : 'bg-slate-800 text-slate-400 hover:text-rose-400'
 }`}
 >
 <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
 Stok Menipis
 </button>
 <button
 onClick={() => { setFilterTab('INACTIVE'); setPage(1); }}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 filterTab === 'INACTIVE'
 ? 'bg-slate-700 text-white'
 : 'bg-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 >
 Nonaktif
 </button>
 </div>

 {/* Search & Category Select */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari SKU, nama, lokasi..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <div className="relative w-full sm:w-48">
 <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
 <select
 value={selectedCategory}
 onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 >
 <option value="">Semua Kategori</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 {cat.name}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Products DataTable */}
 <DataTable
 columns={columns}
 data={products}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Tidak ada barang yang memenuhi kriteria pencarian."
 />

 {/* Create / Edit Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editingProduct ? 'Edit Data Barang' : 'Tambah Barang Baru'}
 maxWidth="2xl"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Barang</label>
 <input
 type="text"
 disabled={!!editingProduct}
 {...register('sku')}
 placeholder="PRD-ELEC-001"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
 />
 {errors.sku && <p className="mt-1 text-xs text-rose-400">{errors.sku.message}</p>}
 </div>

 <div className="sm:col-span-2">
 <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Barang</label>
 <input
 type="text"
 {...register('name')}
 placeholder="Nama lengkap produk..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori Barang</label>
 <select
 {...register('categoryId')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 >
 <option value="">-- Pilih Kategori --</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 {errors.categoryId && <p className="mt-1 text-xs text-rose-400">{errors.categoryId.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Utam</label>
 <select
 {...register('supplierId')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 >
 <option value="">-- Pilih Supplier --</option>
 {suppliers.map((s) => (
 <option key={s.id} value={s.id}>{s.name}</option>
 ))}
 </select>
 {errors.supplierId && <p className="mt-1 text-xs text-rose-400">{errors.supplierId.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Satuan</label>
 <input
 type="text"
 {...register('unit')}
 placeholder="PCS, BOX, ROLL"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.unit && <p className="mt-1 text-xs text-rose-400">{errors.unit.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Satuan (IDR)</label>
 <input
 type="number"
 {...register('price')}
 placeholder="0"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Stok Awal</label>
 <input
 type="number"
 {...register('stock')}
 placeholder="0"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.stock && <p className="mt-1 text-xs text-rose-400">{errors.stock.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Stok</label>
 <input
 type="number"
 {...register('minStock')}
 placeholder="5"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.minStock && <p className="mt-1 text-xs text-rose-400">{errors.minStock.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Rak</label>
 <input
 type="text"
 {...register('rackLocation')}
 placeholder="Contoh: RAK-A1-04"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.rackLocation && <p className="mt-1 text-xs text-rose-400">{errors.rackLocation.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Tambahan</label>
 <input
 type="text"
 {...register('description')}
 placeholder="Spesifikasi / catatan barang..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>
 </div>

 <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
 >
 {isSubmitting ? 'Menyimpan...' : 'Simpan Barang'}
 </button>
 </div>
 </form>
 </Modal>

 {/* Detail Product Modal */}
 {detailProduct && (
 <Modal
 isOpen={!!detailProduct}
 onClose={() => setDetailProduct(null)}
 title={`Detail Spesifikasi Barang - ${detailProduct.sku}`}
 maxWidth="lg"
 >
 <div className="space-y-4 text-xs text-slate-300">
 <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
 <div>
 <span className="font-mono text-indigo-400 font-bold text-sm">{detailProduct.sku}</span>
 <h3 className="text-base font-bold text-white mt-1">{detailProduct.name}</h3>
 </div>
 <Badge variant={detailProduct.stock <= detailProduct.minStock ? 'danger' : 'success'}>
 Stok: {detailProduct.stock} {detailProduct.unit}
 </Badge>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
 <span className="text-slate-500 block text-[10px] uppercase font-semibold">Kategori</span>
 <span className="font-medium text-white">{detailProduct.category?.name}</span>
 </div>

 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
 <span className="text-slate-500 block text-[10px] uppercase font-semibold">Supplier</span>
 <span className="font-medium text-white">{detailProduct.supplier?.name}</span>
 </div>

 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
 <span className="text-slate-500 block text-[10px] uppercase font-semibold">Harga Satuan</span>
 <span className="font-bold text-emerald-400">{formatCurrency(Number(detailProduct.price))}</span>
 </div>

 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
 <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lokasi Rak</span>
 <span className="font-mono font-bold text-amber-400">{detailProduct.rackLocation}</span>
 </div>
 </div>

 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
 <span className="text-slate-500 block text-[10px] uppercase font-semibold">Deskripsi / Spesifikasi</span>
 <p className="mt-1 text-slate-300 leading-relaxed">{detailProduct.description || 'Tidak ada deskripsi tambahan.'}</p>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
};
