import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { opnameService } from '../services/inventory.service';
import { StockOpname as IStockOpname, OpnameStatus } from '../types/inventory';
import { PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Plus, Search, Eye, Edit3, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const opnameSchema = z.object({
 title: z.string().min(3, 'Judul sesi opname wajib diisi'),
 period: z.string().min(4, 'Periode opname wajib diisi (Contoh: 2026-09)'),
 notes: z.string().optional(),
});

type OpnameFormData = z.infer<typeof opnameSchema>;

export const StockOpname: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [opnames, setOpnames] = useState<IStockOpname[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 const [searchQuery, setSearchQuery] = useState<string>('');
 const [statusFilter, setStatusFilter] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);

 const canManage = user?.role === 'ADMIN_GUDANG';

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors, isSubmitting },
 } = useForm<OpnameFormData>({
 resolver: zodResolver(opnameSchema),
 defaultValues: {
 period: new Date().toISOString().slice(0, 7),
 },
 });

 const fetchOpnames = async () => {
 setIsLoading(true);
 try {
 const res = await opnameService.getOpnames({
 q: searchQuery,
 status: statusFilter || undefined,
 page,
 limit: 10,
 });
 setOpnames(res.data);
 setMeta(res.meta);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchOpnames();
 }, [searchQuery, statusFilter, page]);

 const handleOpenCreateModal = () => {
 reset({
 title: `Stock Opname Bulanan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
 period: new Date().toISOString().slice(0, 7),
 notes: '',
 });
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: OpnameFormData) => {
 setErrorMessage(null);
 try {
 const newOpn = await opnameService.createOpname(data);
 setIsModalOpen(false);
 navigate(`/stock-opname/${newOpn.id}`);
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal membuat sesi stock opname.');
 }
 };

 const getStatusBadgeVariant = (status: OpnameStatus) => {
 switch (status) {
 case 'DRAFT':
 return 'neutral';
 case 'COUNTING':
 return 'info';
 case 'WAITING_APPROVAL':
 return 'warning';
 case 'APPROVED':
 case 'COMPLETED':
 return 'success';
 case 'REJECTED':
 return 'danger';
 default:
 return 'neutral';
 }
 };

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 });
 };

 const columns: Column<IStockOpname>[] = [
 {
 header: 'No. Opname & Periode',
 accessor: 'opnameNo',
 render: (opn) => (
 <div>
 <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 text-xs">
 {opn.opnameNo}
 </span>
 <span className="text-[10px] text-slate-400 block font-semibold mt-1">Periode: {opn.period}</span>
 </div>
 ),
 },
 {
 header: 'Judul Sesi Opname',
 accessor: 'title',
 render: (opn) => (
 <div>
 <span className="font-semibold text-white block">{opn.title}</span>
 <span className="text-slate-400 text-[11px] line-clamp-1">{opn.notes || '-'}</span>
 </div>
 ),
 },
 {
 header: 'Status Sesi',
 accessor: 'status',
 render: (opn) => (
 <Badge variant={getStatusBadgeVariant(opn.status)}>
 {opn.status}
 </Badge>
 ),
 },
 {
 header: 'Kreator / Verifikator',
 render: (opn) => (
 <div className="text-[11px] space-y-0.5">
 <span className="text-slate-300 block">Dibuat: {opn.createdBy?.fullName}</span>
 {opn.verifiedBy && (
 <span className="text-emerald-400 block font-medium">Verifikasi: {opn.verifiedBy.fullName}</span>
 )}
 </div>
 ),
 },
 {
 header: 'Aksi',
 render: (opn) => (
 <Link
 to={`/stock-opname/${opn.id}`}
 className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-semibold text-xs transition space-x-1"
 >
 <span>{opn.status === 'WAITING_APPROVAL' && user?.role === 'SUPERVISOR' ? 'Verifikasi' : 'Buka Detail'}</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2">
 <ClipboardCheck className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Workflow Stock Opname</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Audit fisik persediaan barang pergudangan dengan verifikasi dan approval Supervisor.
 </p>
 </div>

 {canManage && (
 <button
 onClick={handleOpenCreateModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Buat Sesi Opname Baru</span>
 </button>
 )}
 </div>

 {/* Filter / Search */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari No. Opname, judul..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
 />
 </div>

 <select
 value={statusFilter}
 onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
 className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Status</option>
 <option value="DRAFT">DRAFT</option>
 <option value="COUNTING">COUNTING</option>
 <option value="WAITING_APPROVAL">WAITING_APPROVAL</option>
 <option value="APPROVED">APPROVED</option>
 <option value="REJECTED">REJECTED</option>
 <option value="COMPLETED">COMPLETED</option>
 </select>
 </div>

 {/* Opname DataTable */}
 <DataTable
 columns={columns}
 data={opnames}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada sesi Stock Opname."
 />

 {/* Modal Create Opname */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title="Buat Sesi Stock Opname Baru"
 >
 {errorMessage && (
 <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
 {errorMessage}
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Sesi Opname</label>
 <input
 type="text"
 {...register('title')}
 placeholder="Contoh: Stock Opname Bulanan September 2026"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Periode (YYYY-MM)</label>
 <input
 type="text"
 {...register('period')}
 placeholder="2026-09"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {errors.period && <p className="mt-1 text-xs text-rose-400">{errors.period.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Lingkup Audit</label>
 <textarea
 rows={3}
 {...register('notes')}
 placeholder="Catatan area gudang atau kelompok barang yang diaudit..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
 Sistem akan mengambil *snapshot* seluruh produk aktif beserta kuantitas stok saat ini.
 </p>

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
 {isSubmitting ? 'Membuat Sesi...' : 'Buat Sesi & Mulai Count'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
