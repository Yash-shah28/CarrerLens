
import mongoose, { Schema } from "mongoose";

const jobDescriptionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        // Derived metadata (optional — nice to have for dashboard)
        title: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true   // gives createdAt, updatedAt
    }
);

export const JobDescription = mongoose.model("JobDescription", jobDescriptionSchema);
