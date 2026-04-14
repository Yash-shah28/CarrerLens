import { Router } from "express";
import {
    saveInterviewResult,
    getUserInterviewResults,
    getInterviewResultById,
    deleteInterviewResult
} from "../controllers/interviewResult.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Save interview result
router.route("/save").post(saveInterviewResult);

// Get all interview results for user
router.route("/").get(getUserInterviewResults);

// Get specific interview result
router.route("/:id").get(getInterviewResultById);

// Delete interview result
router.route("/:id").delete(deleteInterviewResult);

export default router;
