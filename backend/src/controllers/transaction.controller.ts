import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// Helper generator nomor transaksi otomatis
function generateTransactionNo(type: "IN" | "OUT"): string {
 const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
 const randomSuffix = Math.floor(1000 + Math.random() * 9000);
 return `TRX-${type}-${dateStr}-${randomSuffix}`;
}

const stockInSchema = z.object({
 supplierId: z.string().uuid("Supplier wajib dipilih"),
 notes: z.string().optional(),
 items: z
 .array(
 z.object({
 productId: z.string().uuid("Produk wajib dipilih"),
 quantity: z.number().int().positive("Kuantitas harus lebih dari 0"),
 unitPrice: z.number().nonnegative("Harga beli tidak boleh negatif")
 })
 )
 .min(1, "Minimal 1 item barang harus dimasukkan")
});

const stockOutSchema = z.object({
 destination: z.string().min(2, "Tujuan pengeluaran wajib diisi"),
 notes: z.string().optional(),
 items: z
 .array(
 z.object({
 productId: z.string().uuid("Produk wajib dipilih"),
 quantity: z.number().int().positive("Kuantitas harus lebih dari 0")
 })
 )
 .min(1, "Minimal 1 item barang harus dimasukkan")
});

export async function createStockInController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) throw new AppError("Pengguna belum terautentikasi", 401, "UNAUTHORIZED");

 const data = stockInSchema.parse(req.body);

 // Cek supplier
 const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
 if (!supplier) throw new AppError("Supplier tidak ditemukan", 400, "INVALID_SUPPLIER");

 // Jalankan transaksi database Prisma
 const transaction = await prisma.$transaction(async (tx) => {
 const transactionNo = generateTransactionNo("IN");

 // 1. Buat Header Transaksi
 const trx = await tx.stockTransaction.create({
 data: {
 transactionNo,
 type: "IN",
 supplierId: data.supplierId,
 notes: data.notes,
 createdById: req.user!.userId
 }
 });

 // 2. Loop Items: Update Stock & Buat Transaction Items
 for (const item of data.items) {
 const product = await tx.product.findUnique({ where: { id: item.productId } });
 if (!product) {
 throw new AppError(`Produk dengan ID '${item.productId}' tidak ditemukan`, 400, "INVALID_PRODUCT");
 }

 const stockBefore = product.stock;
 const stockAfter = stockBefore + item.quantity;
 const totalPrice = item.quantity * item.unitPrice;

 // Update stok produk
 await tx.product.update({
 where: { id: item.productId },
 data: { stock: stockAfter }
 });

 // Buat item transaksi
 await tx.stockTransactionItem.create({
 data: {
 transactionId: trx.id,
 productId: item.productId,
 quantity: item.quantity,
 unitPrice: item.unitPrice,
 totalPrice,
 stockBefore,
 stockAfter
 }
 });
 }

 // 3. Catat Audit Log
 await tx.auditLog.create({
 data: {
 userId: req.user!.userId,
 action: "CREATE_STOCK_IN",
 module: "TRANSACTIONS",
 recordId: trx.id,
 details: { transactionNo, supplier: supplier.name, itemCount: data.items.length }
 }
 });

 return trx;
 });

 return res.status(201).json({
 success: true,
 message: "Transaksi Barang Masuk berhasil dicatat",
 data: transaction
 });
 } catch (error) {
 next(error);
 }
}

