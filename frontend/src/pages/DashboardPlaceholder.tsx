import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Warehouse, ShieldCheck, Activity, Package, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const DashboardPlaceholder: React.FC = () => {
 const { user } = useAuth();

 return (
 <div className="space-y-8">
 {/* Header Banner */}
 <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
 <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
 <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
 Sistem Aktif • Mode {user?.role}
 </div>
 <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
 Selamat datang kembali, {user?.fullName}! 
 </h1>
 <p className="mt-1 text-sm text-slate-400">
 Sistem Manajemen Pergudangan Enterprise terhubung dan berjalan dengan normal.
 </p>
 </div>
 <div className="flex items-center space-x-3">
 <span className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
 <Activity className="w-4 h-4 text-emerald-400 mr-2 animate-pulse" />
 API Connected (Phase 1)
 </span>
 </div>
 </div>
 </div>

 {/* KPI Cards Preview */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
 <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
 <Package className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Produk</p>
 <h3 className="text-2xl font-extrabold text-white mt-0.5">30 Jenis</h3>
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
 <ArrowDownLeft className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Barang Masuk (Bulan Ini)</p>
 <h3 className="text-2xl font-extrabold text-white mt-0.5">20 Unit</h3>
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
 <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
 <ArrowUpRight className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Barang Keluar (Bulan Ini)</p>
 <h3 className="text-2xl font-extrabold text-white mt-0.5">10 Unit</h3>
 </div>
 </div>

 <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
 <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
 <AlertTriangle className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stok Menipis (Alert)</p>
 <h3 className="text-2xl font-extrabold text-rose-400 mt-0.5">4 Produk</h3>
 </div>
 </div>
 </div>

 {/* Info Card */}
 <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
 <h3 className="text-base font-bold text-white mb-2 flex items-center">
 <Warehouse className="w-5 h-5 text-indigo-400 mr-2" />
 Status Fase Fondasi (Phase 1 Setup & Auth)
 </h3>
 <p className="text-xs text-slate-400 leading-relaxed mb-4">
 Infrastruktur REST API backend Express, Prisma ORM PostgreSQL, autentikasi JWT, password hashing bcrypt, serta routing frontend terproteksi RBAC telah berhasil disiapkan dan beroperasi.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
 <span className="font-semibold text-slate-300 block mb-1">User Auth Metadata:</span>
 <span className="text-slate-400 font-mono">{user?.email}</span>
 </div>
 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
 <span className="font-semibold text-slate-300 block mb-1">Role Permission:</span>
 <span className="text-indigo-400 font-semibold">{user?.role}</span>
 </div>
 <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
 <span className="font-semibold text-slate-300 block mb-1">Database State:</span>
 <span className="text-emerald-400 font-semibold">PostgreSQL Prisma Ready</span>
 </div>
 </div>
 </div>
 </div>
 );
};
