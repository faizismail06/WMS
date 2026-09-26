import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryService } from '../services/master.service';
import { Category } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Layers, Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

const categorySchema = z.object({
 code: z.string().min(2, 'Kode minimal 2 karakter').max(20),
 name: z.string().min(2, 'Nama kategori wajib diisi'),
 description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const Categories: React.FC = () => {
 const { user } = useAuth();
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [searchQuery, setSearchQuery] = useState<string>('');

 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [editingCategory, setEditingCategory] = useState<Category | null>(null);

 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const canManage = user?.role === 'ADMIN_GUDANG';

 const {
 register,
 handleSubmit,
 reset,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm<CategoryFormData>({
 resolver: zodResolver(categorySchema),
 });

 const fetchCategories = async () => {
 setIsLoading(true);
 try {
 const data = await categoryService.getCategories({ q: searchQuery });
 setCategories(data);
 } catch (err: any) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchCategories();
 }, [searchQuery]);

 const handleOpenCreateModal = () => {
 setEditingCategory(null);
 reset({ code: '', name: '', description: '' });
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const handleOpenEditModal = (category: Category) => {
 setEditingCategory(category);
 setValue('code', category.code);
 setValue('name', category.name);
 setValue('description', category.description || '');
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: CategoryFormData) => {
 setErrorMessage(null);
 try {
 if (editingCategory) {
 await categoryService.updateCategory(editingCategory.id, {
 name: data.name,
 description: data.description,
 });
 setSuccessMessage('Kategori berhasil diperbarui.');
 } else {
 await categoryService.createCategory(data);
 setSuccessMessage('Kategori baru berhasil dibuat.');
 }
 setIsModalOpen(false);
 fetchCategories();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyimpan kategori.');
 }
 };

 const handleDelete = async (category: Category) => {
 if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori '${category.name}'?`)) return;

 setErrorMessage(null);
 setSuccessMessage(null);
 try {
 await categoryService.deleteCategory(category.id);
 setSuccessMessage(`Kategori '${category.name}' berhasil dihapus.`);
 fetchCategories();
 } catch (err: any) {
 const msg = err.response?.data?.message || 'Gagal menghapus kategori.';
 setErrorMessage(msg);
 }
 };

 const columns: Column<Category>[] = [
 {
 header: 'Kode Kategori',
 accessor: 'code',
 render: (cat) => (
 <span className="font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
 {cat.code}
 </span>
 ),
 },
 {
 header: 'Nama Kategori',
 accessor: 'name',
 render: (cat) => (
 <div>
 <span className="font-semibold text-white block">{cat.name}</span>
 <span className="text-slate-400 text-[11px]">{cat.description || '-'}</span>
 </div>
 ),
 },
 {
 header: 'Jumlah Produk',
 accessor: 'productCount',
 render: (cat) => (
 <Badge variant={cat.productCount && cat.productCount > 0 ? 'info' : 'neutral'}>
 {cat.productCount || 0} Produk
 </Badge>
 ),
 },
 {
 header: 'Status',
 accessor: 'status',
 render: (cat) => (
 <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'neutral'}>
 {cat.status}
 </Badge>
 ),
 },
 {
 header: 'Aksi',
 render: (cat) => (
 <div className="flex items-center space-x-2">
 {canManage && (
 <>
 <button
 onClick={() => handleOpenEditModal(cat)}
 className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
 title="Edit Kategori"
 >
 <Edit2 className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleDelete(cat)}
 className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
 title="Hapus Kategori"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </>
 )}
 </div>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Top Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2">
 <Layers className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Kategori Barang</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Kelompokkan barang untuk mempermudah identifikasi dan pemantauan stok persediaan.
 </p>
 </div>

 {canManage && (
 <button
 onClick={handleOpenCreateModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Kategori</span>
 </button>
 )}
 </div>

 {/* Global Alerts */}
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

 {/* Search Bar */}
 <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-full sm:w-72">
 <Search className="w-4 h-4 text-slate-500 mr-2" />
 <input
 type="text"
 placeholder="Cari kode atau nama..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
 />
 </div>

 {/* Categories DataTable */}
 <DataTable
 columns={columns}
 data={categories}
 isLoading={isLoading}
 emptyText="Belum ada data kategori barang."
 />

 {/* Modal Create/Edit */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editingCategory ? 'Edit Kategori Barang' : 'Tambah Kategori Barang Baru'}
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">
 Kode Kategori (SKU Prefix)
 </label>
 <input
 type="text"
 disabled={!!editingCategory}
 {...register('code')}
 placeholder="Contoh: CAT-ELEC"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
 />
 {errors.code && (
 <p className="mt-1 text-xs text-rose-400">{errors.code.message}</p>
 )}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kategori</label>
 <input
 type="text"
 {...register('name')}
 placeholder="Contoh: Elektronik & Kelistrikan"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.name && (
 <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
 )}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi</label>
 <textarea
 rows={3}
 {...register('description')}
 placeholder="Penjelasan singkat mengenai kategori ini..."
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
 {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
