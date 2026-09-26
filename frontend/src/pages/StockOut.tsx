import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/master.service';
import { transactionService } from '../services/transaction.service';
import { Product } from '../types/master';
import { ArrowUpRight, Plus, Trash2, CheckCircle2, AlertCircle, Send, AlertTriangle } from 'lucide-react';

interface FormRow {
 productId: string;
 quantity: number;
}

export const StockOut: React.FC = () => {
 const navigate = useNavigate();
 const [products, setProducts] = useState<Product[]>([]);

 const [destination, setDestination] = useState<string>('');
 const [notes, setNotes] = useState<string>('');
 const [rows, setRows] = useState<FormRow[]>([
 { productId: '', quantity: 1 }
 ]);

 const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 useEffect(() => {
 const loadProducts = async () => {
 try {
 const prdRes = await productService.getProducts({ status: 'ACTIVE', limit: 100 });
 setProducts(prdRes.data);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoadingData(false);
 }
 };

 loadProducts();
 }, []);

 const handleProductChange = (index: number, pId: string) => {
 const updated = [...rows];
 updated[index].productId = pId;
 setRows(updated);
 };

 const handleQuantityChange = (index: number, qty: number) => {
 const updated = [...rows];
 updated[index].quantity = Math.max(1, qty);
 setRows(updated);
 };

 const handleAddRow = () => {
 setRows([...rows, { productId: '', quantity: 1 }]);
 };

 const handleRemoveRow = (index: number) => {
 if (rows.length === 1) return;
 setRows(rows.filter((_, idx) => idx !== index));
 };

 const getProductStock = (pId: string): number => {
 const p = products.find((prod) => prod.id === pId);
 return p ? p.stock : 0;
 };

 const getProductUnit = (pId: string): string => {
 const p = products.find((prod) => prod.id === pId);
 return p ? p.unit : 'unit';
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMessage(null);

 if (!destination) {
 setErrorMessage('Tujuan pengeluaran / nama departemen wajib diisi.');
 return;
 }

 // Pengecekan ketersediaan stok lokal
 for (const r of rows) {
 if (!r.productId) {
 setErrorMessage('Pilih produk pada setiap baris item.');
 return;
 }
 const p = products.find((prod) => prod.id === r.productId);
 if (p && r.quantity > p.stock) {
 setErrorMessage(`Stok '${p.name}' tidak mencukupi. Kuantitas diminta: ${r.quantity} ${p.unit}, Stok tersedia: ${p.stock} ${p.unit}.`);
 return;
 }
 }

 setIsSubmitting(true);
 try {
 await transactionService.createStockOut({
 destination,
 notes,
 items: rows.map((r) => ({
 productId: r.productId,
 quantity: r.quantity
 }))
 });

 setSuccessMessage('Transaksi Barang Keluar berhasil diproses! Stok produk otomatis dikurangi.');
 setTimeout(() => {
 navigate('/history');
 }, 1500);
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal memproses transaksi barang keluar.');
 setIsSubmitting(false);
 }
 };

 if (isLoadingData) {
 return (
 <div className="flex flex-col items-center justify-center p-12 space-y-4">
 <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
 <p className="text-slate-400 text-xs">Memuat data barang...</p>
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 {/* Header Banner */}
 <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
 <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
 <ArrowUpRight className="w-6 h-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-white tracking-tight">Barang Keluar (Stock Out)</h1>
 <p className="text-xs text-slate-400 mt-0.5">
 Pencatatan pengeluaran stok persediaan untuk departemen / tujuan penerima.
 </p>
 </div>
 </div>

 {/* Alerts */}
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

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Section 1: Destination Header */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
 <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
 1. Informasi Tujuan Pengiriman
 </h2>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">
 Tujuan Pengeluaran / Departemen
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Maintenance Line 2 / Divisi Produksi"
 value={destination}
 onChange={(e) => setDestination(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan</label>
 <input
 type="text"
 placeholder="Catatan keperluan atau nomor WO..."
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
 />
 </div>
 </div>
 </div>

 {/* Section 2: Items Table Input */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <h2 className="text-sm font-bold text-white tracking-wide">
 2. Daftar Barang Keluar
 </h2>
 <button
 type="button"
 onClick={handleAddRow}
 className="inline-flex items-center px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs rounded-lg transition space-x-1"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Tambah Baris Item</span>
 </button>
 </div>

 <div className="space-y-3">
 {rows.map((row, idx) => {
 const currentStock = getProductStock(row.productId);
 const unit = getProductUnit(row.productId);
 const isOverStock = row.productId !== '' && row.quantity > currentStock;

 return (
 <div
 key={idx}
 className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl border transition ${
 isOverStock
 ? 'bg-rose-500/10 border-rose-500/30'
 : 'bg-slate-950/60 border-slate-800'
 }`}
 >
 {/* Product Select */}
 <div className="col-span-12 sm:col-span-6">
 <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
 Pilih Barang
 </label>
 <select
 value={row.productId}
 onChange={(e) => handleProductChange(idx, e.target.value)}
 className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
 >
 <option value="">-- Pilih Produk --</option>
 {products.map((p) => (
 <option key={p.id} value={p.id}>
 [{p.sku}] {p.name} (Tersedia: {p.stock} {p.unit})
 </option>
 ))}
 </select>
 </div>

 {/* Quantity requested & Stock Indicator */}
 <div className="col-span-10 sm:col-span-4">
 <div className="flex items-center justify-between mb-1">
 <label className="text-[10px] uppercase font-semibold text-slate-400">
 Kuantitas Pengeluaran
 </label>
 {row.productId && (
 <span className={`text-[10px] font-bold ${isOverStock ? 'text-rose-400' : 'text-emerald-400'}`}>
 Stok: {currentStock} {unit}
 </span>
 )}
 </div>
 <input
 type="number"
 min="1"
 value={row.quantity}
 onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
 className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-xs text-white focus:outline-none focus:ring-2 ${
 isOverStock ? 'border-rose-500 ring-rose-500' : 'border-slate-700/80 focus:ring-amber-500'
 }`}
 />
 {isOverStock && (
 <p className="mt-1 text-[10px] text-rose-400 font-medium flex items-center">
 <AlertTriangle className="w-3 h-3 mr-1" />
 Kuantitas melebihi stok tersedia!
 </p>
 )}
 </div>

 {/* Remove Button */}
 <div className="col-span-2 sm:col-span-2 flex items-end justify-end pt-5">
 <button
 type="button"
 onClick={() => handleRemoveRow(idx)}
 disabled={rows.length === 1}
 className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg disabled:opacity-30 transition"
 title="Hapus Baris"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Submit Button */}
 <div className="flex justify-end">
 <button
 type="submit"
 disabled={isSubmitting}
 className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition disabled:opacity-50 space-x-2"
 >
 {isSubmitting ? (
 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
 ) : (
 <>
 <Send className="w-4 h-4" />
 <span>Proses Barang Keluar</span>
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 );
};