export async function createStockOutController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) throw new AppError("Pengguna belum terautentikasi", 401, "UNAUTHORIZED");

 const data = stockOutSchema.parse(req.body);

 // Jalankan transaksi database Prisma
 const transaction = await prisma.$transaction(async (tx) => {
 // Step 1: Validasi Ketersediaan Stok Semua Item Terlebih Dahulu
 for (const item of data.items) {
 const product = await tx.product.findUnique({ where: { id: item.productId } });
 if (!product) {
 throw new AppError(`Produk tidak ditemukan`, 400, "INVALID_PRODUCT");
 }

 if (item.quantity > product.stock) {
 throw new AppError(
 `Stok barang '${product.name}' (SKU: ${product.sku}) tidak mencukupi. Kuantitas diminta: ${item.quantity} ${product.unit}, Stok tersedia: ${product.stock} ${product.unit}.`,
 400,
 "INSUFFICIENT_STOCK"
 );
 }
 }

 // Step 2: Buat Header Transaksi
 const transactionNo = generateTransactionNo("OUT");
 const trx = await tx.stockTransaction.create({
 data: {
 transactionNo,
 type: "OUT",
 destination: data.destination,
 notes: data.notes,
 createdById: req.user!.userId
 }
 });

 // Step 3: Kurangi Stok & Buat Items
 for (const item of data.items) {
 const product = (await tx.product.findUnique({ where: { id: item.productId } }))!;
 const stockBefore = product.stock;
 const stockAfter = stockBefore - item.quantity;
 const unitPrice = Number(product.price);
 const totalPrice = item.quantity * unitPrice;

 // Kurangi stok produk
 await tx.product.update({
 where: { id: item.productId },
 data: { stock: stockAfter }
 });

 // Buat item transaksi
 await tx.stockTransactionItem.create({
 data: {
 transactionId: trx.id,
 productId: item.productId,
 quantity: item.quantity,
 unitPrice,
 totalPrice,
 stockBefore,
 stockAfter
 }
 });

 // Jika stok sesudah transaksi <= minStock, buat Notifikasi Low Stock
 if (stockAfter <= product.minStock) {
 await tx.notification.create({
 data: {
 userId: req.user!.userId,
 title: "Peringatan Stok Menipis",
 message: `Stok barang '${product.name}' (SKU: ${product.sku}) menipis! Sisa stok: ${stockAfter} ${product.unit} (Min: ${product.minStock}).`,
 type: "LOW_STOCK"
 }
 });
 }
 }

 // Step 4: Audit Log
 await tx.auditLog.create({
 data: {
 userId: req.user!.userId,
 action: "CREATE_STOCK_OUT",
 module: "TRANSACTIONS",
 recordId: trx.id,
 details: { transactionNo, destination: data.destination, itemCount: data.items.length }
 }
 });

 return trx;
 });

 return res.status(201).json({
 success: true,
 message: "Transaksi Barang Keluar berhasil diproses",
 data: transaction
 });
 } catch (error) {
 next(error);
 }
}

export async function getTransactionsController(req: Request, res: Response, next: NextFunction) {
 try {
 const { type, q, startDate, endDate, page = 1, limit = 10 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};

 if (type && ["IN", "OUT"].includes(String(type))) {
 where.type = String(type);
 }

 if (q) {
 where.OR = [
 { transactionNo: { contains: String(q), mode: "insensitive" } },
 { destination: { contains: String(q), mode: "insensitive" } },
 { supplier: { name: { contains: String(q), mode: "insensitive" } } }
 ];
 }

 if (startDate || endDate) {
 where.date = {};
 if (startDate) where.date.gte = new Date(String(startDate));
 if (endDate) where.date.lte = new Date(String(endDate));
 }

 const [transactions, totalRecords] = await Promise.all([
 prisma.stockTransaction.findMany({
 where,
 skip,
 take: limitNum,
 include: {
 supplier: { select: { id: true, code: true, name: true } },
 createdBy: { select: { id: true, fullName: true, email: true } },
 items: {
 include: {
 product: { select: { id: true, sku: true, name: true, unit: true } }
 }
 }
 },
 orderBy: { date: "desc" }
 }),
 prisma.stockTransaction.count({ where })
 ]);

 return res.status(200).json({
 success: true,
 message: "Data riwayat transaksi berhasil diambil",
 data: transactions,
 meta: {
 page: pageNum,
 limit: limitNum,
 totalRecords,
 totalPages: Math.ceil(totalRecords / limitNum)
 }
 });
 } catch (error) {
 next(error);
 }
}
