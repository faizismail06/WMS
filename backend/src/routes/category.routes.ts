import { Router } from "express";
import {
 getCategoriesController,
 createCategoryController,
 updateCategoryController,
 deleteCategoryController
} from "../controllers/category.controller";
import { authenticateJWT, checkRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", getCategoriesController);
router.post("/", checkRole(["ADMIN_GUDANG"]), createCategoryController);
router.put("/:id", checkRole(["ADMIN_GUDANG"]), updateCategoryController);
router.delete("/:id", checkRole(["ADMIN_GUDANG"]), deleteCategoryController);

export default router;
