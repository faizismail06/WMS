import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types/auth';
import { authService, LoginPayload } from '../services/auth.service';

interface AuthContextType {
 user: User | null;
 token: string | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 login: (payload: LoginPayload) => Promise<void>;
 logout: () => void;
 hasRole: (roles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [user, setUser] = useState<User | null>(() => {
 const savedUser = localStorage.getItem('wms_user');
 return savedUser ? JSON.parse(savedUser) : null;
 });

 const [token, setToken] = useState<string | null>(() => {
 return localStorage.getItem('wms_token');
 });

 const [isLoading, setIsLoading] = useState<boolean>(true);

 useEffect(() => {
 const initAuth = async () => {
 const storedToken = localStorage.getItem('wms_token');
 if (storedToken) {
 try {
 const currentUser = await authService.getMe();
 setUser(currentUser);
 localStorage.setItem('wms_user', JSON.stringify(currentUser));
 } catch (error) {
 console.error('Failed to verify token:', error);
 logout();
 }
 } else {
 setUser(null);
 setToken(null);
 }
 setIsLoading(false);
 };

 initAuth();
 }, []);

 const login = async (payload: LoginPayload) => {
 const data = await authService.login(payload);
 setToken(data.token);
 setUser(data.user);
 localStorage.setItem('wms_token', data.token);
 localStorage.setItem('wms_user', JSON.stringify(data.user));
 };

 const logout = () => {
 setToken(null);
 setUser(null);
 localStorage.removeItem('wms_token');
 localStorage.removeItem('wms_user');
 };

 const hasRole = (allowedRoles: RoleName[]): boolean => {
 if (!user) return false;
 return allowedRoles.includes(user.role);
 };

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 isAuthenticated: !!token && !!user,
 isLoading,
 login,
 logout,
 hasRole
 }}
 >
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
