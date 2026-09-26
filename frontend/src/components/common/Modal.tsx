import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
 isOpen,
 onClose,
 title,
 children,
 maxWidth = 'lg',
}) => {
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 window.addEventListener('keydown', handleKeyDown);
 }
 return () => {
 document.body.style.overflow = 'auto';
 window.removeEventListener('keydown', handleKeyDown);
 };
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 const maxWidthClasses = {
 sm: 'sm:max-w-sm',
 md: 'sm:max-w-md',
 lg: 'sm:max-w-lg',
 xl: 'sm:max-w-xl',
 '2xl': 'sm:max-w-2xl',
 };

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
 onClick={onClose}
 />

 {/* Modal Content Dialog */}
 <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
 <div
 className={`relative transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full ${maxWidthClasses[maxWidth]} glass-panel`}
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
 <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
 <button
 onClick={onClose}
 className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Body */}
 <div className="px-6 py-5">{children}</div>
 </div>
 </div>
 </div>
 );
};
