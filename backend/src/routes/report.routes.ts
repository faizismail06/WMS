import { Router } from "express";
import {
 getStockReportController,
 getMovementReportController
} from "../controllers/report.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/stock", getStockReportController);
router.get("/movements", getMovementReportController);

export default router;
