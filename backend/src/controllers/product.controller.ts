import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const createProductSchema = z.object({
 sku: z.string().min(3, "SKU minimal 3 karakter").max(30),
 name: z.string().min(2, "Nama barang wajib diisi"),
 description: z.string().optional(),
 categoryId: z.string().uuid("ID Kategori tidak valid"),
 unit: z.string().min(1, "Satuan barang wajib diisi"),
 supplierId: z.string().uuid("ID Supplier tidak valid"),
 price: z.number().positive("Harga barang harus lebih dari 0"),
 stock: z.number().int().nonnegative("Stok awal tidak boleh negatif"),
 minStock: z.number().int().nonnegative("Minimum stok wajib diisi"),
 rackLocation: z.string().min(1, "Lokasi rak wajib diisi")
});

const updateProductSchema = createProductSchema.partial().extend({
 status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export async function getProductsController(req: Request, res: Response, next: NextFunction) {
 try {
 const {
 q,
 categoryId,
 supplierId,
 status,
 lowStock,
 page = 1,
 limit = 10,
 sortBy = "createdAt",
 sortOrder = "desc"
 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};

 if (q) {
 where.OR = [
 { sku: { contains: String(q), mode: "insensitive" } },
 { name: { contains: String(q), mode: "insensitive" } },
 { rackLocation: { contains: String(q), mode: "insensitive" } }
 ];
 }

 if (categoryId) {
 where.categoryId = String(categoryId);
 }

 if (supplierId) {
 where.supplierId = String(supplierId);
 }

 if (status) {
 where.status = String(status);
 }

 // Filter produk stok menipis
 if (lowStock === "true") {
 where.stock = { lte: prisma.product.fields.minStock };
 }

 const orderByField = ["name", "stock", "price", "createdAt", "sku"].includes(String(sortBy))
 ? String(sortBy)
 : "createdAt";
 const orderDirection = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

 const [products, totalRecords] = await Promise.all([
 prisma.product.findMany({
 where,
 skip,
 take: limitNum,
 include: {
 category: { select: { id: true, code: true, name: true } },
 supplier: { select: { id: true, code: true, name: true } }
 },
 orderBy: { [orderByField]: orderDirection }
 }),
 prisma.product.count({ where })
 ]);

 return res.status(200).json({
 success: true,
 message: "Data barang berhasil diambil",
 data: products,
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

export async function getProductByIdController(req: Request, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const product = await prisma.product.findUnique({
 where: { id },
 include: {
 category: true,
 supplier: true
 }
 });

 if (!product) {
 throw new AppError("Data barang tidak ditemukan", 404, "NOT_FOUND");
 }

 return res.status(200).json({
 success: true,
 message: "Detail barang berhasil diambil",
 data: product
 });
 } catch (error) {
 next(error);
 }
}

export async function createProductController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const data = createProductSchema.parse(req.body);

 // Cek keunikan SKU
 const existingSku = await prisma.product.findUnique({
 where: { sku: data.sku.toUpperCase() }
 });

 if (existingSku) {
 throw new AppError(`SKU '${data.sku.toUpperCase()}' sudah terdaftar dalam sistem`, 400, "DUPLICATE_SKU");
 }

 // Cek keberadaan Kategori & Supplier
 const [category, supplier] = await Promise.all([
 prisma.category.findUnique({ where: { id: data.categoryId } }),
 prisma.supplier.findUnique({ where: { id: data.supplierId } })
 ]);

 if (!category) {
 throw new AppError("Kategori tidak ditemukan", 400, "INVALID_CATEGORY");
 }

 if (!supplier) {
 throw new AppError("Supplier tidak ditemukan", 400, "INVALID_SUPPLIER");
 }

 const product = await prisma.product.create({
 data: {
 sku: data.sku.toUpperCase(),
 name: data.name,
 description: data.description,
 categoryId: data.categoryId,
 unit: data.unit,
 supplierId: data.supplierId,
 price: data.price,
 stock: data.stock,
 minStock: data.minStock,
 rackLocation: data.rackLocation,
 status: "ACTIVE"
 },
 include: {
 category: true,
 supplier: true
 }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "CREATE_PRODUCT",
 module: "PRODUCTS",
 recordId: product.id,
 details: { sku: product.sku, name: product.name, stock: product.stock }
 }
 });
 }

 return res.status(201).json({
 success: true,
 message: "Data barang baru berhasil dibuat",
 data: product
 });
 } catch (error) {
 next(error);
 }
}

export async function updateProductController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;
 const data = updateProductSchema.parse(req.body);

 const product = await prisma.product.findUnique({ where: { id } });
 if (!product) {
 throw new AppError("Data barang tidak ditemukan", 404, "NOT_FOUND");
 }

 // Jika SKU diubah, cek keunikan
 if (data.sku && data.sku.toUpperCase() !== product.sku) {
 const existingSku = await prisma.product.findUnique({
 where: { sku: data.sku.toUpperCase() }
 });
 if (existingSku) {
 throw new AppError(`SKU '${data.sku.toUpperCase()}' sudah terdaftar dalam sistem`, 400, "DUPLICATE_SKU");
 }
 data.sku = data.sku.toUpperCase();
 }

 const updated = await prisma.product.update({
 where: { id },
 data,
 include: {
 category: true,
 supplier: true
 }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "UPDATE_PRODUCT",
 module: "PRODUCTS",
 recordId: product.id,
 details: { sku: updated.sku, changes: data }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: "Data barang berhasil diperbarui",
 data: updated
 });
 } catch (error) {
 next(error);
 }
}

export async function toggleProductStatusController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const product = await prisma.product.findUnique({ where: { id } });
 if (!product) {
 throw new AppError("Data barang tidak ditemukan", 404, "NOT_FOUND");
 }

 const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

 const updated = await prisma.product.update({
 where: { id },
 data: { status: newStatus }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "TOGGLE_PRODUCT_STATUS",
 module: "PRODUCTS",
 recordId: product.id,
 details: { sku: product.sku, oldStatus: product.status, newStatus }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: `Status barang berhasil diubah menjadi ${newStatus}`,
 data: updated
 });
 } catch (error) {
 next(error);
 }
}
