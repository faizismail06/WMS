import { Request, Response, NextFunction } from "express";

const requestCounts: Record<string, { count: number; resetTime: number }> = {};

export function rateLimiter(maxRequests = 200, windowMs = 15 * 60 * 1000) {
 return (req: Request, res: Response, next: NextFunction) => {
 const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
 const now = Date.now();

 if (!requestCounts[ip] || now > requestCounts[ip].resetTime) {
 requestCounts[ip] = {
 count: 1,
 resetTime: now + windowMs
 };
 return next();
 }

 requestCounts[ip].count += 1;

 if (requestCounts[ip].count > maxRequests) {
 return res.status(429).json({
 success: false,
 message: "Terlalu banyak permintaan ke server. Silakan coba beberapa menit lagi.",
 error: { code: "TOO_MANY_REQUESTS" }
 });
 }

 next();
 };
}
