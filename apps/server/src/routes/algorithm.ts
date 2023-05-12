import express from "express";

import { isAuth, validateRoles } from "../middlewares";
import algorithmController from "../controllers/algorithm";
import { UserRole } from "@ta/shared/utils";

const router = express.Router();

router.post(
    "/generateTimetable",
    // isAuth,
    // validateRoles([UserRole.Admin, UserRole.Coordinator]),
    algorithmController.generateTimetable
);

router.get(
    "/timetableData",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    algorithmController.getTimetableData
);

export default router;
