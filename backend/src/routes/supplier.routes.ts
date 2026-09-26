import { Router } from "express";
import {
 getSuppliersController,
 createSupplierController,
 updateSupplierController
} from "../controllers/supplier.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getSuppliersController);
router.post("/", checkRole(["ADMIN_GUDANG"]), createSupplierController);
router.put("/:id", checkRole(["ADMIN_GUDANG"]), updateSupplierController);

export default router;
