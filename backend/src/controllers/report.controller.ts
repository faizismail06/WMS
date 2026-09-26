import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export async function getStockReportController(req: Request, res: Response, next: NextFunction) {
 try {
 const { categoryId, status } = req.query;

 const where: any = {};
 if (categoryId) where.categoryId = String(categoryId);
 if (status) where.status = String(status);

 const products = await prisma.product.findMany({
 where,
 include: {
 category: { select: { name: true } },
 supplier: { select: { name: true } }
 },
 orderBy: { sku: "asc" }
 });

 const report = products.map((p) => ({
 id: p.id,
 sku: p.sku,
 name: p.name,
 category: p.category.name,
 supplier: p.supplier.name,
 unit: p.unit,
 price: Number(p.price),
 stock: p.stock,
 minStock: p.minStock,
 totalAssetValue: p.stock * Number(p.price),
 rackLocation: p.rackLocation,
 isLowStock: p.stock <= p.minStock,
 status: p.status
 }));

 return res.status(200).json({
 success: true,
 message: "Laporan posisi stok berhasil didapatkan",
 data: report
 });
 } catch (error) {
 next(error);
 }
}

export async function getMovementReportController(req: Request, res: Response, next: NextFunction) {
 try {
 const { startDate, endDate, type, categoryId } = req.query;

 const where: any = {};
 if (type && ["IN", "OUT"].includes(String(type))) {
 where.transaction = { type: String(type) };
 }

 if (startDate || endDate) {
 if (!where.transaction) where.transaction = {};
 where.transaction.date = {};
 if (startDate) where.transaction.date.gte = new Date(String(startDate));
 if (endDate) where.transaction.date.lte = new Date(String(endDate));
 }

 if (categoryId) {
 where.product = { categoryId: String(categoryId) };
 }

 const items = await prisma.stockTransactionItem.findMany({
 where,
 include: {
 transaction: {
 include: {
 supplier: { select: { name: true } },
 createdBy: { select: { fullName: true } }
 }
 },
 product: {
 include: {
 category: { select: { name: true } }
 }
 }
 },
 orderBy: { transaction: { date: "desc" } }
 });

 const report = items.map((item) => ({
 id: item.id,
 date: item.transaction.date,
 transactionNo: item.transaction.transactionNo,
 type: item.transaction.type,
 sku: item.product.sku,
 productName: item.product.name,
 category: item.product.category.name,
 quantity: item.quantity,
 unit: item.product.unit,
 stockBefore: item.stockBefore,
 stockAfter: item.stockAfter,
 sourceOrDestination:
 item.transaction.type === "IN"
 ? item.transaction.supplier?.name || "-"
 : item.transaction.destination || "-",
 createdBy: item.transaction.createdBy.fullName
 }));

 return res.status(200).json({
 success: true,
 message: "Laporan mutasi pergerakan persediaan berhasil didapatkan",
 data: report
 });
 } catch (error) {
 next(error);
 }
}
