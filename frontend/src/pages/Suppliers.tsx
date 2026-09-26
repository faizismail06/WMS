import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supplierService } from '../services/master.service';
import { Supplier, PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, Search, Edit2, Mail, Phone, MapPin, UserCheck, AlertCircle } from 'lucide-react';

const supplierSchema = z.object({
 code: z.string().min(2, 'Kode supplier minimal 2 karakter').max(20),
 name: z.string().min(2, 'Nama supplier wajib diisi'),
 contactPerson: z.string().min(2, 'Contact person wajib diisi'),
 phone: z.string().min(5, 'Nomor telepon wajib diisi'),
 email: z.string().email('Format email tidak valid'),
 address: z.string().min(5, 'Alamat wajib diisi'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export const Suppliers: React.FC = () => {
 const { user } = useAuth();
 const [suppliers, setSuppliers] = useState<Supplier[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const canManage = user?.role === 'ADMIN_GUDANG';

 const {
 register,
 handleSubmit,
 reset,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm<SupplierFormData>({
 resolver: zodResolver(supplierSchema),
 });

 const fetchSuppliers = async () => {
 setIsLoading(true);
 try {
 const res = await supplierService.getSuppliers({ q: searchQuery, page, limit: 10 });
 setSuppliers(res.data);
 setMeta(res.meta);
 } catch (err: any) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchSuppliers();
 }, [searchQuery, page]);

 const handleOpenCreateModal = () => {
 setEditingSupplier(null);
 reset({ code: '', name: '', contactPerson: '', phone: '', email: '', address: '' });
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const handleOpenEditModal = (supplier: Supplier) => {
 setEditingSupplier(supplier);
 setValue('code', supplier.code);
 setValue('name', supplier.name);
 setValue('contactPerson', supplier.contactPerson);
 setValue('phone', supplier.phone);
 setValue('email', supplier.email);
 setValue('address', supplier.address);
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: SupplierFormData) => {
 setErrorMessage(null);
 try {
 if (editingSupplier) {
 await supplierService.updateSupplier(editingSupplier.id, data);
 setSuccessMessage('Data supplier berhasil diperbarui.');
 } else {
 await supplierService.createSupplier(data);
 setSuccessMessage('Supplier baru berhasil ditambahkan.');
 }
 setIsModalOpen(false);
 fetchSuppliers();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyimpan data supplier.');
 }
 };

 const columns: Column<Supplier>[] = [
 {
 header: 'Kode Supplier',
 accessor: 'code',
 render: (sup) => (
 <span className="font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
 {sup.code}
 </span>
 ),
 },
 {
 header: 'Perusahaan Supplier',
 accessor: 'name',
 render: (sup) => (
 <div>
 <span className="font-semibold text-white block">{sup.name}</span>
 <div className="flex items-center text-slate-400 text-[11px] mt-0.5 space-x-2">
 <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-slate-500" />{sup.address}</span>
 </div>
 </div>
 ),
 },
 {
 header: 'Kontak Person',
 accessor: 'contactPerson',
 render: (sup) => (
 <div className="space-y-0.5">
 <div className="flex items-center text-slate-200 font-medium text-xs">
 <UserCheck className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
 {sup.contactPerson}
 </div>
 <div className="flex items-center text-slate-400 text-[11px]">
 <Phone className="w-3 h-3 mr-1 text-slate-500" /> {sup.phone}
 </div>
 <div className="flex items-center text-slate-400 text-[11px]">
 <Mail className="w-3 h-3 mr-1 text-slate-500" /> {sup.email}
 </div>
 </div>
 ),
 },
 {
 header: 'Status',
 accessor: 'status',
 render: (sup) => (
 <Badge variant={sup.status === 'ACTIVE' ? 'success' : 'neutral'}>
 {sup.status}
 </Badge>
 ),
 },
 {
 header: 'Aksi',
 render: (sup) => (
 <div className="flex items-center space-x-2">
 {canManage && (
 <button
 onClick={() => handleOpenEditModal(sup)}
 className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
 title="Edit Supplier"
 >
 <Edit2 className="w-4 h-4" />
 </button>
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
 <Truck className="w-6 h-6 text-emerald-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Supplier</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Daftar produsen dan pengemas barang yang terikat dengan penerimaan stok barang gudang.
 </p>
 </div>

 {canManage && (
 <button
 onClick={handleOpenCreateModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Supplier</span>
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

 {/* Filter / Search */}
 <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-full sm:w-72">
 <Search className="w-4 h-4 text-slate-500 mr-2" />
 <input
 type="text"
 placeholder="Cari kode, nama, kontak..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setPage(1);
 }}
 className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
 />
 </div>

 {/* Suppliers DataTable */}
 <DataTable
 columns={columns}
 data={suppliers}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada data supplier."
 />

 {/* Create / Edit Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
 maxWidth="xl"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Supplier</label>
 <input
 type="text"
 disabled={!!editingSupplier}
 {...register('code')}
 placeholder="Contoh: SUP-011"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
 />
 {errors.code && <p className="mt-1 text-xs text-rose-400">{errors.code.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Perusahaan</label>
 <input
 type="text"
 {...register('name')}
 placeholder="Contoh: PT Indofood Sukses Makmur"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
 <input
 type="text"
 {...register('contactPerson')}
 placeholder="Nama penanggung jawab"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {errors.contactPerson && <p className="mt-1 text-xs text-rose-400">{errors.contactPerson.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Telepon</label>
 <input
 type="text"
 {...register('phone')}
 placeholder="021-xxxxxxxx"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
 <input
 type="email"
 {...register('email')}
 placeholder="sales@supplier.com"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
 <textarea
 rows={3}
 {...register('address')}
 placeholder="Alamat pabrik / gudang supplier..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {errors.address && <p className="mt-1 text-xs text-rose-400">{errors.address.message}</p>}
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
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
 >
 {isSubmitting ? 'Menyimpan...' : 'Simpan Supplier'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
