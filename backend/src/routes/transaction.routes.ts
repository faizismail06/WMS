import { Router } from "express";
import {
 createStockInController,
 createStockOutController,
 getTransactionsController
} from "../controllers/transaction.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getTransactionsController);
router.post("/in", checkRole(["ADMIN_GUDANG"]), createStockInController);
router.post("/out", checkRole(["ADMIN_GUDANG"]), createStockOutController);

export default router;
