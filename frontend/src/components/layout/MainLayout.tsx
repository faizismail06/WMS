import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { systemService, NotificationItem } from '@/services/system.service';
import {
 LayoutDashboard,
 Package,
 Layers,
 Truck,
 ArrowDownLeft,
 ArrowUpRight,
 Sliders,
 ClipboardCheck,
 History,
 FileText,
 Users,
 Shield,
 Bell,
 LogOut,
 Warehouse,
 Menu,
 X,
 ChevronDown,
 User as UserIcon,
 CheckCircle,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
 const { user, logout } = useAuth();
 const location = useLocation();
 const navigate = useNavigate();

 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
 const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

 const [notifications, setNotifications] = useState<NotificationItem[]>([]);
 const [unreadCount, setUnreadCount] = useState<number>(0);

 const fetchNotifications = async () => {
 try {
 const data = await systemService.getNotifications();
 setNotifications(data.notifications);
 setUnreadCount(data.unreadCount);
 } catch (err) {
 console.error(err);
 }
 };

 useEffect(() => {
 fetchNotifications();
 const interval = setInterval(fetchNotifications, 15000); // Polling notifikasi 15 detik
 return () => clearInterval(interval);
 }, []);

 const handleMarkAllRead = async () => {
 try {
 await systemService.markAsRead('all');
 fetchNotifications();
 } catch (err) {
 console.error(err);
 }
 };

 const handleLogout = () => {
 logout();
 navigate('/login');
 };

 // Strictly plotted navItems based on PRD RBAC Matrix
 const navItems = [
 {
 title: 'Dashboard',
 path: '/',
 icon: LayoutDashboard,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR', 'ADMIN_SISTEM'],
 },
 {
 title: 'Data Produk',
 path: '/products',
 icon: Package,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Kategori Barang',
 path: '/categories',
 icon: Layers,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Supplier',
 path: '/suppliers',
 icon: Truck,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Barang Masuk (In)',
 path: '/stock-in',
 icon: ArrowDownLeft,
 roles: ['ADMIN_GUDANG'],
 },
 {
 title: 'Barang Keluar (Out)',
 path: '/stock-out',
 icon: ArrowUpRight,
 roles: ['ADMIN_GUDANG'],
 },
 {
 title: 'Stock Adjustment',
 path: '/stock-adjustment',
 icon: Sliders,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Stock Opname',
 path: '/stock-opname',
 icon: ClipboardCheck,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Riwayat Transaksi',
 path: '/history',
 icon: History,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Laporan Inventori',
 path: '/reports',
 icon: FileText,
 roles: ['ADMIN_GUDANG', 'SUPERVISOR'],
 },
 {
 title: 'Pengelolaan User',
 path: '/users',
 icon: Users,
 roles: ['ADMIN_SISTEM'],
 },
 {
 title: 'Audit Log System',
 path: '/audit-logs',
 icon: Shield,
 roles: ['SUPERVISOR', 'ADMIN_SISTEM'],
 },
 ];

 const filteredNavItems = navItems.filter(
 (item) => user && item.roles.includes(user.role)
 );

 const getRoleBadgeColor = (role?: string) => {
 switch (role) {
 case 'ADMIN_GUDANG':
 return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
 case 'SUPERVISOR':
 return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
 case 'ADMIN_SISTEM':
 return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
 default:
 return 'bg-slate-800 text-slate-400 border-slate-700';
 }
 };

 return (
 <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans">
 {/* Sidebar Desktop */}
 <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800 fixed top-0 bottom-0 left-0 z-30">
 <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
 <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
 <Warehouse className="w-5 h-5" />
 </div>
 <div>
 <h1 className="text-sm font-bold text-white tracking-wide">WMS Enterprise</h1>
 <p className="text-[10px] text-slate-400 font-medium">Pergudangan Modern</p>
 </div>
 </div>

 {/* Sidebar Nav Items */}
 <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
 {filteredNavItems.map((item) => {
 const Icon = item.icon;
 const isActive = location.pathname === item.path;
 return (
 <Link
 key={item.path}
 to={item.path}
 className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition ${
 isActive
 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
 : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
 }`}
 >
 <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
 <span>{item.title}</span>
 </Link>
 );
 })}
 </nav>

 {/* Sidebar User Footer */}
 <div className="p-4 border-t border-slate-800 bg-slate-950/40">
 <div className="flex items-center space-x-3 overflow-hidden">
 <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
 <UserIcon className="w-4 h-4" />
 </div>
 <div className="truncate">
 <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
 <span
 className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold rounded-full border ${getRoleBadgeColor(
 user?.role
 )}`}
 >
 {user?.role}
 </span>
 </div>
 </div>
 </div>
 </aside>

 {/* Main Container */}
 <div className="flex-1 flex flex-col md:pl-64 min-w-0">
 {/* Topbar Header */}
 <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
 >
 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 <h2 className="text-sm font-semibold text-slate-300 hidden sm:block">
 Warehouse Management System
 </h2>
 </div>

 <div className="flex items-center space-x-4">
 {/* Notification Bell Badge Dropdown */}
 <div className="relative">
 <button
 onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
 className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
 >
 <Bell className="w-5 h-5" />
 {unreadCount > 0 && (
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
 )}
 </button>

 {notifDropdownOpen && (
 <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50 glass-panel">
 <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
 <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifikasi System</h4>
 {unreadCount > 0 && (
 <button
 onClick={handleMarkAllRead}
 className="text-[10px] text-indigo-400 hover:underline font-semibold"
 >
 Tandai Semua Dibaca
 </button>
 )}
 </div>

 <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
 {notifications.length === 0 ? (
 <p className="px-4 py-6 text-center text-xs text-slate-500">Tidak ada notifikasi baru.</p>
 ) : (
 notifications.map((n) => (
 <div
 key={n.id}
 className={`px-4 py-3 hover:bg-slate-800/40 transition ${
 !n.isRead ? 'bg-indigo-500/5' : ''
 }`}
 >
 <div className="flex items-start justify-between">
 <h5 className="text-xs font-bold text-white">{n.title}</h5>
 {!n.isRead && (
 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1"></span>
 )}
 </div>
 <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
 <span className="text-[9px] text-slate-500 block mt-1">
 {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>

 {/* User Profile Dropdown */}
 <div className="relative">
 <button
 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
 className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition text-left"
 >
 <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
 {user?.fullName?.charAt(0) || 'U'}
 </div>
 <div className="hidden sm:block text-left">
 <p className="text-xs font-semibold text-white leading-tight">{user?.fullName}</p>
 <p className="text-[10px] text-slate-400">{user?.role}</p>
 </div>
 <ChevronDown className="w-4 h-4 text-slate-400" />
 </button>

 {profileDropdownOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
 <div className="px-4 py-2 border-b border-slate-800">
 <p className="text-xs font-semibold text-white">{user?.fullName}</p>
 <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
 </div>
 <button
 onClick={handleLogout}
 className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
 >
 <LogOut className="w-4 h-4 mr-2" />
 Keluar (Logout)
 </button>
 </div>
 )}
 </div>
 </div>
 </header>

 {/* Mobile Navigation Menu Drawer */}
 {mobileMenuOpen && (
 <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-1">
 {filteredNavItems.map((item) => {
 const Icon = item.icon;
 const isActive = location.pathname === item.path;
 return (
 <Link
 key={item.path}
 to={item.path}
 onClick={() => setMobileMenuOpen(false)}
 className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition ${
 isActive
 ? 'bg-indigo-600 text-white font-semibold'
 : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
 }`}
 >
 <Icon className="w-4 h-4 mr-3" />
 <span>{item.title}</span>
 </Link>
 );
 })}
 </div>
 )}

 {/* Content Body */}
 <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
 <Outlet />
 </main>
 </div>
 </div>
 );
};
