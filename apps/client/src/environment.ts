export const environment = {
    production: process.env.NODE_ENV === "production",
    googleClientId: process.env.NX_GOOGLE_CLIENT_ID,
    backendURI: process.env.NX_BACKEND_URI,
};
