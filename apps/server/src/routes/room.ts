import express from "express";

import { UserRole } from "@ta/shared/utils";

import roomController from "../controllers/room";
import { validateRoles, isAuth } from "../middlewares";

const router = express.Router();

router.get(
    "/get",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    roomController.getRooms
);

router.post(
    "/upload",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    roomController.uploadRooms
);

export default router;
