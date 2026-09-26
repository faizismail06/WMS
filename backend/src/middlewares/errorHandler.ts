import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
 public statusCode: number;
 public errorCode: string;

 constructor(message: string, statusCode = 400, errorCode = "BAD_REQUEST") {
 super(message);
 this.statusCode = statusCode;
 this.errorCode = errorCode;
 Object.setPrototypeOf(this, new.target.prototype);
 }
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
 console.error("[ ] Global Error Handler Triggered:", err);

 if (err instanceof AppError) {
 return res.status(err.statusCode).json({
 success: false,
 message: err.message,
 error: { code: err.errorCode }
 });
 }

 if (err instanceof ZodError) {
 const formattedErrors = err.errors.map((e) => ({
 field: e.path.join("."),
 message: e.message
 }));

 return res.status(400).json({
 success: false,
 message: "Validasi input gagal.",
 error: {
 code: "VALIDATION_ERROR",
 details: formattedErrors
 }
 });
 }

 return res.status(500).json({
 success: false,
 message: "Terjadi kesalahan internal pada server.",
 error: {
 code: "INTERNAL_SERVER_ERROR",
 details: process.env.NODE_ENV === "development" ? err.message : undefined
 }
 });
}
