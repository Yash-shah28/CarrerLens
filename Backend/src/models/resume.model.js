
import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        personalInfo: {
            name: { type: String, default: "" },
            title: { type: String, default: "" },
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            city: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            website: { type: String, default: "" },
            photo: { type: String, default: null }
        },
        summary: { type: String, default: "" },
        workExperience: [{
            id: { type: String },
            role: { type: String },
            company: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            responsibilities: [{ type: String }]
        }],
        education: [{
            id: { type: String },
            university: { type: String },
            degree: { type: String },
            graduationDate: { type: String }
        }],
        skills: {
            categories: [{
                name: { type: String },
                skills: [{ type: String }]
            }]
        },
        projects: [{
            id: { type: String },
            title: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            descriptions: [{ type: String }]
        }],
        certifications: [{
            id: { type: String },
            name: { type: String },
            institution: { type: String },
            date: { type: String }
        }],
        achievements: [{
            id: { type: String },
            name: { type: String },
            date: { type: String }
        }],
        references: [{
            id: { type: String },
            name: { type: String },
            contact: { type: String },
            relationship: { type: String }
        }],
        referencesHidden: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
)

export const Resume = mongoose.model("Resume", resumeSchema)
