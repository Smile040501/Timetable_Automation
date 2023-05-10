/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import { body } from "express-validator";

import { UserRole } from "@ta/shared/utils";

import adminController from "../controllers/admin";
import { hasValidationError, validateRoles, isAuth } from "../middlewares";
import { UserModel } from "../models";

const router = express.Router();

router.post(
    "/createUser",
    isAuth,
    validateRoles([UserRole.Admin]),
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email.")
            .custom((value, _) => {
                return UserModel.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject("E-Mail address already exists");
                    }
                    return true;
                });
            })
            .normalizeEmail(),
        body("name").trim().not().isEmpty(),
        body("roles").isArray({ min: 1 }),
    ],
    hasValidationError,
    adminController.createUser
);

router.post(
    "/deleteUser",
    isAuth,
    validateRoles([UserRole.Admin]),
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email.")
            .custom((value, _) => {
                return UserModel.findOne({ email: value }).then((userDoc) => {
                    if (!userDoc) {
                        return Promise.reject("E-Mail address doesn't exist");
                    }
                    return true;
                });
            })
            .normalizeEmail(),
    ],
    hasValidationError,
    adminController.deleteUser
);

export default router;
