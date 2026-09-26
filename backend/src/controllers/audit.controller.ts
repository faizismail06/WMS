import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export async function getAuditLogsController(req: Request, res: Response, next: NextFunction) {
 try {
 const { q, module: moduleFilter, page = 1, limit = 15 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};
 if (moduleFilter) where.module = String(moduleFilter);
 if (q) {
 where.OR = [
 { action: { contains: String(q), mode: "insensitive" } },
 { module: { contains: String(q), mode: "insensitive" } },
 { user: { email: { contains: String(q), mode: "insensitive" } } },
 { user: { fullName: { contains: String(q), mode: "insensitive" } } }
 ];
 }

 const [logs, totalRecords] = await Promise.all([
 prisma.auditLog.findMany({
 where,
 skip,
 take: limitNum,
 include: {
 user: {
 select: { id: true, email: true, fullName: true, role: { select: { name: true } } }
 }
 },
 orderBy: { createdAt: "desc" }
 }),
 prisma.auditLog.count({ where })
 ]);

 const formatted = logs.map((log) => ({
 id: log.id,
 action: log.action,
 module: log.module,
 recordId: log.recordId,
 details: log.details,
 ipAddress: log.ipAddress || "127.0.0.1",
 createdAt: log.createdAt,
 user: log.user
 ? {
 id: log.user.id,
 email: log.user.email,
 fullName: log.user.fullName,
 role: log.user.role.name
 }
 : null
 }));

 return res.status(200).json({
 success: true,
 message: "Audit logs berhasil diambil",
 data: formatted,
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
