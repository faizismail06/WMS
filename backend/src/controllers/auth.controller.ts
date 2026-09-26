import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { comparePassword } from "../utils/password";
import { signJwtToken } from "../utils/jwt";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const loginSchema = z.object({
 email: z.string().email("Format email tidak valid"),
 password: z.string().min(1, "Password wajib diisi")
});

export async function loginController(req: Request, res: Response, next: NextFunction) {
 try {
 const { email, password } = loginSchema.parse(req.body);

 const user = await prisma.user.findUnique({
 where: { email },
 include: { role: true }
 });

 if (!user) {
 throw new AppError("Email atau password tidak cocok", 401, "INVALID_CREDENTIALS");
 }

 if (user.status !== "ACTIVE") {
 throw new AppError("Akun Anda telah dinonaktifkan. Silakan hubungi Admin Sistem.", 403, "ACCOUNT_INACTIVE");
 }

 const isPasswordValid = await comparePassword(password, user.password);
 if (!isPasswordValid) {
 throw new AppError("Email atau password tidak cocok", 401, "INVALID_CREDENTIALS");
 }

 const token = signJwtToken({
 userId: user.id,
 email: user.email,
 fullName: user.fullName,
 role: user.role.name
 });

 // Catat audit log login
 await prisma.auditLog.create({
 data: {
 userId: user.id,
 action: "USER_LOGIN",
 module: "AUTH",
 ipAddress: req.ip || req.socket.remoteAddress || "127.0.0.1",
 details: { email: user.email, role: user.role.name }
 }
 });

 return res.status(200).json({
 success: true,
 message: "Login berhasil",
 data: {
 token,
 user: {
 id: user.id,
 email: user.email,
 fullName: user.fullName,
 role: user.role.name,
 status: user.status
 }
 }
 });
 } catch (error) {
 next(error);
 }
}

export async function getMeController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) {
 throw new AppError("User tidak ditemukan", 401, "UNAUTHORIZED");
 }

 const user = await prisma.user.findUnique({
 where: { id: req.user.userId },
 include: { role: true }
 });

 if (!user) {
 throw new AppError("Pengguna tidak terdaftar dalam database", 404, "USER_NOT_FOUND");
 }

 return res.status(200).json({
 success: true,
 message: "Profil pengguna berhasil didapatkan",
 data: {
 id: user.id,
 email: user.email,
 fullName: user.fullName,
 role: user.role.name,
 roleDescription: user.role.description,
 status: user.status,
 createdAt: user.createdAt
 }
 });
 } catch (error) {
 next(error);
 }
}
