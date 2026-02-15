
import { Resume } from "../models/resume.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createResume = asyncHandler(async (req, res) => {
    // Check if resume already exists for user? Maybe allow multiples?
    // For now let's allow multiples.
    const { personalInfo, summary, workExperience, education, skills, projects, certifications, achievements, references, referencesHidden } = req.body;

    if (!personalInfo || !personalInfo.name) {
        throw new ApiError(400, "Name is required in personal info");
    }

    const resume = await Resume.create({
        user: req.user._id,
        personalInfo,
        summary,
        workExperience,
        education,
        skills,
        projects,
        certifications,
        achievements,
        references,
        referencesHidden
    });

    return res.status(201).json(
        new ApiResponse(201, resume, "Resume created successfully")
    );
});

const getResumes = asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id });
    return res.status(200).json(
        new ApiResponse(200, resumes, "Resumes fetched successfully")
    );
});

const getResumeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    // Authorization check
    if (resume.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this resume");
    }

    return res.status(200).json(
        new ApiResponse(200, resume, "Resume fetched successfully")
    );
});

const updateResume = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const resume = await Resume.findById(id);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    if (resume.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this resume");
    }

    const updatedResume = await Resume.findByIdAndUpdate(
        id,
        {
            $set: updateData
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedResume, "Resume updated successfully")
    );
});

const deleteResume = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    if (resume.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this resume");
    }

    await Resume.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Resume deleted successfully")
    );
});

export {
    createResume,
    getResumes,
    getResumeById,
    updateResume,
    deleteResume
};
