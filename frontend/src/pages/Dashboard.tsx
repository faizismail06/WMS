import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analytics.service';
import { DashboardSummary, DashboardCharts } from '../types/analytics';
import {
 Package,
 ArrowDownLeft,
 ArrowUpRight,
 AlertTriangle,
 Truck,
 Layers,
 Activity,
 ShieldCheck,
 TrendingUp,
 ArrowRight,
} from 'lucide-react';

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 BarChart,
 Bar,
 Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

export const Dashboard: React.FC = () => {
 const { user } = useAuth();
 const [summary, setSummary] = useState<DashboardSummary | null>(null);
 const [charts, setCharts] = useState<DashboardCharts | null>(null);
 const [isLoading, setIsLoading] = useState<boolean>(true);

 const fetchDashboardData = async () => {
 setIsLoading(true);
 try {
 const [sumData, chartData] = await Promise.all([
 analyticsService.getSummary(),
 analyticsService.getCharts(),
 ]);
 setSummary(sumData);
 setCharts(chartData);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchDashboardData();
 }, []);

 if (isLoading || !summary || !charts) {
 return (
 <div className="flex flex-col items-center justify-center p-16 space-y-4">
 <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
 <p className="text-slate-400 text-xs">Memuat data KPI & agregasi analytics dashboard...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 {/* Header Banner */}
 <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
 <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
 <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
 Sistem Aktif • {user?.role}
 </div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
 Executive Dashboard, {user?.fullName}! 
 </h1>
 <p className="mt-1 text-xs sm:text-sm text-slate-400">
 Ringkasan KPI operasional pergudangan real-time & visualisasi pergerakan persediaan.
 </p>
 </div>
 <div className="flex items-center space-x-3">
 <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
 <Activity className="w-4 h-4 text-emerald-400 mr-2 animate-pulse" />
 Real-Time Connected
 </span>
 </div>
 </div>
 </div>

 {/* Low Stock Warning Alert Banner */}
 {summary.lowStockCount > 0 && (
 <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-400">
 <div className="flex items-center space-x-3">
 <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
 <div>
 <p className="text-xs font-bold uppercase tracking-wider">Perhatian Stok Menipis!</p>
 <p className="text-xs text-slate-300 mt-0.5">
 Terdapat <strong className="text-rose-400">{summary.lowStockCount} produk</strong> yang stoknya berada di bawah batas minimum safety stock.
 </p>
 </div>
 </div>
 <Link
 to="/products?lowStock=true"
 className="inline-flex items-center px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition space-x-1"
 >
 <span>Tinjau Produk</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>
 )}

 {/* Real-Time KPI Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Jenis Produk</p>
 <h3 className="text-2xl font-extrabold text-white mt-1">{summary.totalProducts} <span className="text-xs font-normal text-slate-400">SKU</span></h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
 <Package className="w-6 h-6" />
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Kuantitas Stok</p>
 <h3 className="text-2xl font-extrabold text-white mt-1">{summary.totalStockUnits.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Unit</span></h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
 <Layers className="w-6 h-6" />
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Barang Masuk (Bulan Ini)</p>
 <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">+{summary.monthlyStockInVolume.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Unit</span></h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
 <ArrowDownLeft className="w-6 h-6" />
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Barang Keluar (Bulan Ini)</p>
 <h3 className="text-2xl font-extrabold text-amber-400 mt-1">-{summary.monthlyStockOutVolume.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Unit</span></h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
 <ArrowUpRight className="w-6 h-6" />
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alert Stok Menipis</p>
 <h3 className={`text-2xl font-extrabold mt-1 ${summary.lowStockCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
 {summary.lowStockCount} <span className="text-xs font-normal text-slate-400">Produk</span>
 </h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
 <AlertTriangle className="w-6 h-6" />
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Supplier Aktif</p>
 <h3 className="text-2xl font-extrabold text-white mt-1">{summary.totalSuppliers} <span className="text-xs font-normal text-slate-400">Mitra</span></h3>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
 <Truck className="w-6 h-6" />
 </div>
 </div>
 </div>

 {/* Recharts Section 1: Monthly Trend Area Chart & Category Pie Chart */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Trend Area Chart (2 Cols) */}
 <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
 <div>
 <h3 className="text-sm font-bold text-white tracking-wide flex items-center">
 <TrendingUp className="w-4 h-4 text-indigo-400 mr-2" />
 Tren Mutasi Barang 30 Hari Terakhir
 </h3>
 <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan volume Barang Masuk vs Barang Keluar harian.</p>
 </div>
 </div>

 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={charts.monthlyTrend}>
 <defs>
 <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
 <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
 <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
 <Tooltip
 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
 />
 <Area type="monotone" dataKey="stockIn" name="Barang Masuk (IN)" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
 <Area type="monotone" dataKey="stockOut" name="Barang Keluar (OUT)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOut)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Category Pie Chart (1 Col) */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="border-b border-slate-800 pb-3">
 <h3 className="text-sm font-bold text-white tracking-wide">Distribusi Stok Per Kategori</h3>
 <p className="text-[11px] text-slate-400 mt-0.5">Proporsi unit barang berdasarkan kategori.</p>
 </div>

 <div className="h-64 w-full flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={charts.categoryDistribution}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={80}
 paddingAngle={4}
 dataKey="stock"
 nameKey="name"
 >
 {charts.categoryDistribution.map((_, index) => (
 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>

 <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-t border-slate-800/60 pt-3">
 {charts.categoryDistribution.slice(0, 4).map((cat, idx) => (
 <div key={idx} className="flex items-center space-x-1.5 truncate">
 <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
 <span className="truncate">{cat.name}: <strong>{cat.stock}</strong></span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Recharts Section 2: Top Low Stock & Fast Moving Items */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Top Low Stock Bar Chart */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="border-b border-slate-800 pb-3">
 <h3 className="text-sm font-bold text-white tracking-wide text-rose-400 flex items-center">
 <AlertTriangle className="w-4 h-4 mr-1.5" />
 Top 5 Barang Stok Terendah
 </h3>
 <p className="text-[11px] text-slate-400 mt-0.5">Produk yang memerlukan pengadaan penerimaan stok ulang.</p>
 </div>

 <div className="h-60 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart layout="vertical" data={charts.topLowStock} margin={{ left: 20 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
 <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
 <YAxis dataKey="sku" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={80} />
 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
 <Bar dataKey="stock" name="Stok Tersedia" fill="#f43f5e" radius={[0, 8, 8, 0]} />
 <Bar dataKey="minStock" name="Stok Min Safety" fill="#475569" radius={[0, 8, 8, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Fast Moving Items */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="border-b border-slate-800 pb-3">
 <h3 className="text-sm font-bold text-white tracking-wide flex items-center">
 <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
 Top 5 Produk Fast-Moving (Most Stock Out)
 </h3>
 <p className="text-[11px] text-slate-400 mt-0.5">Produk paling sering dikeluarkan untuk kebutuhan operasional.</p>
 </div>

 <div className="h-60 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.fastMovingProducts}>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
 <XAxis dataKey="sku" stroke="#64748b" tick={{ fontSize: 10 }} />
 <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
 <Bar dataKey="quantityOut" name="Total Unit Out" fill="#10b981" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 );
};
