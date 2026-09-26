import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export async function getDashboardSummaryController(req: Request, res: Response, next: NextFunction) {
 try {
 const startOfMonth = new Date();
 startOfMonth.setDate(1);
 startOfMonth.setHours(0, 0, 0, 0);

 const [
 totalProducts,
 stockSum,
 totalSuppliers,
 activeLowStockProducts,
 monthlyStockInItems,
 monthlyStockOutItems
 ] = await Promise.all([
 prisma.product.count({ where: { status: "ACTIVE" } }),
 prisma.product.aggregate({
 _sum: { stock: true },
 where: { status: "ACTIVE" }
 }),
 prisma.supplier.count({ where: { status: "ACTIVE" } }),
 prisma.product.findMany({
 where: { status: "ACTIVE" }
 }),
 prisma.stockTransactionItem.aggregate({
 _sum: { quantity: true },
 where: {
 transaction: {
 type: "IN",
 date: { gte: startOfMonth }
 }
 }
 }),
 prisma.stockTransactionItem.aggregate({
 _sum: { quantity: true },
 where: {
 transaction: {
 type: "OUT",
 date: { gte: startOfMonth }
 }
 }
 })
 ]);

 const lowStockCount = activeLowStockProducts.filter((p) => p.stock <= p.minStock).length;

 return res.status(200).json({
 success: true,
 message: "Data ringkasan dashboard berhasil diambil",
 data: {
 totalProducts,
 totalStockUnits: stockSum._sum.stock || 0,
 monthlyStockInVolume: monthlyStockInItems._sum.quantity || 0,
 monthlyStockOutVolume: monthlyStockOutItems._sum.quantity || 0,
 lowStockCount,
 totalSuppliers
 }
 });
 } catch (error) {
 next(error);
 }
}

export async function getDashboardChartsController(req: Request, res: Response, next: NextFunction) {
 try {
 // 1. Category Distribution (Pie Chart)
 const categories = await prisma.category.findMany({
 where: { status: "ACTIVE" },
 include: {
 products: {
 select: { stock: true }
 }
 }
 });

 const categoryDistribution = categories.map((cat) => {
 const totalStock = cat.products.reduce((acc, p) => acc + p.stock, 0);
 return {
 name: cat.name,
 stock: totalStock
 };
 }).filter((c) => c.stock > 0);

 // 2. Top Low Stock (Horizontal Bar)
 const allProducts = await prisma.product.findMany({
 where: { status: "ACTIVE" },
 select: { id: true, sku: true, name: true, stock: true, minStock: true, unit: true },
 orderBy: { stock: "asc" },
 take: 5
 });

 // 3. Last 30 Days Trend (Line / Area Chart)
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 const recentTransactions = await prisma.stockTransaction.findMany({
 where: { date: { gte: thirtyDaysAgo } },
 include: { items: { select: { quantity: true } } }
 });

 // Group transactions by date (YYYY-MM-DD)
 const dateMap: Record<string, { date: string; stockIn: number; stockOut: number }> = {};
 for (let i = 29; i >= 0; i--) {
 const d = new Date();
 d.setDate(d.getDate() - i);
 const dateKey = d.toISOString().slice(0, 10);
 dateMap[dateKey] = { date: dateKey, stockIn: 0, stockOut: 0 };
 }

 recentTransactions.forEach((trx) => {
 const dateKey = trx.date.toISOString().slice(0, 10);
 if (dateMap[dateKey]) {
 const totalQty = trx.items.reduce((acc, item) => acc + item.quantity, 0);
 if (trx.type === "IN") dateMap[dateKey].stockIn += totalQty;
 if (trx.type === "OUT") dateMap[dateKey].stockOut += totalQty;
 }
 });

 const monthlyTrend = Object.values(dateMap);

 // 4. Fast Moving Products (Top 5 Stock Out Items)
 const outItems = await prisma.stockTransactionItem.groupBy({
 by: ["productId"],
 _sum: { quantity: true },
 where: { transaction: { type: "OUT" } },
 orderBy: { _sum: { quantity: "desc" } },
 take: 5
 });

 const fastMovingProducts = await Promise.all(
 outItems.map(async (item) => {
 const p = await prisma.product.findUnique({
 where: { id: item.productId },
 select: { sku: true, name: true, unit: true }
 });
 return {
 sku: p?.sku || "",
 name: p?.name || "Produk",
 quantityOut: item._sum.quantity || 0,
 unit: p?.unit || "unit"
 };
 })
 );

 return res.status(200).json({
 success: true,
 message: "Data grafik dashboard berhasil diambil",
 data: {
 categoryDistribution,
 topLowStock: allProducts,
 monthlyTrend,
 fastMovingProducts
 }
 });
 } catch (error) {
 next(error);
 }
}
