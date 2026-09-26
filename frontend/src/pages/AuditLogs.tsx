import React, { useState, useEffect } from 'react';
import { systemService, AuditLogItem } from '../services/system.service';
import { PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Shield, Search, Eye, Terminal, Clock, User as UserIcon } from 'lucide-react';

export const AuditLogs: React.FC = () => {
 const [logs, setLogs] = useState<AuditLogItem[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 const [searchQuery, setSearchQuery] = useState<string>('');
 const [moduleFilter, setModuleFilter] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

 const fetchLogs = async () => {
 setIsLoading(true);
 try {
 const res = await systemService.getAuditLogs({
 q: searchQuery,
 module: moduleFilter || undefined,
 page,
 limit: 15,
 });
 setLogs(res.data);
 setMeta(res.meta);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchLogs();
 }, [searchQuery, moduleFilter, page]);

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit',
 });
 };

 const getModuleBadgeVariant = (module: string) => {
 switch (module) {
 case 'PRODUCTS':
 case 'CATEGORIES':
 return 'info';
 case 'TRANSACTIONS':
 return 'success';
 case 'OPNAME':
 return 'warning';
 case 'USERS':
 case 'AUTH':
 return 'neutral';
 default:
 return 'info';
 }
 };

 const columns: Column<AuditLogItem>[] = [
 {
 header: 'Waktu & IP Address',
 accessor: 'createdAt',
 render: (log) => (
 <div>
 <span className="font-mono text-[11px] text-white font-medium block">{formatDate(log.createdAt)}</span>
 <span className="font-mono text-[10px] text-slate-400">IP: {log.ipAddress}</span>
 </div>
 ),
 },
 {
 header: 'Modul & Aksi',
 accessor: 'action',
 render: (log) => (
 <div className="space-y-1">
 <Badge variant={getModuleBadgeVariant(log.module)}>
 {log.module}
 </Badge>
 <span className="font-mono font-bold text-white text-xs block">{log.action}</span>
 </div>
 ),
 },
 {
 header: 'User Eksekutor',
 render: (log) => (
 <div>
 {log.user ? (
 <>
 <span className="font-semibold text-slate-200 block">{log.user.fullName}</span>
 <span className="text-[10px] text-slate-400 font-mono">{log.user.email} ({log.user.role})</span>
 </>
 ) : (
 <span className="text-slate-500 italic">SYSTEM</span>
 )}
 </div>
 ),
 },
 {
 header: 'Detail Data',
 render: (log) => (
 <button
 onClick={() => setSelectedLog(log)}
 className="inline-flex items-center px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition space-x-1"
 >
 <Eye className="w-3.5 h-3.5" />
 <span>Lihat JSON</span>
 </button>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <div className="flex items-center space-x-2">
 <Shield className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log System</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Pelacakan riwayat aktivitas penting dan audit trail keamanan operasional pergudangan.
 </p>
 </div>

 {/* Filter / Search */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari aksi, user, email..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
 />
 </div>

 <select
 value={moduleFilter}
 onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
 className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Modul</option>
 <option value="PRODUCTS">PRODUCTS</option>
 <option value="CATEGORIES">CATEGORIES</option>
 <option value="SUPPLIERS">SUPPLIERS</option>
 <option value="TRANSACTIONS">TRANSACTIONS</option>
 <option value="INVENTORY">INVENTORY</option>
 <option value="OPNAME">OPNAME</option>
 <option value="USERS">USERS</option>
 <option value="AUTH">AUTH</option>
 </select>
 </div>

 {/* Audit Logs DataTable */}
 <DataTable
 columns={columns}
 data={logs}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada catatan audit log."
 />

 {/* Modal Detail JSON */}
 {selectedLog && (
 <Modal
 isOpen={!!selectedLog}
 onClose={() => setSelectedLog(null)}
 title={`Detail Audit Log - ${selectedLog.action}`}
 >
 <div className="space-y-3 text-xs">
 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
 <div>
 <span className="text-[10px] text-slate-500 uppercase font-bold">Waktu Eksekusi</span>
 <p className="font-mono text-white mt-0.5">{formatDate(selectedLog.createdAt)}</p>
 </div>
 <Badge variant="neutral">{selectedLog.module}</Badge>
 </div>

 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
 <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Payload Details (JSON):</span>
 <pre className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
 {JSON.stringify(selectedLog.details || {}, null, 2)}
 </pre>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
};
