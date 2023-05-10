/* eslint-disable @typescript-eslint/no-explicit-any */
export class HttpError extends Error {
    constructor(
        public message: string,
        public status: number,
        public data: any = null
    ) {
        super(message); // Add a "message" property
    }
}
