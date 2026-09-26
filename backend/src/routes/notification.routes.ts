import { Router } from "express";
import {
 getNotificationsController,
 markNotificationAsReadController
} from "../controllers/notification.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getNotificationsController);
router.patch("/:id/read", markNotificationAsReadController);

export default router;
