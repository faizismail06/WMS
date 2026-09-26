import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Suppliers } from './pages/Suppliers';
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { TransactionHistory } from './pages/TransactionHistory';
import { StockAdjustment } from './pages/StockAdjustment';
import { StockOpname } from './pages/StockOpname';
import { OpnameDetail } from './pages/OpnameDetail';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { AuditLogs } from './pages/AuditLogs';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 refetchOnWindowFocus: false,
 retry: 1,
 },
 },
});

const App: React.FC = () => {
 return (
 <QueryClientProvider client={queryClient}>
 <AuthProvider>
 <BrowserRouter>
 <Routes>
 {/* Public Auth Routes */}
 <Route path="/login" element={<Login />} />

 {/* Protected Routes Wrapper */}
 <Route element={<ProtectedRoute />}>
 <Route element={<MainLayout />}>
 <Route path="/" element={<Dashboard />} />
 <Route path="/products" element={<Products />} />
 <Route path="/categories" element={<Categories />} />
 <Route path="/suppliers" element={<Suppliers />} />
 
 <Route path="/stock-in" element={<StockIn />} />
 <Route path="/stock-out" element={<StockOut />} />
 <Route path="/history" element={<TransactionHistory />} />

 <Route path="/stock-adjustment" element={<StockAdjustment />} />
 <Route path="/stock-opname" element={<StockOpname />} />
 <Route path="/stock-opname/:id" element={<OpnameDetail />} />

 <Route path="/reports" element={<Reports />} />
 
 {/* Specific Role Protected Routes */}
 <Route element={<ProtectedRoute allowedRoles={['ADMIN_SISTEM']} />}>
 <Route path="/users" element={<UserManagement />} />
 </Route>

 <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN_SISTEM']} />}>
 <Route path="/audit-logs" element={<AuditLogs />} />
 </Route>
 </Route>
 </Route>

 {/* Fallback Catch-all Route */}
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </BrowserRouter>
 </AuthProvider>
 </QueryClientProvider>
 );
};

export default App;
