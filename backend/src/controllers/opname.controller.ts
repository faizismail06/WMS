import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

function generateOpnameNo(): string {
 const periodStr = new Date().toISOString().slice(0, 7).replace("-", "");
 const randomSuffix = Math.floor(1000 + Math.random() * 9000);
 return `OPN-${periodStr}-${randomSuffix}`;
}

const createOpnameSchema = z.object({
 title: z.string().min(3, "Judul sesi opname wajib diisi"),
 period: z.string().min(4, "Periode wajib diisi"),
 notes: z.string().optional()
});

const updateCountsSchema = z.object({
 items: z.array(
 z.object({
 id: z.string().uuid("ID item tidak valid"),
 physicalStock: z.number().int().nonnegative("Stok fisik tidak boleh negatif"),
 notes: z.string().optional()
 })
 )
});

const verifyOpnameSchema = z.object({
 action: z.enum(["APPROVE", "REJECT"]),
 rejectionReason: z.string().optional()
});

export async function createOpnameController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) throw new AppError("Pengguna belum terautentikasi", 401, "UNAUTHORIZED");

 const data = createOpnameSchema.parse(req.body);

 // Ambil snapshot seluruh produk aktif
 const activeProducts = await prisma.product.findMany({
 where: { status: "ACTIVE" }
 });

 if (activeProducts.length === 0) {
 throw new AppError("Tidak ada produk aktif dalam database untuk dilakukan opname", 400, "NO_ACTIVE_PRODUCTS");
 }

 const opname = await prisma.$transaction(async (tx) => {
 const opnameNo = generateOpnameNo();

 const opn = await tx.stockOpname.create({
 data: {
 opnameNo,
 title: data.title,
 period: data.period,
 status: "DRAFT",
 notes: data.notes,
 createdById: req.user!.userId,
 items: {
 create: activeProducts.map((p) => ({
 productId: p.id,
 systemStock: p.stock,
 physicalStock: p.stock, // Default disamakan dengan stok sistem
 difference: 0
 }))
 }
 },
 include: { items: true }
 });

 await tx.auditLog.create({
 data: {
 userId: req.user!.userId,
 action: "CREATE_STOCK_OPNAME",
 module: "OPNAME",
 recordId: opn.id,
 details: { opnameNo, title: opn.title, itemSnapshotCount: activeProducts.length }
 }
 });

 return opn;
 });

 return res.status(201).json({
 success: true,
 message: "Sesi Stock Opname berhasil dibuat",
 data: opname
 });
 } catch (error) {
 next(error);
 }
}

