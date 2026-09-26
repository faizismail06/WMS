import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opnameService } from '../services/inventory.service';
import { StockOpname, StockOpnameItem } from '../types/inventory';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
 ArrowLeft,
 Save,
 Send,
 CheckCircle,
 XCircle,
 AlertCircle,
 ClipboardCheck,
 CheckCircle2,
 AlertTriangle,
} from 'lucide-react';

export const OpnameDetail: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user } = useAuth();

 const [opname, setOpname] = useState<StockOpname | null>(null);
 const [items, setItems] = useState<StockOpnameItem[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [isSaving, setIsSaving] = useState<boolean>(false);

 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 // Reject Modal state
 const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
 const [rejectionReason, setRejectionReason] = useState<string>('');

 const isAdminGudang = user?.role === 'ADMIN_GUDANG';
 const isSupervisor = user?.role === 'SUPERVISOR';

 const fetchDetail = async () => {
 if (!id) return;
 setIsLoading(true);
 try {
 const data = await opnameService.getOpnameById(id);
 setOpname(data);
 setItems(data.items || []);
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal memuat detail opname.');
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchDetail();
 }, [id]);

 const handlePhysicalCountChange = (itemId: string, val: number) => {
 setItems((prev) =>
 prev.map((item) => {
 if (item.id === itemId) {
 const physicalStock = Math.max(0, val);
 const difference = physicalStock - item.systemStock;
 return { ...item, physicalStock, difference };
 }
 return item;
 })
 );
 };

 const handleNotesChange = (itemId: string, notes: string) => {
 setItems((prev) =>
 prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
 );
 };

 const handleSaveCounts = async () => {
 if (!id) return;
 setIsSaving(true);
 setErrorMessage(null);
 try {
 await opnameService.updateCounts(
 id,
 items.map((i) => ({
 id: i.id,
 physicalStock: i.physicalStock,
 notes: i.notes,
 }))
 );
 setSuccessMessage('Data perhitungan fisik stok berhasil disimpan.');
 fetchDetail();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyimpan hitungan opname.');
 } finally {
 setIsSaving(false);
 }
 };

 const handleSubmitToSupervisor = async () => {
 if (!id) return;
 if (!window.confirm('Apakah Anda yakin ingin menyerahkan sesi opname ini ke Supervisor untuk verifikasi?')) return;

 setIsSaving(true);
 setErrorMessage(null);
 try {
 await handleSaveCounts();
 await opnameService.submitOpname(id);
 setSuccessMessage('Sesi opname berhasil disubmit ke Supervisor untuk persetujuan.');
 fetchDetail();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyubmit sesi opname.');
 } finally {
 setIsSaving(false);
 }
 };

 const handleVerifyApprove = async () => {
 if (!id) return;
 if (!window.confirm('Apakah Anda yakin ingin MENYETUJUI Stock Opname ini? Seluruh stok produk di sistem akan otomatis disesuaikan!')) return;

 setIsSaving(true);
 setErrorMessage(null);
 try {
 await opnameService.verifyOpname(id, { action: 'APPROVE' });
 setSuccessMessage('Stock Opname berhasil disetujui! Seluruh stok produk otomatis diperbarui.');
 fetchDetail();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menyetujui opname.');
 } finally {
 setIsSaving(false);
 }
 };

 const handleVerifyReject = async () => {
 if (!id || !rejectionReason) return;

 setIsSaving(true);
 setErrorMessage(null);
 try {
 await opnameService.verifyOpname(id, { action: 'REJECT', rejectionReason });
 setSuccessMessage('Stock Opname telah ditolak.');
 setIsRejectModalOpen(false);
 fetchDetail();
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal menolak opname.');
 } finally {
 setIsSaving(false);
 }
 };

 if (isLoading || !opname) {
 return (
 <div className="flex flex-col items-center justify-center p-12 space-y-4">
 <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
 <p className="text-slate-400 text-xs">Memuat detail sesi opname...</p>
 </div>
 );
 }

 const isLocked = ['APPROVED', 'COMPLETED'].includes(opname.status);
 const canEditCounts = isAdminGudang && !isLocked && opname.status !== 'WAITING_APPROVAL';

 return (
 <div className="space-y-6">
 {/* Back Button & Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
 <div className="flex items-center space-x-3">
 <Link
 to="/stock-opname"
 className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
 >
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div>
 <div className="flex items-center space-x-2">
 <span className="font-mono font-bold text-indigo-400 text-sm">{opname.opnameNo}</span>
 <Badge variant={opname.status === 'COMPLETED' ? 'success' : opname.status === 'WAITING_APPROVAL' ? 'warning' : 'info'}>
 {opname.status}
 </Badge>
 </div>
 <h1 className="text-xl font-extrabold text-white mt-0.5">{opname.title}</h1>
 </div>
 </div>

 {/* Action Buttons Header */}
 <div className="flex items-center space-x-2">
 {canEditCounts && (
 <>
 <button
 type="button"
 onClick={handleSaveCounts}
 disabled={isSaving}
 className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition space-x-1.5"
 >
 <Save className="w-4 h-4" />
 <span>Simpan Hitungan</span>
 </button>
 <button
 type="button"
 onClick={handleSubmitToSupervisor}
 disabled={isSaving}
 className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-1.5"
 >
 <Send className="w-4 h-4" />
 <span>Submit ke Supervisor</span>
 </button>
 </>
 )}

 {isSupervisor && opname.status === 'WAITING_APPROVAL' && (
 <>
 <button
 type="button"
 onClick={() => setIsRejectModalOpen(true)}
 disabled={isSaving}
 className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-1.5"
 >
 <XCircle className="w-4 h-4" />
 <span>Tolak (Reject)</span>
 </button>
 <button
 type="button"
 onClick={handleVerifyApprove}
 disabled={isSaving}
 className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-1.5"
 >
 <CheckCircle className="w-4 h-4" />
 <span>Setujui & Adjust Stok</span>
 </button>
 </>
 )}
 </div>
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

 {opname.status === 'REJECTED' && (
 <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-1">
 <span className="font-bold block flex items-center">
 <AlertTriangle className="w-4 h-4 mr-1" />
 Opname Ini Telah Ditolak Oleh Supervisor:
 </span>
 <p className="text-slate-300">{opname.rejectionReason}</p>
 </div>
 )}

 {/* Opname Physical Count Table */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
 <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
 <span>Daftar {items.length} Item Barang Snapshot Audit</span>
 <span>Dibuat oleh: <strong className="text-white">{opname.createdBy?.fullName}</strong></span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
 <th className="px-4 py-3">SKU & Barang</th>
 <th className="px-4 py-3">Lokasi Rak</th>
 <th className="px-4 py-3 text-center">Stok Sistem</th>
 <th className="px-4 py-3 text-center">Stok Fisik (Actual)</th>
 <th className="px-4 py-3 text-center">Selisih (Diff)</th>
 <th className="px-4 py-3">Catatan Audit</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800 text-slate-200">
 {items.map((item) => (
 <tr key={item.id} className="hover:bg-slate-800/40 transition">
 <td className="px-4 py-3">
 <span className="font-mono text-indigo-400 font-bold">{item.product.sku}</span>
 <span className="block font-semibold text-white">{item.product.name}</span>
 </td>

 <td className="px-4 py-3 font-mono text-slate-300 font-medium">
 {item.product.rackLocation}
 </td>

 <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">
 {item.systemStock} {item.product.unit}
 </td>

 <td className="px-4 py-3 text-center">
 {canEditCounts ? (
 <input
 type="number"
 min="0"
 value={item.physicalStock}
 onChange={(e) => handlePhysicalCountChange(item.id, Number(e.target.value))}
 className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-center font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 ) : (
 <span className="font-mono font-bold text-white">
 {item.physicalStock} {item.product.unit}
 </span>
 )}
 </td>

 <td className="px-4 py-3 text-center font-mono font-extrabold">
 <span
 className={
 item.difference === 0
 ? 'text-slate-400'
 : item.difference > 0
 ? 'text-emerald-400'
 : 'text-rose-400'
 }
 >
 {item.difference > 0 ? `+${item.difference}` : item.difference}
 </span>
 </td>

 <td className="px-4 py-3">
 {canEditCounts ? (
 <input
 type="text"
 placeholder="Catatan fisik..."
 value={item.notes || ''}
 onChange={(e) => handleNotesChange(item.id, e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 ) : (
 <span className="text-slate-400">{item.notes || '-'}</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Reject Modal */}
 <Modal
 isOpen={isRejectModalOpen}
 onClose={() => setIsRejectModalOpen(false)}
 title="Tolak Hasil Stock Opname"
 >
 <div className="space-y-4">
 <p className="text-xs text-slate-300">
 Masukkan alasan penolakan agar Admin Gudang dapat melakukan pengecekan ulang.
 </p>
 <textarea
 rows={3}
 value={rejectionReason}
 onChange={(e) => setRejectionReason(e.target.value)}
 placeholder="Alasan penolakan hasil opname..."
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
 />
 <div className="flex justify-end space-x-3 pt-2">
 <button
 onClick={() => setIsRejectModalOpen(false)}
 className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
 >
 Batal
 </button>
 <button
 onClick={handleVerifyReject}
 disabled={!rejectionReason || isSaving}
 className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg disabled:opacity-50"
 >
 Tolak Sesi Opname
 </button>
 </div>
 </div>
 </Modal>
 </div>
 );
};
