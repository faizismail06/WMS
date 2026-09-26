import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { hashPassword } from "../utils/password";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { RoleName } from "@prisma/client";

const createUserSchema = z.object({
 email: z.string().email("Format email tidak valid"),
 password: z.string().min(6, "Password minimal 6 karakter"),
 fullName: z.string().min(2, "Nama lengkap wajib diisi"),
 roleName: z.enum(["ADMIN_GUDANG", "SUPERVISOR", "ADMIN_SISTEM"], {
 errorMap: () => ({ message: "Role tidak valid" })
 })
});

export async function getUsersController(req: Request, res: Response, next: NextFunction) {
 try {
 const { q, role, status, page = 1, limit = 10 } = req.query;

 const pageNum = Math.max(1, Number(page));
 const limitNum = Math.max(1, Number(limit));
 const skip = (pageNum - 1) * limitNum;

 const where: any = {};
 if (status) where.status = String(status);
 if (role) where.role = { name: String(role) };
 if (q) {
 where.OR = [
 { email: { contains: String(q), mode: "insensitive" } },
 { fullName: { contains: String(q), mode: "insensitive" } }
 ];
 }

 const [users, totalRecords] = await Promise.all([
 prisma.user.findMany({
 where,
 skip,
 take: limitNum,
 select: {
 id: true,
 email: true,
 fullName: true,
 status: true,
 createdAt: true,
 role: { select: { id: true, name: true, description: true } }
 },
 orderBy: { createdAt: "desc" }
 }),
 prisma.user.count({ where })
 ]);

 const formatted = users.map((u) => ({
 id: u.id,
 email: u.email,
 fullName: u.fullName,
 role: u.role.name,
 roleDescription: u.role.description,
 status: u.status,
 createdAt: u.createdAt
 }));

 return res.status(200).json({
 success: true,
 message: "Data pengguna berhasil diambil",
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

export async function createUserController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const data = createUserSchema.parse(req.body);

 const existingUser = await prisma.user.findUnique({
 where: { email: data.email }
 });

 if (existingUser) {
 throw new AppError(`Email '${data.email}' sudah terdaftar dalam sistem`, 400, "DUPLICATE_EMAIL");
 }

 const role = await prisma.role.findUnique({
 where: { name: data.roleName as RoleName }
 });

 if (!role) throw new AppError("Role tidak ditemukan", 400, "INVALID_ROLE");

 const hashedPassword = await hashPassword(data.password);

 const newUser = await prisma.user.create({
 data: {
 email: data.email,
 password: hashedPassword,
 fullName: data.fullName,
 roleId: role.id,
 status: "ACTIVE"
 },
 select: {
 id: true,
 email: true,
 fullName: true,
 status: true,
 role: { select: { name: true } }
 }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "CREATE_USER_ACCOUNT",
 module: "USERS",
 recordId: newUser.id,
 details: { email: newUser.email, role: newUser.role.name }
 }
 });
 }

 return res.status(201).json({
 success: true,
 message: "Akun pengguna baru berhasil dibuat",
 data: {
 id: newUser.id,
 email: newUser.email,
 fullName: newUser.fullName,
 role: newUser.role.name,
 status: newUser.status
 }
 });
 } catch (error) {
 next(error);
 }
}

export async function toggleUserStatusController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 const user = await prisma.user.findUnique({ where: { id } });
 if (!user) throw new AppError("Pengguna tidak ditemukan", 404, "NOT_FOUND");

 const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

 const updated = await prisma.user.update({
 where: { id },
 data: { status: newStatus },
 select: { id: true, email: true, fullName: true, status: true }
 });

 if (req.user) {
 await prisma.auditLog.create({
 data: {
 userId: req.user.userId,
 action: "TOGGLE_USER_STATUS",
 module: "USERS",
 recordId: id,
 details: { email: user.email, oldStatus: user.status, newStatus }
 }
 });
 }

 return res.status(200).json({
 success: true,
 message: `Status akun '${user.email}' diubah menjadi ${newStatus}`,
 data: updated
 });
 } catch (error) {
 next(error);
 }
}
