import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { PaginationMeta } from '../../types/master';

export interface Column<T> {
 header: string;
 accessor?: keyof T;
 render?: (item: T) => React.ReactNode;
 className?: string;
}

interface DataTableProps<T> {
 columns: Column<T>[];
 data: T[];
 isLoading?: boolean;
 meta?: PaginationMeta;
 onPageChange?: (page: number) => void;
 emptyText?: string;
 rowKey?: (item: T) => string;
}

export function DataTable<T>({
 columns,
 data,
 isLoading = false,
 meta,
 onPageChange,
 emptyText = 'Belum ada data yang tersedia.',
 rowKey = (item: any) => item.id || Math.random().toString(),
}: DataTableProps<T>) {
 return (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
 {columns.map((col, index) => (
 <th key={index} className={`px-6 py-4 ${col.className || ''}`}>
 {col.header}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-xs">
 {isLoading ? (
 // Skeleton Loading Rows
 Array.from({ length: 5 }).map((_, rIdx) => (
 <tr key={rIdx} className="animate-pulse">
 {columns.map((_, cIdx) => (
 <td key={cIdx} className="px-6 py-4">
 <div className="h-4 bg-slate-800 rounded-lg w-3/4"></div>
 </td>
 ))}
 </tr>
 ))
 ) : data.length === 0 ? (
 // Empty State Row
 <tr>
 <td colSpan={columns.length} className="px-6 py-12 text-center">
 <div className="flex flex-col items-center justify-center space-y-3">
 <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
 <Inbox className="w-6 h-6" />
 </div>
 <p className="text-slate-400 text-sm font-medium">{emptyText}</p>
 </div>
 </td>
 </tr>
 ) : (
 // Data Rows
 data.map((item) => (
 <tr
 key={rowKey(item)}
 className="hover:bg-slate-800/40 transition duration-150 text-slate-200"
 >
 {columns.map((col, cIdx) => (
 <td key={cIdx} className={`px-6 py-4 ${col.className || ''}`}>
 {col.render
 ? col.render(item)
 : col.accessor
 ? (item[col.accessor] as any)
 : null}
 </td>
 ))}
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Footer */}
 {meta && meta.totalPages > 1 && (
 <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
 <div>
 Menampilkan <span className="font-semibold text-white">{data.length}</span> dari{' '}
 <span className="font-semibold text-white">{meta.totalRecords}</span> data
 </div>
 <div className="flex items-center space-x-2">
 <button
 onClick={() => onPageChange && onPageChange(meta.page - 1)}
 disabled={meta.page <= 1}
 className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="font-medium text-slate-300">
 Halaman {meta.page} dari {meta.totalPages}
 </span>
 <button
 onClick={() => onPageChange && onPageChange(meta.page + 1)}
 disabled={meta.page >= meta.totalPages}
 className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
