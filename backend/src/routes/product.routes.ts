import { Router } from "express";
import {
 getProductsController,
 getProductByIdController,
 createProductController,
 updateProductController,
 toggleProductStatusController
} from "../controllers/product.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getProductsController);
router.get("/:id", getProductByIdController);
router.post("/", checkRole(["ADMIN_GUDANG"]), createProductController);
router.put("/:id", checkRole(["ADMIN_GUDANG"]), updateProductController);
router.patch("/:id/status", checkRole(["ADMIN_GUDANG"]), toggleProductStatusController);

export default router;
