import express from "express";

import { UserRole } from "@ta/shared/utils";

import courseController from "../controllers/course";
import { validateRoles, isAuth } from "../middlewares";

const router = express.Router();

router.get(
    "/get",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    courseController.getCourses
);

router.post(
    "/upload",
    isAuth,
    validateRoles([UserRole.Admin, UserRole.Coordinator]),
    courseController.uploadCourses
);

export default router;
