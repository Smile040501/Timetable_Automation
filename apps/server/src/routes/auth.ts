/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import { body } from "express-validator";

import authController from "../controllers/auth";
import { UserModel } from "../models";

const router = express.Router();

/* Only for creating test admins */
// router.post(
//     "/createAdmin",
//     [
//         body("email")
//             .isEmail()
//             .withMessage("Please enter a valid email.")
//             .custom((value, _) => {
//                 return UserModel.findOne({ email: value }).then((userDoc) => {
//                     if (userDoc) {
//                         return Promise.reject("E-Mail address already exists");
//                     }
//                     return true;
//                 });
//             })
//             .normalizeEmail(),
//         body("name").trim().not().isEmpty(),
//     ],
//     authController.createAdmin
// );

router.post("/signIn", authController.signIn);

export default router;
