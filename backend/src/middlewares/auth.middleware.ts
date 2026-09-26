import { Request, Response, NextFunction } from "express";
import { verifyJwtToken, TokenPayload } from "../utils/jwt";
import { RoleName } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
 user?: TokenPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith("Bearer ")) {
 return res.status(401).json({
 success: false,
 message: "Sesi Anda tidak valid atau token autentikasi tidak ditemukan.",
 error: { code: "UNAUTHORIZED" }
 });
 }

 const token = authHeader.split(" ")[1];

 try {
 const decoded = verifyJwtToken(token);
 req.user = decoded;
 next();
 } catch (error) {
 return res.status(401).json({
 success: false,
 message: "Sesi Anda telah berakhir. Silakan login kembali.",
 error: { code: "TOKEN_EXPIRED_OR_INVALID" }
 });
 }
}

export function checkRole(allowedRoles: RoleName[]) {
 return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
 if (!req.user) {
 return res.status(401).json({
 success: false,
 message: "Pengguna belum terautentikasi.",
 error: { code: "UNAUTHORIZED" }
 });
 }

 if (!allowedRoles.includes(req.user.role)) {
 return res.status(403).json({
 success: false,
 message: "Anda tidak memiliki hak akses untuk fitur ini.",
 error: {
 code: "FORBIDDEN",
 details: `Role '${req.user.role}' tidak diizinkan. Perlu role: ${allowedRoles.join(", ")}.`
 }
 });
 }

 next();
 };
}
