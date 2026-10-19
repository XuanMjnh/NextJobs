import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import jobRoutes from "./job.routes.js";
import candidateRoutes from "./candidate.routes.js";
import recruiterRoutes from "./recruiter.routes.js";

export const router = Router();

router.use(authRoutes);
router.use(userRoutes);
router.use(jobRoutes);
router.use(candidateRoutes);
router.use(recruiterRoutes);
