import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService, productService } from '../services/master.service';
import { transactionService } from '../services/transaction.service';
import { Supplier, Product } from '../types/master';
import { ArrowDownLeft, Plus, Trash2, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

interface FormRow {
 productId: string;
 quantity: number;
 unitPrice: number;
}

export const StockIn: React.FC = () => {
 const navigate = useNavigate();
 const [suppliers, setSuppliers] = useState<Supplier[]>([]);
 const [products, setProducts] = useState<Product[]>([]);

 const [supplierId, setSupplierId] = useState<string>('');
 const [notes, setNotes] = useState<string>('');
 const [rows, setRows] = useState<FormRow[]>([
 { productId: '', quantity: 1, unitPrice: 0 }
 ]);

 const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 useEffect(() => {
 const loadMasterData = async () => {
 try {
 const [supRes, prdRes] = await Promise.all([
 supplierService.getSuppliers({ status: 'ACTIVE', limit: 100 }),
 productService.getProducts({ status: 'ACTIVE', limit: 100 })
 ]);
 setSuppliers(supRes.data);
 setProducts(prdRes.data);
 if (supRes.data.length > 0) setSupplierId(supRes.data[0].id);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoadingData(false);
 }
 };

 loadMasterData();
 }, []);

 const handleProductChange = (index: number, pId: string) => {
 const selectedProd = products.find((p) => p.id === pId);
 const updated = [...rows];
 updated[index].productId = pId;
 if (selectedProd) {
 updated[index].unitPrice = Number(selectedProd.price);
 }
 setRows(updated);
 };

 const handleQuantityChange = (index: number, qty: number) => {
 const updated = [...rows];
 updated[index].quantity = Math.max(1, qty);
 setRows(updated);
 };

 const handlePriceChange = (index: number, price: number) => {
 const updated = [...rows];
 updated[index].unitPrice = Math.max(0, price);
 setRows(updated);
 };

 const handleAddRow = () => {
 setRows([...rows, { productId: '', quantity: 1, unitPrice: 0 }]);
 };

 const handleRemoveRow = (index: number) => {
 if (rows.length === 1) return;
 setRows(rows.filter((_, idx) => idx !== index));
 };

 const calculateTotalCost = () => {
 return rows.reduce((acc, row) => acc + row.quantity * row.unitPrice, 0);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMessage(null);

 if (!supplierId) {
 setErrorMessage('Pilih supplier penerimaan barang.');
 return;
 }

 const invalidRow = rows.find((r) => !r.productId || r.quantity <= 0);
 if (invalidRow) {
 setErrorMessage('Pastikan seluruh baris barang telah dipilih dengan kuantitas > 0.');
 return;
 }

 setIsSubmitting(true);
 try {
 await transactionService.createStockIn({
 supplierId,
 notes,
 items: rows.map((r) => ({
 productId: r.productId,
 quantity: r.quantity,
 unitPrice: r.unitPrice
 }))
 });

 setSuccessMessage('Transaksi Barang Masuk berhasil diproses! Stok produk otomatis bertambah.');
 setTimeout(() => {
 navigate('/history');
 }, 1500);
 } catch (err: any) {
 setErrorMessage(err.response?.data?.message || 'Gagal memproses transaksi barang masuk.');
 setIsSubmitting(false);
 }
 };

 const formatCurrency = (val: number) => {
 return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
 };

 if (isLoadingData) {
 return (
 <div className="flex flex-col items-center justify-center p-12 space-y-4">
 <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
 <p className="text-slate-400 text-xs">Memuat data master supplier & barang...</p>
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 {/* Header Banner */}
 <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
 <ArrowDownLeft className="w-6 h-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-white tracking-tight">Barang Masuk (Stock In)</h1>
 <p className="text-xs text-slate-400 mt-0.5">
 Pencatatan penerimaan stok persediaan baru dari supplier.
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
 {/* Section 1: Header Supplier & Notes */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
 <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
 1. Informasi Penerimaan PO & Supplier
 </h2>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Supplier</label>
 <select
 value={supplierId}
 onChange={(e) => setSupplierId(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 >
 {suppliers.map((sup) => (
 <option key={sup.id} value={sup.id}>
 {sup.code} - {sup.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan PO / Surat Jalan</label>
 <input
 type="text"
 placeholder="Contoh: Penerimaan PO #PO-2026-0901"
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>
 </div>

 {/* Section 2: Items Table Input */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <h2 className="text-sm font-bold text-white tracking-wide">
 2. Daftar Barang Diterima
 </h2>
 <button
 type="button"
 onClick={handleAddRow}
 className="inline-flex items-center px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs rounded-lg transition space-x-1"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Tambah Baris Item</span>
 </button>
 </div>

 <div className="space-y-3">
 {rows.map((row, idx) => (
 <div
 key={idx}
 className="grid grid-cols-12 gap-3 items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800"
 >
 {/* Product Select */}
 <div className="col-span-12 sm:col-span-5">
 <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Pilih Barang</label>
 <select
 value={row.productId}
 onChange={(e) => handleProductChange(idx, e.target.value)}
 className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="">-- Pilih Produk --</option>
 {products.map((p) => (
 <option key={p.id} value={p.id}>
 [{p.sku}] {p.name} (Stok: {p.stock} {p.unit})
 </option>
 ))}
 </select>
 </div>

 {/* Quantity */}
 <div className="col-span-5 sm:col-span-2">
 <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Kuantitas</label>
 <input
 type="number"
 min="1"
 value={row.quantity}
 onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
 className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 {/* Unit Price */}
 <div className="col-span-5 sm:col-span-3">
 <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Harga Beli Satuan (IDR)</label>
 <input
 type="number"
 min="0"
 value={row.unitPrice}
 onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
 className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 {/* Remove Row Button */}
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
 ))}
 </div>

 {/* Total Cost Summary */}
 <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-400">Total Biaya Penerimaan:</span>
 <span className="text-xl font-extrabold text-emerald-400">
 {formatCurrency(calculateTotalCost())}
 </span>
 </div>
 </div>

 {/* Submit Button */}
 <div className="flex justify-end">
 <button
 type="submit"
 disabled={isSubmitting}
 className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 space-x-2"
 >
 {isSubmitting ? (
 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
 ) : (
 <>
 <ShoppingCart className="w-4 h-4" />
 <span>Proses Barang Masuk</span>
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 );
};
