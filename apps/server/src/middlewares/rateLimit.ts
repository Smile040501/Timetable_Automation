/* eslint-disable @typescript-eslint/no-non-null-assertion */
import rateLimit from "express-rate-limit";

import { httpStatusNames, httpStatusTypes } from "@ta/shared/utils";

import { environment as env } from "../environment";

const rateLimitHandler = rateLimit({
    max: +env.maxRequests!, // limit each IP for requests per windowMs
    windowMs: +env.windowMins! * 60 * 1000,
    message: httpStatusTypes[httpStatusNames.TOO_MANY_REQUESTS].message, // Error message sent to user when max is exceeded
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default rateLimitHandler;
