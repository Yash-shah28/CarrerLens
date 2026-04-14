
import { Router } from "express";
import { saveJobDescription, getLatestJobDescription } from "../controllers/jobdescription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(saveJobDescription);

router.route("/latest")
    .get(getLatestJobDescription);

export default router;
