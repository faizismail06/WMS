import { Router } from "express";
import {
 getUsersController,
 createUserController,
 toggleUserStatusController
} from "../controllers/user.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(checkRole(["ADMIN_SISTEM"])); // Khusus Admin Sistem

router.get("/", getUsersController);
router.post("/", createUserController);
router.patch("/:id/status", toggleUserStatusController);

export default router;
