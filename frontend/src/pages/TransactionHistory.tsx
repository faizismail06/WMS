import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transaction.service';
import { StockTransaction } from '../types/transaction';
import { PaginationMeta } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { History, Search, Eye, ArrowDownLeft, ArrowUpRight, Calendar, UserCheck } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
 const [transactions, setTransactions] = useState<StockTransaction[]>([]);
 const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 // Filters
 const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [startDate, setStartDate] = useState<string>('');
 const [endDate, setEndDate] = useState<string>('');
 const [page, setPage] = useState<number>(1);

 const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);

 const fetchTransactions = async () => {
 setIsLoading(true);
 try {
 const res = await transactionService.getTransactions({
 type: typeFilter !== 'ALL' ? typeFilter : undefined,
 q: searchQuery,
 startDate: startDate || undefined,
 endDate: endDate || undefined,
 page,
 limit: 10,
 });
 setTransactions(res.data);
 setMeta(res.meta);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchTransactions();
 }, [typeFilter, searchQuery, startDate, endDate, page]);

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('id-ID', {
 day: '2-digit',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 });
 };

 const formatCurrency = (val: number) => {
 return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
 };

 const columns: Column<StockTransaction>[] = [
 {
 header: 'No. Transaksi & Tipe',
 accessor: 'transactionNo',
 render: (trx) => (
 <div className="space-y-1">
 <div className="flex items-center space-x-2">
 <span className="font-mono font-bold text-white text-xs">{trx.transactionNo}</span>
 <Badge variant={trx.type === 'IN' ? 'success' : 'warning'}>
 {trx.type === 'IN' ? (
 <span className="flex items-center"><ArrowDownLeft className="w-3 h-3 mr-1" />IN</span>
 ) : (
 <span className="flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" />OUT</span>
 )}
 </Badge>
 </div>
 <span className="text-[10px] text-slate-400 block">{formatDate(trx.date)}</span>
 </div>
 ),
 },
 {
 header: 'Sumber / Tujuan',
 render: (trx) => (
 <div>
 {trx.type === 'IN' ? (
 <span className="font-semibold text-emerald-400">{trx.supplier?.name || '-'}</span>
 ) : (
 <span className="font-semibold text-amber-400">{trx.destination || '-'}</span>
 )}
 <span className="text-slate-400 text-[11px] block truncate max-w-xs">{trx.notes || '-'}</span>
 </div>
 ),
 },
 {
 header: 'Jumlah Item',
 render: (trx) => (
 <Badge variant="neutral">{trx.items ? trx.items.length : 0} Item Jenis</Badge>
 ),
 },
 {
 header: 'Eksekutor User',
 render: (trx) => (
 <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
 <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
 <span>{trx.createdBy?.fullName || '-'}</span>
 </div>
 ),
 },
 {
 header: 'Aksi',
 render: (trx) => (
 <button
 onClick={() => setSelectedTransaction(trx)}
 className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
 title="Lihat Detail Transaksi"
 >
 <Eye className="w-4 h-4" />
 </button>
 ),
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <div className="flex items-center space-x-2">
 <History className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Riwayat Mutasi Transaksi</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Buku besar (ledger) pencatatan seluruh arus barang masuk dan pengeluaran barang keluar.
 </p>
 </div>

 {/* Filter Toolbar */}
 <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl space-y-3 md:space-y-0 md:flex md:items-center justify-between gap-4">
 {/* Type Tabs */}
 <div className="flex items-center space-x-2">
 <button
 onClick={() => { setTypeFilter('ALL'); setPage(1); }}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 typeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
 }`}
 >
 Semua Mutasi
 </button>
 <button
 onClick={() => { setTypeFilter('IN'); setPage(1); }}
 className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 typeFilter === 'IN' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
 }`}
 >
 <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
 Barang Masuk (IN)
 </button>
 <button
 onClick={() => { setTypeFilter('OUT'); setPage(1); }}
 className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
 typeFilter === 'OUT' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-amber-400'
 }`}
 >
 <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
 Barang Keluar (OUT)
 </button>
 </div>

 {/* Inputs */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative w-full sm:w-56">
 <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
 <input
 type="text"
 placeholder="Cari No. TRX, supplier..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
 />
 </div>

 <div className="flex items-center space-x-2 text-xs text-slate-400">
 <Calendar className="w-4 h-4 text-slate-500" />
 <input
 type="date"
 value={startDate}
 onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
 className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
 />
 <span>-</span>
 <input
 type="date"
 value={endDate}
 onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
 className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
 />
 </div>
 </div>
 </div>

 {/* Transaction History DataTable */}
 <DataTable
 columns={columns}
 data={transactions}
 isLoading={isLoading}
 meta={meta}
 onPageChange={(p) => setPage(p)}
 emptyText="Belum ada riwayat transaksi mutasi barang."
 />

 {/* Modal Detail Transaction */}
 {selectedTransaction && (
 <Modal
 isOpen={!!selectedTransaction}
 onClose={() => setSelectedTransaction(null)}
 title={`Detail Transaksi ${selectedTransaction.transactionNo}`}
 maxWidth="2xl"
 >
 <div className="space-y-4 text-xs">
 {/* Summary Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
 <span className="text-[10px] text-slate-500 font-semibold uppercase">Tipe Mutasi</span>
 <div className="mt-1">
 <Badge variant={selectedTransaction.type === 'IN' ? 'success' : 'warning'}>
 TRX {selectedTransaction.type}
 </Badge>
 </div>
 </div>

 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
 <span className="text-[10px] text-slate-500 font-semibold uppercase">
 {selectedTransaction.type === 'IN' ? 'Supplier' : 'Tujuan'}
 </span>
 <p className="font-semibold text-white mt-1">
 {selectedTransaction.type === 'IN'
 ? selectedTransaction.supplier?.name
 : selectedTransaction.destination}
 </p>
 </div>

 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
 <span className="text-[10px] text-slate-500 font-semibold uppercase">Tanggal Transaksi</span>
 <p className="font-medium text-slate-300 mt-1">{formatDate(selectedTransaction.date)}</p>
 </div>
 </div>

 {selectedTransaction.notes && (
 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300">
 <span className="text-[10px] text-slate-500 font-semibold uppercase block">Catatan:</span>
 <p>{selectedTransaction.notes}</p>
 </div>
 )}

 {/* Items Breakdown Table */}
 <div className="border border-slate-800 rounded-xl overflow-hidden">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-800">
 <tr>
 <th className="px-4 py-2.5">Produk</th>
 <th className="px-4 py-2.5">Kuantitas</th>
 <th className="px-4 py-2.5">Kalkulasi Stok</th>
 {selectedTransaction.type === 'IN' && <th className="px-4 py-2.5">Harga Beli</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800 text-slate-200">
 {selectedTransaction.items.map((item) => (
 <tr key={item.id}>
 <td className="px-4 py-2.5">
 <span className="font-mono text-indigo-400 font-semibold">{item.product.sku}</span>
 <span className="block font-semibold text-white">{item.product.name}</span>
 </td>
 <td className="px-4 py-2.5 font-bold text-white">
 {item.quantity} {item.product.unit}
 </td>
 <td className="px-4 py-2.5 font-mono">
 <span className="text-slate-400">{item.stockBefore}</span>
 <span className="mx-1.5 text-slate-600">{'->'}</span>
 <span className={`font-bold ${selectedTransaction.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
 {item.stockAfter}
 </span>
 </td>
 {selectedTransaction.type === 'IN' && (
 <td className="px-4 py-2.5 font-semibold text-slate-300">
 {formatCurrency(Number(item.unitPrice))}
 </td>
 )}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
};
