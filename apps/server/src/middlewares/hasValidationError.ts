import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import { HttpError, httpStatusTypes, httpStatusNames } from "@ta/shared/utils";

const hasValidationError: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const ue = httpStatusTypes[httpStatusNames.UNPROCESSABLE_ENTITY];
        const error = new HttpError(ue.message, ue.status, errors);
        return next(error);
    }
    next();
};

export default hasValidationError;
