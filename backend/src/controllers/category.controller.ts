import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const categorySchema = z.object({
 code: z.string().min(2, "Kode minimal 2 karakter").max(20),
 name: z.string().min(2, "Nama kategori wajib diisi"),
 description: z.string().optional()
});

const categoryUpdateSchema = z.object({
 name: z.string().min(2, "Nama kategori wajib diisi").optional(),
 description: z.string().optional(),
 status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export async function getCategoriesController(req: Request, res: Response, next: NextFunction) {
 try {
 const { q, status } = req.query;

 const where: any = {};
 if (q) {
 where.OR = [
 { code: { contains: String(q), mode: "insensitive" } },
 { name: { contains: String(q), mode: "insensitive" } }
 ];
 }
 if (status) {
 where.status = String(status);
 }

 const categories = await prisma.category.findMany({
 where,
 include: {
 _count: {
 select: { products: true }
 }
 },
 orderBy: { createdAt: "desc" }
 });

 const formatted = categories.map((cat) => ({
 id: cat.id,
 code: cat.code,
 name: cat.name,
 description: cat.description,
 status: cat.status,
 productCount: cat._count.products,
 createdAt: cat.createdAt,
 updatedAt: cat.updatedAt
 }));

 return res.status(200).json({
 success: true,
 message: "Data kategori berhasil diambil",
 data: formatted
 });
 } catch (error) {
 next(error);
 }
}

export async function createCategoryController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const data = categorySchema.parse(req.body);

 const existingCode = await prisma.category.findUnique({
 where: { code: data.code.toUpperCase() }
 });

 if (existingCode) {
 throw new AppError(`Kode kategori '${data.code.toUpperCase()}' sudah terdaftar`, 400, "DUPLICATE_CODE");
 }

 const category = await prisma.category.create({
 data: {
 code: data.code.toUpperCase(),
 name: data.name,
 description: data.description,
 status: "ACTIVE"
 }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "CREATE_CATEGORY",
 module: "CATEGORIES",
 recordId: category.id,
 details: { code: category.code, name: category.name }
 }
 });
 }

 return res.status(201).json({
 success: true,
 message: "Kategori baru berhasil dibuat",
 data: category
 });
 } catch (error) {
 next(error);
 }
}

export async function updateCategoryController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;
 const data = categoryUpdateSchema.parse(req.body);

 const category = await prisma.category.findUnique({ where: { id } });
 if (!category) {
 throw new AppError("Data kategori tidak ditemukan", 404, "NOT_FOUND");
 }

 const updated = await prisma.category.update({
 where: { id },
 data
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "UPDATE_CATEGORY",
 module: "CATEGORIES",
 recordId: category.id,
 details: { code: category.code, changes: data }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: "Data kategori berhasil diperbarui",
 data: updated
 });
 } catch (error) {
 next(error);
 }
}

export async function deleteCategoryController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const category = await prisma.category.findUnique({
 where: { id },
 include: {
 _count: { select: { products: true } }
 }
 });

 if (!category) {
 throw new AppError("Data kategori tidak ditemukan", 404, "NOT_FOUND");
 }

 if (category._count.products > 0) {
 throw new AppError(
 `Kategori '${category.name}' tidak dapat dihapus karena masih digunakan oleh ${category._count.products} produk.`,
 400,
 "CATEGORY_IN_USE"
 );
 }

 await prisma.category.delete({ where: { id } });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "DELETE_CATEGORY",
 module: "CATEGORIES",
 recordId: id,
 details: { code: category.code, name: category.name }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: "Kategori berhasil dihapus",
 data: { id }
 });
 } catch (error) {
 next(error);
 }
}
