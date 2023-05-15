export const environment = {
    production: process.env.NODE_ENV === "production",
    mongoURI: process.env.NX_MONGO_URI,
    googleClientId: process.env.NX_GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.NX_GOOGLE_CLIENT_SECRET,
    jwtSecretKey: process.env.NX_JWT_SECRET_KEY,
    jwtAccessTokenExpiration: process.env.NX_JWT_ACCESS_TOKEN_EXP,
    maxRequests: process.env.NX_MAX_REQUESTS,
    windowMins: process.env.NX_WINDOW_MIN,
    testerEmails: process.env.NX_TESTER_EMAILS,
    allowedEmailDomains: process.env.NX_ALLOWED_EMAIL_DOMAINS,
    redisAlgorithmStatusKey: process.env.NX_REDIS_ALGO_STATUS_KEY,
    redisQueueHost: process.env.NX_REDIS_QUEUE_HOST || "localhost",
    redisQueuePort: process.env.NX_REDIS_QUEUE_PORT
        ? +process.env.NX_REDIS_QUEUE_PORT
        : 6379,
};
