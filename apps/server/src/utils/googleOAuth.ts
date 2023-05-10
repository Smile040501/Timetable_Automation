/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { OAuth2Client } from "google-auth-library";

import { environment as env } from "../environment";

const client = new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    /**
     * To get access_token and refresh_token in server side,
     * the data for redirect_uri should be postmessage.
     * postmessage is magic value for redirect_uri to get credentials without actual redirect uri.
     */
    "postmessage"
);

export const getProfileInfo = async (jwtToken: string) => {
    // Call the verifyIdToken to
    // verify and decode it
    const ticket = await client.verifyIdToken({
        idToken: jwtToken,
        audience: env.googleClientId!,
    });

    // Get the JSON with all the user info
    const payload = ticket.getPayload();

    // This is a JSON object that contains
    // all the user info
    return payload;
};
