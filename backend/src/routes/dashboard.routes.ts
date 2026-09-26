import { Router } from "express";
import {
 getDashboardSummaryController,
 getDashboardChartsController
} from "../controllers/dashboard.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/summary", getDashboardSummaryController);
router.get("/charts", getDashboardChartsController);

export default router;
