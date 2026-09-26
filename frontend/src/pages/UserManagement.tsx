import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { systemService } from '../services/system.service';
import { User, RoleName } from '../types/auth';
import { PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Users as UsersIcon, Plus, Search, UserCheck, Shield, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';

const userSchema = z.object({
 email: z.string().email('Format email tidak valid'),
 password: z.string().min(6, 'Password minimal 6 karakter'),
 fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
 roleName: z.enum(['ADMIN_GUDANG', 'SUPERVISOR', 'ADMIN_SISTEM'], {
 errorMap: () => ({ message: 'Pilih role pengguna' }),
 }),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserManagement: React.FC = () => {
 const [users, setUsers] = useState<User[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 const [searchQuery, setSearchQuery] = useState<string>('');
 const [roleFilter, setRoleFilter] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors, isSubmitting },
 } = useForm<UserFormData>({
 resolver: zodResolver(userSchema),
 defaultValues: {
 roleName: 'ADMIN_GUDANG',
 },
 });

 const fetchUsers = async () => {
 setIsLoading(true);
 try {
 const res = await systemService.getUsers({
 q: searchQuery,
 role: roleFilter || undefined,
 page,
 limit: 10,
 });
 setUsers(res.data);
 setMeta(res.meta);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers();
 }, [searchQuery, roleFilter, page]);

 const handleOpenCreateModal = () => {
 reset({ email: '', password: '', fullName: '', roleName: 'ADMIN_GUDANG' });
 setErrorMessage(null);
 setIsModalOpen(true);
 };

 const onSubmit = async (data: UserFormData) => {
 setErrorMessage(null);
 try {
 await systemService.createUser(data);
 setSuccessMessage('Akun pengguna baru berhasil dibuat.');
 setIsModalOpen(false);
 fetchUsers();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal membuat akun pengguna.');
 }
 };

 const handleToggleStatus = async (user: User) => {
 try {
 await systemService.toggleUserStatus(user.id);
 setSuccessMessage(`Status akun '${user.email}' berhasil diubah.`);
 fetchUsers();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal mengubah status pengguna.');
 }
 };

 const getRoleBadgeVariant = (role: RoleName) => {
 switch (role) {
 case 'ADMIN_GUDANG':
 return 'info';
 case 'SUPERVISOR':
 return 'success';
 case 'ADMIN_SISTEM':
 return 'warning';
 default:
 return 'neutral';
 }
 };

 const formatDate = (dateStr?: string) => {
 if (!dateStr) return '-';
 return new Date(dateStr).toLocaleDateString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 });
 };

 const columns: Column<User>[] = [
 {
 header: 'Nama & Email',
 accessor: 'fullName',
 render: (u) => (
 <div>
 <span className="font-semibold text-white block">{u.fullName}</span>
 <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
 </div>
 ),
 },
 {
 header: 'Role Akses',
 accessor: 'role',
 render: (u) => (
 <Badge variant={getRoleBadgeVariant(u.role)}>
 {u.role}
 </Badge>
 ),
 },
 {
 header: 'Status Akun',
 accessor: 'status',
 render: (u) => (
 <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
 {u.status}
 </Badge>
 ),
 },
 {
 header: 'Tanggal Dibuat',
 accessor: 'createdAt',
 render: (u) => <span className="text-slate-400 text-[11px]">{formatDate(u.createdAt)}</span>,
 },
 {
 header: 'Aksi',
 render: (u) => (
 <button
 onClick={() => handleToggleStatus(u)}
 className={`p-1.5 rounded-lg transition ${
 u.status === 'ACTIVE'
 ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
 : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
 }`}
 title={u.status === 'ACTIVE' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
 >
 {u.status === 'ACTIVE' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
 </button>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2">
 <UsersIcon className="w-6 h-6 text-purple-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Pengelolaan User & Role</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Administrasi akun pengguna sistem dan pengalokasian Role-Based Access Control (RBAC).
 </p>
 </div>

 <button
 onClick={handleOpenCreateModal}
 className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Plus className="w-4 h-4" />
 <span>Tambah Akun User</span>
 </button>
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

 {/* Filter / Search */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari email, nama..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
 />
 </div>

 <select
 value={roleFilter}
 onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
 className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Role</option>
 <option value="ADMIN_GUDANG">Admin Gudang</option>
 <option value="SUPERVISOR">Supervisor</option>
 <option value="ADMIN_SISTEM">Admin Sistem</option>
 </select>
 </div>

 {/* Users DataTable */}
 <DataTable
 columns={columns}
 data={users}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada akun pengguna terdaftar."
 />

 {/* Modal Create User */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title="Tambah Akun Pengguna Baru"
 maxWidth="md"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
 <input
 type="text"
 {...register('fullName')}
 placeholder="Contoh: Rian Pratama"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
 />
 {errors.fullName && <p className="mt-1 text-xs text-rose-400">{errors.fullName.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Email</label>
 <input
 type="email"
 {...register('email')}
 placeholder="user@wms.com"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
 />
 {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Password Pertama</label>
 <input
 type="password"
 {...register('password')}
 placeholder="Minimal 6 karakter"
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
 />
 {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Role Akses RBAC</label>
 <select
 {...register('roleName')}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
 >
 <option value="ADMIN_GUDANG">Admin Gudang (Kelola Produk & Transaksi)</option>
 <option value="SUPERVISOR">Supervisor Gudang (Approval & Laporan)</option>
 <option value="ADMIN_SISTEM">Admin Sistem (Kelola User & Audit)</option>
 </select>
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
 className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
 >
 {isSubmitting ? 'Membuat Akun...' : 'Buat Akun User'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
