import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Box, Lock, Mail, ShieldCheck, Warehouse, ArrowRight, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
 email: z.string().email('Masukkan alamat email yang valid'),
 password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const { login } = useAuth();
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

 const from = (location.state as any)?.from?.pathname || '/';

 const {
 register,
 handleSubmit,
 setValue,
 formState: { errors },
 } = useForm<LoginFormData>({
 resolver: zodResolver(loginSchema),
 defaultValues: {
 email: 'admin.gudang@wms.com',
 password: 'Password123!',
 },
 });

 const onSubmit = async (data: LoginFormData) => {
 setIsSubmitting(true);
 setErrorMessage(null);
 try {
 await login(data);
 navigate(from, { replace: true });
 } catch (err: any) {
 const msg =
 err.response?.data?.message || 'Gagal terhubung ke server. Pastikan server backend aktif.';
 setErrorMessage(msg);
 } finally {
 setIsSubmitting(false);
 }
 };

 const fillDemoCredentials = (email: string) => {
 setValue('email', email);
 setValue('password', 'Password123!');
 setErrorMessage(null);
 };

 return (
 <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
 {/* Background Decorative Gradients */}
 <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
 <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

 <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
 <div className="flex justify-center items-center space-x-3 mb-3">
 <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
 <Warehouse className="w-7 h-7" />
 </div>
 </div>
 <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
 WMS Enterprise
 </h2>
 <p className="mt-2 text-center text-sm text-slate-400">
 Warehouse Management System & Inventory Control
 </p>
 </div>

 <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
 <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
 {errorMessage && (
 <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-400 text-sm">
 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
 <span>{errorMessage}</span>
 </div>
 )}

 <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
 Alamat Email
 </label>
 <div className="relative rounded-xl shadow-sm">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
 <Mail className="h-4 w-4" />
 </div>
 <input
 type="email"
 {...register('email')}
 className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
 placeholder="name@company.com"
 />
 </div>
 {errors.email && (
 <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>
 )}
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
 Password
 </label>
 <div className="relative rounded-xl shadow-sm">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
 <Lock className="h-4 w-4" />
 </div>
 <input
 type="password"
 {...register('password')}
 className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
 placeholder="••••••••"
 />
 </div>
 {errors.password && (
 <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.password.message}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
 >
 {isSubmitting ? (
 <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
 ) : (
 <>
 <span>Masuk ke Sistem</span>
 <ArrowRight className="ml-2 w-4 h-4" />
 </>
 )}
 </button>
 </form>

 {/* Quick Fill Demo Account Section */}
 <div className="mt-8 pt-6 border-t border-slate-800">
 <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center">
 <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5" />
 Quick Demo Account Switcher:
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 <button
 type="button"
 onClick={() => fillDemoCredentials('admin.gudang@wms.com')}
 className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-indigo-400 text-left transition flex flex-col"
 >
 <span className="font-semibold text-white">Admin Gudang</span>
 <span className="text-[10px] text-slate-500">Stok & Transaksi</span>
 </button>
 <button
 type="button"
 onClick={() => fillDemoCredentials('supervisor@wms.com')}
 className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-indigo-400 text-left transition flex flex-col"
 >
 <span className="font-semibold text-white">Supervisor</span>
 <span className="text-[10px] text-slate-500">Approval & KPI</span>
 </button>
 <button
 type="button"
 onClick={() => fillDemoCredentials('admin.system@wms.com')}
 className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-indigo-400 text-left transition flex flex-col"
 >
 <span className="font-semibold text-white">Admin Sistem</span>
 <span className="text-[10px] text-slate-500">Users & Audit</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
