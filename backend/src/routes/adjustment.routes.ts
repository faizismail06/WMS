import { Router } from "express";
import {
 createAdjustmentController,
 getAdjustmentsController
} from "../controllers/adjustment.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getAdjustmentsController);
router.post("/", checkRole(["ADMIN_GUDANG"]), createAdjustmentController);

export default router;
