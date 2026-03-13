import { Router } from "express";
import { generateRoadmap } from "../controllers/roadmap.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT);

router.route("/generate").post(generateRoadmap);

export default router;
