import mongoose from "mongoose";

import { environment as env } from "../environment";

const connectDB = async () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return await mongoose.connect(env.mongoURI!);
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
