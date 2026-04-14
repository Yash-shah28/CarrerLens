
import { JobDescription } from "../models/jobdescription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// POST /api/v1/job-descriptions  — Save (or upsert) the user's latest JD
const saveJobDescription = asyncHandler(async (req, res) => {
    const { text, title } = req.body;

    if (!text || !text.trim()) {
        throw new ApiError(400, "Job description text is required");
    }

    // Upsert: each user stores only one "latest" JD.
    // If you want to allow multiple JDs, remove the findOneAndUpdate and use .create() instead.
    const jd = await JobDescription.findOneAndUpdate(
        { user: req.user._id },
        {
            user: req.user._id,
            text: text.trim(),
            title: title?.trim() || ""
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(
        new ApiResponse(200, jd, "Job description saved successfully")
    );
});

// GET /api/v1/job-descriptions/latest  — Get the user's most recently saved JD
const getLatestJobDescription = asyncHandler(async (req, res) => {
    const jd = await JobDescription.findOne({ user: req.user._id })
        .sort({ updatedAt: -1 });

    if (!jd) {
        // Not an error — just nothing saved yet
        return res.status(200).json(
            new ApiResponse(200, null, "No job description found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, jd, "Job description fetched successfully")
    );
});

export { saveJobDescription, getLatestJobDescription };
