import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import supplierRoutes from "./routes/supplier.routes";
import productRoutes from "./routes/product.routes";
import transactionRoutes from "./routes/transaction.routes";
import adjustmentRoutes from "./routes/adjustment.routes";
import opnameRoutes from "./routes/opname.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import userRoutes from "./routes/user.routes";
import auditRoutes from "./routes/audit.routes";
import notificationRoutes from "./routes/notification.routes";

import { globalErrorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5176";

// Middlewares Security & Body Parser
app.use(helmet());
app.use(
 cors({
 origin: CORS_ORIGIN,
 credentials: true
 })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Rate Limiter pada seluruh /api routes
app.use("/api", rateLimiter(300, 15 * 60 * 1000));

// Health Check Endpoint
app.get("/health", (req, res) => {
 res.status(200).json({
 status: "HEALTHY",
 service: "WMS Enterprise Backend REST API",
 timestamp: new Date().toISOString()
 });
});

// API Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock-transactions", transactionRoutes);
app.use("/api/stock-adjustments", adjustmentRoutes);
app.use("/api/stock-opnames", opnameRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/notifications", notificationRoutes);

// Fallback 404 Handler
app.use((req, res) => {
 res.status(404).json({
 success: false,
 message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
 error: { code: "NOT_FOUND" }
 });
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== "test") {
 app.listen(PORT, () => {
 console.log(`WMS Backend Server running on http://localhost:${PORT}`);
 console.log(`Allowed CORS Origin: ${CORS_ORIGIN}`);
 });
}

export default app;
