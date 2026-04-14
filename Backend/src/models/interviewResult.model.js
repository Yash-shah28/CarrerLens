import mongoose, { Schema } from "mongoose";

const interviewResultSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        candidateName: {
            type: String,
            required: true
        },
        jobTitle: {
            type: String,
            required: false
        },
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: "Resume",
            required: false
        },
        jobDescriptionText: {
            type: String,
            required: false
        },
        interviewDuration: {
            type: Number, // in seconds
            required: false
        },
        // Performance Metrics
        performanceScore: {
            type: Number, // 0-100
            required: true,
            min: 0,
            max: 100
        },
        technicalSkills: {
            score: { type: Number, min: 0, max: 100 },
            feedback: String,
            strengths: [String],
            weaknesses: [String]
        },
        communication: {
            score: { type: Number, min: 0, max: 100 },
            feedback: String
        },
        problemSolving: {
            score: { type: Number, min: 0, max: 100 },
            feedback: String
        },
        experience: {
            score: { type: Number, min: 0, max: 100 },
            feedback: String
        },
        cultureFit: {
            score: { type: Number, min: 0, max: 100 },
            feedback: String
        },
        // Overall Summary
        summary: {
            overallFeedback: String,
            keyStrengths: [String],
            areasForImprovement: [String],
            recommendation: {
                type: String,
                enum: ["STRONG_HIRE", "HIRE", "MAYBE", "NO_HIRE"],
                required: true
            },
            recommendationReason: String
        },
        // Learning Recommendations
        learningRecommendations: [
            {
                topic: String,
                priority: {
                    type: String,
                    enum: ["HIGH", "MEDIUM", "LOW"]
                },
                description: String,
                estimatedTimeWeeks: Number
            }
        ],
        // Raw Interview Transcript (optional - stores conversation)
        transcript: [
            {
                speaker: { type: String, enum: ["interviewer", "candidate"] },
                timestamp: Date,
                message: String
            }
        ],
        // Interview metadata
        interviewType: {
            type: String,
            enum: ["technical", "behavioral", "mixed"],
            default: "mixed"
        },
        status: {
            type: String,
            enum: ["completed", "ended_early", "canceled"],
            default: "completed"
        },
        endReason: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Create index for user and date queries
interviewResultSchema.index({ userId: 1, createdAt: -1 });

export const InterviewResult = mongoose.model("InterviewResult", interviewResultSchema);
