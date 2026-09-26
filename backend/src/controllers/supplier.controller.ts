import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const supplierSchema = z.object({
 code: z.string().min(2, "Kode supplier minimal 2 karakter").max(20),
 name: z.string().min(2, "Nama supplier wajib diisi"),
 contactPerson: z.string().min(2, "Contact person wajib diisi"),
 phone: z.string().min(5, "Nomor telepon wajib diisi"),
 email: z.string().email("Format email tidak valid"),
 address: z.string().min(5, "Alamat wajib diisi")
});

const supplierUpdateSchema = supplierSchema.partial().extend({
 status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export async function getSuppliersController(req: Request, res: Response, next: NextFunction) {
 try {
 const { q, status, page = 1, limit = 10 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};
 if (q) {
 where.OR = [
 { code: { contains: String(q), mode: "insensitive" } },
 { name: { contains: String(q), mode: "insensitive" } },
 { contactPerson: { contains: String(q), mode: "insensitive" } },
 { email: { contains: String(q), mode: "insensitive" } }
 ];
 }
 if (status) {
 where.status = String(status);
 }

 const [suppliers, totalRecords] = await Promise.all([
 prisma.supplier.findMany({
 where,
 skip,
 take: limitNum,
 orderBy: { createdAt: "desc" }
 }),
 prisma.supplier.count({ where })
 ]);

 return res.status(200).json({
 success: true,
 message: "Data supplier berhasil diambil",
 data: suppliers,
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

export async function createSupplierController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const data = supplierSchema.parse(req.body);

 const existingCode = await prisma.supplier.findUnique({
 where: { code: data.code.toUpperCase() }
 });

 if (existingCode) {
 throw new AppError(`Kode supplier '${data.code.toUpperCase()}' sudah terdaftar`, 400, "DUPLICATE_CODE");
 }

 const supplier = await prisma.supplier.create({
 data: {
 code: data.code.toUpperCase(),
 name: data.name,
 contactPerson: data.contactPerson,
 phone: data.phone,
 email: data.email,
 address: data.address,
 status: "ACTIVE"
 }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "CREATE_SUPPLIER",
 module: "SUPPLIERS",
 recordId: supplier.id,
 details: { code: supplier.code, name: supplier.name }
 }
 });
 }

 return res.status(201).json({
 success: true,
 message: "Supplier baru berhasil ditambahkan",
 data: supplier
 });
 } catch (error) {
 next(error);
 }
}

export async function updateSupplierController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;
 const data = supplierUpdateSchema.parse(req.body);

 const supplier = await prisma.supplier.findUnique({ where: { id } });
 if (!supplier) {
 throw new AppError("Data supplier tidak ditemukan", 404, "NOT_FOUND");
 }

 const updated = await prisma.supplier.update({
 where: { id },
 data
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "UPDATE_SUPPLIER",
 module: "SUPPLIERS",
 recordId: supplier.id,
 details: { code: supplier.code, changes: data }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: "Data supplier berhasil diperbarui",
 data: updated
 });
 } catch (error) {
 next(error);
 }
}
