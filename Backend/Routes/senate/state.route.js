import express from "express";
import { VerifyUser } from "../../utils/VerifyUser.js";
import { getApprovedResults, getPendingResults, getStudentStats } from "../../Controllers/senate/stat.controller.js";

const router = express.Router();

// Senate Statistics Routes
router.get('/pendingResults', VerifyUser, getPendingResults);
router.get('/approvedResults', VerifyUser, getApprovedResults);
router.get('/studentStats', VerifyUser, getStudentStats);

export default router;