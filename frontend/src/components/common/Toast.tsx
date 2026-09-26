import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
 message: string;
 type?: 'success' | 'error' | 'info';
 onClose: () => void;
 duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
 message,
 type = 'info',
 onClose,
 duration = 4000,
}) => {
 useEffect(() => {
 const timer = setTimeout(() => {
 onClose();
 }, duration);
 return () => clearTimeout(timer);
 }, [onClose, duration]);

 const typeStyles = {
 success: 'bg-emerald-950 border-emerald-500/30 text-emerald-400',
 error: 'bg-rose-950 border-rose-500/30 text-rose-400',
 info: 'bg-slate-900 border-indigo-500/30 text-indigo-400',
 };

 const icons = {
 success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
 error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
 info: <Info className="w-5 h-5 flex-shrink-0" />,
 };

 return (
 <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
 <div
 className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-medium ${typeStyles[type]}`}
 >
 {icons[type]}
 <span>{message}</span>
 <button
 onClick={onClose}
 className="ml-2 text-slate-400 hover:text-white transition"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
};
