
import { Router } from "express";
import {
    createResume,
    getResumes,
    getResumeById,
    updateResume,
    deleteResume
} from "../controllers/resume.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createResume)
    .get(getResumes);

router.route("/:id")
    .get(getResumeById)
    .patch(updateResume)
    .delete(deleteResume);

export default router;
