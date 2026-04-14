import { InterviewResult } from "../models/interviewResult.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Save interview result with AI-generated recommendations
 */
const saveInterviewResult = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        candidateName,
        jobTitle,
        resumeId,
        jobDescriptionText,
        interviewDuration,
        transcript,
        performanceMetrics
    } = req.body;

    if (!candidateName || !performanceMetrics) {
        throw new ApiError(400, "candidateName and performanceMetrics are required");
    }

    // Generate AI recommendations based on transcript and metrics
    let learningRecommendations = [];
    if (transcript && transcript.length > 0) {
        learningRecommendations = await generateLearningRecommendations(
            transcript,
            performanceMetrics,
            jobDescriptionText
        );
    }

    const interviewResult = await InterviewResult.create({
        userId,
        candidateName,
        jobTitle: jobTitle || "Not Specified",
        resumeId,
        jobDescriptionText,
        interviewDuration,
        performanceScore: performanceMetrics.overallScore || 0,
        technicalSkills: performanceMetrics.technicalSkills,
        communication: performanceMetrics.communication,
        problemSolving: performanceMetrics.problemSolving,
        experience: performanceMetrics.experience,
        cultureFit: performanceMetrics.cultureFit,
        summary: performanceMetrics.summary,
        learningRecommendations,
        transcript,
        status: performanceMetrics.status || "completed",
        endReason: performanceMetrics.endReason
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            interviewResult,
            "Interview result saved successfully"
        )
    );
});

/**
 * Fetch interview results for a user with pagination
 */
const getUserInterviewResults = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const results = await InterviewResult.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await InterviewResult.countDocuments({ userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                results,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            },
            "Interview results fetched successfully"
        )
    );
});

/**
 * Get a specific interview result
 */
const getInterviewResultById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await InterviewResult.findOne({
        _id: id,
        userId
    });

    if (!result) {
        throw new ApiError(404, "Interview result not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Interview result fetched successfully")
    );
});

/**
 * Delete an interview result
 */
const deleteInterviewResult = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await InterviewResult.findOneAndDelete({
        _id: id,
        userId
    });

    if (!result) {
        throw new ApiError(404, "Interview result not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Interview result deleted successfully")
    );
});

/**
 * Generate learning recommendations using Gemini AI
 */
async function generateLearningRecommendations(transcript, metrics, jobDescription) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API key not available for recommendations");
            return [];
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Extract key weaknesses from transcript
        const conversationSummary = transcript
            .slice(-20) // Last 20 messages for context
            .map(m => `${m.speaker}: ${m.message}`)
            .join("\n");

        const prompt = `Based on this interview performance and conversation, provide specific learning recommendations:

Job Description: ${jobDescription || "Not provided"}

Performance Metrics:
- Technical Skills: ${metrics.technicalSkills?.score || 0}/100
- Communication: ${metrics.communication?.score || 0}/100
- Problem Solving: ${metrics.problemSolving?.score || 0}/100
- Experience: ${metrics.experience?.score || 0}/100

Weak Areas: ${metrics.technicalSkills?.weaknesses?.join(", ") || "Not specified"}

Recent Conversation Context:
${conversationSummary}

Provide a JSON array of 3-5 learning recommendations with this exact format:
[
  {
    "topic": "Specific Topic Name",
    "priority": "HIGH|MEDIUM|LOW",
    "description": "What and why to learn",
    "estimatedTimeWeeks": 2
  }
]

IMPORTANT: Return ONLY the JSON array, no other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const recommendations = JSON.parse(text);
        return Array.isArray(recommendations) ? recommendations : [];
    } catch (error) {
        console.error("Error generating learning recommendations:", error);
        return [];
    }
}

export {
    saveInterviewResult,
    getUserInterviewResults,
    getInterviewResultById,
    deleteInterviewResult
};
