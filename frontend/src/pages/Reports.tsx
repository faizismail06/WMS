import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { categoryService } from '../services/master.service';
import { StockReportItem, MovementReportItem } from '../types/analytics';
import { Category } from '../types/master';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { FileText, Download, Printer, Filter, Calendar, Layers, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const Reports: React.FC = () => {
 const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENT'>('STOCK');
 const [categories, setCategories] = useState<Category[]>([]);

 // Stock Report State
 const [stockReports, setStockReports] = useState<StockReportItem[]>([]);
 const [selectedCategory, setSelectedCategory] = useState<string>('');

 // Movement Report State
 const [movementReports, setMovementReports] = useState<MovementReportItem[]>([]);
 const [startDate, setStartDate] = useState<string>('');
 const [endDate, setEndDate] = useState<string>('');
 const [typeFilter, setTypeFilter] = useState<string>('');

 const [isLoading, setIsLoading] = useState<boolean>(true);

 useEffect(() => {
 categoryService.getCategories({ status: 'ACTIVE' }).then(setCategories).catch(console.error);
 }, []);

 const fetchReports = async () => {
 setIsLoading(true);
 try {
 if (activeTab === 'STOCK') {
 const data = await analyticsService.getStockReport({ categoryId: selectedCategory || undefined });
 setStockReports(data);
 } else {
 const data = await analyticsService.getMovementReport({
 startDate: startDate || undefined,
 endDate: endDate || undefined,
 type: typeFilter || undefined,
 categoryId: selectedCategory || undefined,
 });
 setMovementReports(data);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchReports();
 }, [activeTab, selectedCategory, startDate, endDate, typeFilter]);

 const formatCurrency = (val: number) => {
 return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
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

 // Export to CSV Functionality
 const exportToCSV = () => {
 let csvContent = 'data:text/csv;charset=utf-8,';

 if (activeTab === 'STOCK') {
 csvContent += 'SKU,Nama Barang,Kategori,Supplier,Stok,Satuan,Harga Satuan,Nilai Aset,Lokasi Rak,Status\n';
 stockReports.forEach((r) => {
 csvContent += `"${r.sku}","${r.name}","${r.category}","${r.supplier}",${r.stock},"${r.unit}",${r.price},${r.totalAssetValue},"${r.rackLocation}","${r.status}"\n`;
 });
 } else {
 csvContent += 'Tanggal,No Transaksi,Tipe,SKU,Nama Barang,Kategori,Kuantitas,Stok Sebelum,Stok Sesudah,Sumber/Tujuan,Created By\n';
 movementReports.forEach((r) => {
 csvContent += `"${formatDate(r.date)}","${r.transactionNo}","${r.type}","${r.sku}","${r.productName}","${r.category}",${r.quantity},${r.stockBefore},${r.stockAfter},"${r.sourceOrDestination}","${r.createdBy}"\n`;
 });
 }

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `WMS-Laporan-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 const handlePrint = () => {
 window.print();
 };

 const stockColumns: Column<StockReportItem>[] = [
 {
 header: 'SKU & Rak',
 accessor: 'sku',
 render: (r) => (
 <div>
 <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 text-xs">
 {r.sku}
 </span>
 <span className="font-mono text-[10px] text-amber-400 block mt-0.5">{r.rackLocation}</span>
 </div>
 ),
 },
 {
 header: 'Nama Barang',
 accessor: 'name',
 render: (r) => <span className="font-semibold text-white">{r.name}</span>,
 },
 {
 header: 'Kategori & Supplier',
 render: (r) => (
 <div>
 <Badge variant="info">{r.category}</Badge>
 <span className="text-[11px] text-slate-400 block truncate">{r.supplier}</span>
 </div>
 ),
 },
 {
 header: 'Stok Persediaan',
 accessor: 'stock',
 render: (r) => (
 <span className={`font-bold font-mono text-xs ${r.isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
 {r.stock} {r.unit}
 </span>
 ),
 },
 {
 header: 'Harga Satuan',
 render: (r) => <span className="text-slate-300 font-medium">{formatCurrency(r.price)}</span>,
 },
 {
 header: 'Nilai Total Aset',
 render: (r) => <span className="font-bold text-emerald-400">{formatCurrency(r.totalAssetValue)}</span>,
 },
 ];

 const movementColumns: Column<MovementReportItem>[] = [
 {
 header: 'Tanggal & No. TRX',
 accessor: 'transactionNo',
 render: (r) => (
 <div>
 <span className="font-mono font-bold text-white text-xs">{r.transactionNo}</span>
 <span className="text-[10px] text-slate-400 block">{formatDate(r.date)}</span>
 </div>
 ),
 },
 {
 header: 'Tipe',
 accessor: 'type',
 render: (r) => (
 <Badge variant={r.type === 'IN' ? 'success' : 'warning'}>
 {r.type === 'IN' ? <span className="flex items-center"><ArrowDownLeft className="w-3 h-3 mr-1" />IN</span> : <span className="flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" />OUT</span>}
 </Badge>
 ),
 },
 {
 header: 'Produk',
 accessor: 'productName',
 render: (r) => (
 <div>
 <span className="font-mono text-[10px] text-indigo-400 font-semibold">{r.sku}</span>
 <span className="font-semibold text-white block">{r.productName}</span>
 </div>
 ),
 },
 {
 header: 'Kuantitas Mutasi',
 accessor: 'quantity',
 render: (r) => <span className="font-bold text-white">{r.quantity} {r.unit}</span>,
 },
 {
 header: 'Kalkulasi Stok',
 render: (r) => (
 <span className="font-mono text-xs">
 <span className="text-slate-400">{r.stockBefore}</span> {'->'} <strong className="text-emerald-400">{r.stockAfter}</strong>
 </span>
 ),
 },
 {
 header: 'Sumber / Tujuan',
 accessor: 'sourceOrDestination',
 render: (r) => <span className="font-medium text-slate-300">{r.sourceOrDestination}</span>,
 },
 ];

 return (
 <div className="space-y-6">
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2">
 <FileText className="w-6 h-6 text-indigo-400" />
 <h1 className="text-2xl font-bold text-white tracking-tight">Laporan Inventori</h1>
 </div>
 <p className="text-sm text-slate-400 mt-1">
 Ekspor data laporan posisi stok dan riwayat pergerakan persediaan gudang.
 </p>
 </div>

 <div className="flex items-center space-x-2">
 <button
 onClick={exportToCSV}
 className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition space-x-2"
 >
 <Download className="w-4 h-4" />
 <span>Export Excel (CSV)</span>
 </button>
 <button
 onClick={handlePrint}
 className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition space-x-2"
 >
 <Printer className="w-4 h-4" />
 <span>Cetak / Print</span>
 </button>
 </div>
 </div>

 {/* Main Tabs */}
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <button
 onClick={() => setActiveTab('STOCK')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
 activeTab === 'STOCK'
 ? 'bg-indigo-600 text-white shadow-md'
 : 'bg-slate-900 text-slate-400 hover:text-white'
 }`}
 >
 Laporan Posisi Stok Saat Ini
 </button>
 <button
 onClick={() => setActiveTab('MOVEMENT')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
 activeTab === 'MOVEMENT'
 ? 'bg-indigo-600 text-white shadow-md'
 : 'bg-slate-900 text-slate-400 hover:text-white'
 }`}
 >
 Laporan Mutasi Pergerakan Barang
 </button>
 </div>

 {/* Filter Toolbar */}
 <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
 <div className="flex items-center space-x-2 w-full sm:w-auto">
 <Layers className="w-4 h-4 text-slate-500" />
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Kategori</option>
 {categories.map((c) => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 </div>

 {activeTab === 'MOVEMENT' && (
 <>
 <select
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value)}
 className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
 >
 <option value="">Semua Tipe (IN & OUT)</option>
 <option value="IN">Barang Masuk (IN)</option>
 <option value="OUT">Barang Keluar (OUT)</option>
 </select>

 <div className="flex items-center space-x-2 text-xs text-slate-400">
 <Calendar className="w-4 h-4 text-slate-500" />
 <input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
 />
 <span>-</span>
 <input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
 />
 </div>
 </>
 )}
 </div>

 {/* DataTable Preview */}
 {activeTab === 'STOCK' ? (
 <DataTable
 columns={stockColumns}
 data={stockReports}
 isLoading={isLoading}
 emptyText="Tidak ada data laporan posisi stok."
 />
 ) : (
 <DataTable
 columns={movementColumns}
 data={movementReports}
 isLoading={isLoading}
 emptyText="Tidak ada data laporan pergerakan barang."
 />
 )}
 </div>
 );
};
