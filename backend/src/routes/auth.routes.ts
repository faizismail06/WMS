import { Router } from "express";
import { loginController, getMeController } from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginController);
router.get("/me", authenticateJWT, getMeController);

export default router;
