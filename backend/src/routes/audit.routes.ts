import { Router } from "express";
import { getAuditLogsController } from "../controllers/audit.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(checkRole(["SUPERVISOR", "ADMIN_SISTEM"]));

router.get("/", getAuditLogsController);

export default router;
