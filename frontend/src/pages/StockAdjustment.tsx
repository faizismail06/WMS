import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adjustmentService } from '../services/inventory.service';
import { productService } from '../services/master.service';
import { StockAdjustment as IStockAdjustment } from '../types/inventory';
import { Product, PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Sliders, Plus, Search, CheckCircle2, AlertCircle, ArrowRightLeft } from 'lucide-react';

const adjustmentSchema = z.object({
 productId: z.string().min(1, 'Pilih barang yang akan disesuaikan'),
 actualStock: z.coerce.number().int().nonnegative('Stok aktual tidak boleh negatif'),
 reason: z.enum(['DAMAGED', 'EXPIRED', 'LOST', 'FOUND', 'OTHER'], {
 errorMap: () => ({ message: 'Pilih alasan penyesuaian' }),
 }),
 notes: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

export const StockAdjustment: React.FC = () => {
 const { user } = useAuth();
 const [adjustments, setAdjustments] = useState<IStockAdjustment[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 const [searchQuery, setSearchQuery] = useState<string>('');
 const [reasonFilter, setReasonFilter] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const canManage = user?.role === 'ADMIN_GUDANG';

 const {
 register,
 handleSubmit,
 reset,
 watch,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm<AdjustmentFormData>({
 resolver: zodResolver(adjustmentSchema),
 defaultValues: {
 actualStock: 0,
 reason: 'DAMAGED',
 },
 });

 const watchedProductId = watch('productId');

 const fetchAdjustments = async () => {
 setIsLoading(true);
 try {
 const res = await adjustmentService.getAdjustments({
 q: searchQuery,
 reason: reasonFilter || undefined,
 page,
 limit: 10,
 });
 setAdjustments(res.data);
 setMeta(res.meta);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 const loadProducts = async () => {
 try {
 const res = await productService.getProducts({ status: 'ACTIVE', limit: 100 });
 setProducts(res.data);
 } catch (err) {
 console.error(err);
 }
 };

 useEffect(() => {
 loadProducts();
 }, []);

 useEffect(() => {
 fetchAdjustments();
 }, [searchQuery, reasonFilter, page]);

 useEffect(() => {
 if (watchedProductId) {
 const p = products.find((prod) => prod.id === watchedProductId);
 setSelectedProduct(p || null);
 if (p) setValue('actualStock', p.stock);
 } else {
 setSelectedProduct(null);
 }
 }, [watchedProductId, products, setValue]);

 const handleOpenModal = () => {
 reset({ productId: '', actualStock: 0, reason: 'DAMAGED', notes: '' });
 setSelectedProduct(null);
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: AdjustmentFormData) => {
 setErrorMessage(null);
 try {
 await adjustmentService.createAdjustment(data);
 setSuccessMessage('Penyesuaian stok berhasil disimpan.');
 setIsModalOpen(false);
 fetchAdjustments();
 loadProducts();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyimpan penyesuaian stok.');
 }
 };

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });
 };

 const columns: Column<IStockAdjustment>[] = [
 {
 header: 'No. Adjustment',
 accessor: 'adjustmentNo',
 render: (adj) => (
 <span className="font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 text-xs">
 {adj.adjustmentNo}
 </span>
 ),
 },
 {
 header: 'Barang',
 render: (adj) => (
 <div>
 <span className="font-mono text-[11px] text-slate-400 font-semibold">{adj.product?.sku}</span>
 <span className="font-semibold text-white block">{adj.product?.name}</span>
 </div>
 ),
 },
 {
 header: 'Koreksi Stok',
 render: (adj) => (
 <div className="font-mono text-xs">
 <span className="text-slate-400">{adj.systemStock}</span>
 <span className="mx-1 text-slate-600">{'->'}</span>
 <span className="font-bold text-white">{adj.actualStock}</span>
 <span
 className={`ml-2 font-bold ${
 adj.difference > 0 ? 'text-emerald-400' : adj.difference < 0 ? 'text-rose-400' : 'text-slate-400'
 }`}
 >
 ({adj.difference > 0 ? `+${adj.difference}` : adj.difference})
 </span>
 </div>
 ),
 },
 {
 header: 'Alasan',
 accessor: 'reason',
 render: (adj) => (
 <Badge
 variant={
 adj.reason === 'FOUND'
 ? 'success'
 : adj.reason === 'DAMAGED' || adj.reason === 'LOST' || adj.reason === 'EXPIRED'
 ? 'danger'
 : 'neutral'
 }
 >
 {adj.reason}
 </Badge>
 ),
 },
 {
 header: 'User & Waktu',
 render: (adj) => (
 <div>
 <span className="text-slate-200 font-medium block">{adj.createdBy?.fullName}</span>
 <span className="text-[10px] text-slate-500">{formatDate(adj.createdAt)}</span>
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
 <Sliders className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Penyesuaian Stok (Stock Adjustment)</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Koreksi stok manual secara instan untuk barang rusak, kadaluwarsa, hilang, atau ditemukan.
 </p>
 </div>

 {canManage && (
 <button
 onClick={handleOpenModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Buat Adjustment</span>
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
 <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3 text-emerald-400 text-sm">
 <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
 <span>{successMessage}</span>
 </div>
 )}

 {/* Search & Filter */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari No. Adj, SKU, nama..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
 />
 </div>

 <select
 value={reasonFilter}
 onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
 className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Alasan</option>
 <option value="DAMAGED">Rusak (DAMAGED)</option>
 <option value="EXPIRED">Kadaluwarsa (EXPIRED)</option>
 <option value="LOST">Hilang (LOST)</option>
 <option value="FOUND">Ditemukan (FOUND)</option>
 <option value="OTHER">Lainnya (OTHER)</option>
 </select>
 </div>

 {/* Adjustments DataTable */}
 <DataTable
 columns={columns}
 data={adjustments}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada data penyesuaian stok."
 />

 {/* Modal Create Adjustment */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title="Buat Penyesuaian Stok Baru"
 maxWidth="lg"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Barang</label>
 <select
 {...register('productId')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 >
 <option value="">-- Pilih Barang --</option>
 {products.map((p) => (
 <option key={p.id} value={p.id}>
 [{p.sku}] {p.name} (Stok Sistem: {p.stock} {p.unit})
 </option>
 ))}
 </select>
 {errors.productId && <p className="mt-1 text-xs text-rose-400">{errors.productId.message}</p>}
 </div>

 {selectedProduct && (
 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
 <span className="text-slate-400 font-medium">Stok Sistem Saat Ini:</span>
 <span className="font-bold text-white">{selectedProduct.stock} {selectedProduct.unit}</span>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Stok Aktual (Hasil Fisik)</label>
 <input
 type="number"
 min="0"
 {...register('actualStock')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.actualStock && <p className="mt-1 text-xs text-rose-400">{errors.actualStock.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Alasan Penyesuaian</label>
 <select
 {...register('reason')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 >
 <option value="DAMAGED">Barang Rusak (DAMAGED)</option>
 <option value="EXPIRED">Kadaluwarsa (EXPIRED)</option>
 <option value="LOST">Hilang (LOST)</option>
 <option value="FOUND">Ditemukan Lebih (FOUND)</option>
 <option value="OTHER">Lainnya (OTHER)</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Penjelasan</label>
 <textarea
 rows={2}
 {...register('notes')}
 placeholder="Catatan detail penyebab penyesuaian..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
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
 {isSubmitting ? 'Memproses...' : 'Simpan Penyesuaian'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
