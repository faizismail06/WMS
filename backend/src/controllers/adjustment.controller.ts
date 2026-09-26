import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

function generateAdjustmentNo(): string {
 const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
 const randomSuffix = Math.floor(1000 + Math.random() * 9000);
 return `ADJ-${dateStr}-${randomSuffix}`;
}

const adjustmentSchema = z.object({
 productId: z.string().uuid("Produk wajib dipilih"),
 actualStock: z.number().int().nonnegative("Stok aktual tidak boleh negatif"),
 reason: z.enum(["DAMAGED", "EXPIRED", "LOST", "FOUND", "OTHER"], {
 errorMap: () => ({ message: "Alasan penyesuaian tidak valid" })
 }),
 notes: z.string().optional()
});

export async function createAdjustmentController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) throw new AppError("Pengguna belum terautentikasi", 401, "UNAUTHORIZED");

 const data = adjustmentSchema.parse(req.body);

 const product = await prisma.product.findUnique({ where: { id: data.productId } });
 if (!product) throw new AppError("Data produk tidak ditemukan", 400, "INVALID_PRODUCT");

 const systemStock = product.stock;
 const difference = data.actualStock - systemStock;

 const adjustment = await prisma.$transaction(async (tx) => {
 const adjustmentNo = generateAdjustmentNo();

 // 1. Buat Record Adjustment
 const adj = await tx.stockAdjustment.create({
 data: {
 adjustmentNo,
 productId: data.productId,
 systemStock,
 actualStock: data.actualStock,
 difference,
 reason: data.reason,
 notes: data.notes,
 createdById: req.user!.userId
 }
 });

 // 2. Update Stok Produk ke Actual Stock
 await tx.product.update({
 where: { id: data.productId },
 data: { stock: data.actualStock }
 });

 // 3. Catat Audit Log
 await tx.auditLog.create({
 data: {
 userId: req.user!.userId,
 action: "CREATE_STOCK_ADJUSTMENT",
 module: "INVENTORY",
 recordId: adj.id,
 details: {
 adjustmentNo,
 sku: product.sku,
 systemStock,
 actualStock: data.actualStock,
 difference,
 reason: data.reason
 }
 }
 });

 return adj;
 });

 return res.status(201).json({
 success: true,
 message: "Penyesuaian stok berhasil diproses",
 data: adjustment
 });
 } catch (error) {
 next(error);
 }
}

export async function getAdjustmentsController(req: Request, res: Response, next: NextFunction) {
 try {
 const { q, reason, page = 1, limit = 10 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};
 if (reason) where.reason = String(reason);
 if (q) {
 where.OR = [
 { adjustmentNo: { contains: String(q), mode: "insensitive" } },
 { product: { sku: { contains: String(q), mode: "insensitive" } } },
 { product: { name: { contains: String(q), mode: "insensitive" } } }
 ];
 }

 const [adjustments, totalRecords] = await Promise.all([
 prisma.stockAdjustment.findMany({
 where,
 skip,
 take: limitNum,
 include: {
 product: { select: { id: true, sku: true, name: true, unit: true } },
 createdBy: { select: { id: true, fullName: true, email: true } }
 },
 orderBy: { createdAt: "desc" }
 }),
 prisma.stockAdjustment.count({ where })
 ]);

 return res.status(200).json({
 success: true,
 message: "Data penyesuaian stok berhasil diambil",
 data: adjustments,
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