export async function getOpnamesController(req: Request, res: Response, next: NextFunction) {
 try {
 const { status, q, page = 1, limit = 10 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};
 if (status) where.status = String(status);
 if (q) {
 where.OR = [
 { opnameNo: { contains: String(q), mode: "insensitive" } },
 { title: { contains: String(q), mode: "insensitive" } },
 { period: { contains: String(q), mode: "insensitive" } }
 ];
 }

 const [opnames, totalRecords] = await Promise.all([
 prisma.stockOpname.findMany({
 where,
 skip,
 take: limitNum,
 include: {
 createdBy: { select: { id: true, fullName: true } },
 verifiedBy: { select: { id: true, fullName: true } },
 _count: { select: { items: true } }
 },
 orderBy: { createdAt: "desc" }
 }),
 prisma.stockOpname.count({ where })
 ]);

 return res.status(200).json({
 success: true,
 message: "Data Stock Opname berhasil diambil",
 data: opnames,
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

export async function getOpnameByIdController(req: Request, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const opname = await prisma.stockOpname.findUnique({
 where: { id },
 include: {
 createdBy: { select: { id: true, fullName: true, email: true } },
 verifiedBy: { select: { id: true, fullName: true, email: true } },
 items: {
 include: {
 product: { select: { id: true, sku: true, name: true, unit: true, rackLocation: true } }
 },
 orderBy: { product: { sku: "asc" } }
 }
 }
 });

 if (!opname) throw new AppError("Sesi Stock Opname tidak ditemukan", 404, "NOT_FOUND");

 return res.status(200).json({
 success: true,
 message: "Detail Stock Opname berhasil diambil",
 data: opname
 });
 } catch (error) {
 next(error);
 }
}

export async function updateOpnameCountsController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;
 const data = updateCountsSchema.parse(req.body);

 const opname = await prisma.stockOpname.findUnique({ where: { id } });
 if (!opname) throw new AppError("Sesi Stock Opname tidak ditemukan", 404, "NOT_FOUND");

 if (["APPROVED", "COMPLETED"].includes(opname.status)) {
 throw new AppError("Sesi opname yang sudah disetujui tidak dapat diubah", 400, "OPNAME_LOCKED");
 }

 await prisma.$transaction(async (tx) => {
 for (const item of data.items) {
 const existingItem = await tx.stockOpnameItem.findUnique({ where: { id: item.id } });
 if (existingItem) {
 const difference = item.physicalStock - existingItem.systemStock;
 await tx.stockOpnameItem.update({
 where: { id: item.id },
 data: {
 physicalStock: item.physicalStock,
 difference,
 notes: item.notes
 }
 });
 }
 }

 await tx.stockOpname.update({
 where: { id },
 data: { status: "COUNTING" }
 });
 });

 return res.status(200).json({
 success: true,
 message: "Data perhitungan fisik stok berhasil disimpan"
 });
 } catch (error) {
 next(error);
 }
}

export async function submitOpnameController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const opname = await prisma.stockOpname.findUnique({ where: { id } });
 if (!opname) throw new AppError("Sesi Stock Opname tidak ditemukan", 404, "NOT_FOUND");

 const updated = await prisma.stockOpname.update({
 where: { id },
 data: { status: "WAITING_APPROVAL" }
 });

 // Buat notifikasi untuk Supervisor
 const supervisorRole = await prisma.role.findUnique({ where: { name: "SUPERVISOR" } });
 if (supervisorRole) {
 const supervisors = await prisma.user.findMany({ where: { roleId: supervisorRole.id } });
 for (const sup of supervisors) {
 await prisma.notification.create({
 data: {
 userId: sup.id,
 title: "Stock Opname Menunggu Approval",
 message: `Sesi '${opname.title}' (${opname.opnameNo}) telah disubmit dan memerlukan verifikasi Anda.`,
 type: "OPNAME_APPROVAL"
 }
 });
 }
 }

 return res.status(200).json({
 success: true,
 message: "Stock Opname berhasil disubmit ke Supervisor untuk verifikasi",
 data: updated
 });
 } catch (error) {
 next(error);
 }
}

export async function verifyOpnameController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) throw new AppError("Pengguna belum terautentikasi", 401, "UNAUTHORIZED");

 const { id } = req.params;
 const { action, rejectionReason } = verifyOpnameSchema.parse(req.body);

 const opname = await prisma.stockOpname.findUnique({
 where: { id },
 include: { items: true }
 });

 if (!opname) throw new AppError("Sesi Stock Opname tidak ditemukan", 404, "NOT_FOUND");

 if (opname.status !== "WAITING_APPROVAL") {
 throw new AppError("Hanya sesi opname berstatus WAITING_APPROVAL yang dapat diverifikasi", 400, "INVALID_STATUS");
 }

 if (action === "REJECT") {
 const updated = await prisma.stockOpname.update({
 where: { id },
 data: {
 status: "REJECTED",
 rejectionReason: rejectionReason || "Hasil perhitungan ditolak oleh Supervisor."
 }
 });

 return res.status(200).json({
 success: true,
 message: "Stock Opname telah ditolak",
 data: updated
 });
 }

 // Jika APPROVE: Update stok produk secara atomic & set status ke COMPLETED
 const result = await prisma.$transaction(async (tx) => {
 // 1. Update stok setiap produk ke physicalStock
 for (const item of opname.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: { stock: item.physicalStock }
 });
 }

 // 2. Update status opname
 const updatedOpn = await tx.stockOpname.update({
 where: { id },
 data: {
 status: "COMPLETED",
 verifiedById: req.user!.userId,
 verifiedAt: new Date()
 }
 });

 // 3. Catat Audit Log
 await tx.auditLog.create({
 data: {
 userId: req.user!.userId,
 action: "APPROVE_STOCK_OPNAME",
 module: "OPNAME",
 recordId: id,
 details: { opnameNo: opname.opnameNo, itemsAdjustedCount: opname.items.length }
 }
 });

 return updatedOpn;
 });

 return res.status(200).json({
 success: true,
 message: "Stock Opname berhasil disetujui! Seluruh stok produk otomatis disesuaikan.",
 data: result
 });
 } catch (error) {
 next(error);
 }
}
