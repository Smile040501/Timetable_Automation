import express from "express";

import { UserRole } from "@ta/shared/utils";

import slotController from "../controllers/slot";
import { validateRoles, isAuth } from "../middlewares";

const router = express.Router();

router.get(
    "/get",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    slotController.getSlots
);

router.post(
    "/upload",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    slotController.uploadSlots
);

export default router;
