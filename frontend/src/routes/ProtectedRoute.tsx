import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleName } from '../types/auth';

interface ProtectedRouteProps {
 allowedRoles?: RoleName[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
 const { isAuthenticated, isLoading, user } = useAuth();
 const location = useLocation();

 if (isLoading) {
 return (
 <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
 <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
 <p className="text-slate-400 text-sm font-medium">Memverifikasi sesi pengguna...</p>
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
 return (
 <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center shadow-2xl">
 <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
 </svg>
 </div>
 <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak (403 Forbidden)</h2>
 <p className="text-slate-400 text-sm mb-6">
 Role Anda (<span className="font-semibold text-indigo-400">{user.role}</span>) tidak memiliki izin untuk mengakses halaman ini.
 </p>
 <Link
 to="/"
 className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition"
 >
 Kembali ke Dashboard
 </Link>
 </div>
 </div>
 );
 }

 return <Outlet />;
};
