import { Schema, model } from "mongoose";

import { User } from "@ta/shared/models";
import { UserRole } from "@ta/shared/utils";

const userSchema = new Schema<User>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        roles: {
            type: [String],
            enum: Object.values(UserRole),
            required: true,
        },
    },
    { timestamps: true }
);

export default model<User>("User", userSchema);
