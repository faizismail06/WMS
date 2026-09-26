import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getNotificationsController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

 const notifications = await prisma.notification.findMany({
 where: {
 OR: [{ userId: req.user.userId }, { userId: null }]
 },
 orderBy: { createdAt: "desc" },
 take: 15
 });

 const unreadCount = notifications.filter((n) => !n.isRead).length;

 return res.status(200).json({
 success: true,
 message: "Notifikasi berhasil diambil",
 data: {
 notifications,
 unreadCount
 }
 });
 } catch (error) {
 next(error);
 }
}

export async function markNotificationAsReadController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
 try {
 const { id } = req.params;

 if (id === "all") {
 if (req.user) {
 await prisma.notification.updateMany({
 where: { OR: [{ userId: req.user.userId }, { userId: null }] },
 data: { isRead: true }
 });
 }
 } else {
 await prisma.notification.update({
 where: { id },
 data: { isRead: true }
 });
 }

 return res.status(200).json({
 success: true,
 message: "Notifikasi telah ditandai sebagai dibaca"
 });
 } catch (error) {
 next(error);
 }
}
