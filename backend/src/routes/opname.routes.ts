import { Router } from "express";
import {
 createOpnameController,
 getOpnamesController,
 getOpnameByIdController,
 updateOpnameCountsController,
 submitOpnameController,
 verifyOpnameController
} from "../controllers/opname.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getOpnamesController);
router.get("/:id", getOpnameByIdController);

router.post("/", checkRole(["ADMIN_GUDANG"]), createOpnameController);
router.put("/:id/counts", checkRole(["ADMIN_GUDANG"]), updateOpnameCountsController);
router.post("/:id/submit", checkRole(["ADMIN_GUDANG"]), submitOpnameController);

router.post("/:id/verify", checkRole(["SUPERVISOR"]), verifyOpnameController);

export default router;
