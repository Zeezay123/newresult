import express from 'express';
import { 
    getResults,  
    viewResults, 
    downloadResults, 
    approveResults,
    getPreviousCumulativeResults,
    getCurrentSemesterCourses,
    getSemesterSummary,
    getPreviousSemesterCarryovers,
    approveLevelResults,
    rejectLevelResults,
    downloadLevelResults
} from '../../Controllers/advisor/result.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';

const router = express.Router();

// Get all individual student results in advisor's level
router.get('/results', VerifyUser, getResults);

// Get results for a specific course
router.post('/viewresults', VerifyUser, viewResults); 

// Approve or reject results
router.post('/approve-results', VerifyUser, approveResults);

// Download results for a specific course
router.get('/download-results', VerifyUser, downloadResults);

// ============== NEW SIMPLIFIED ENDPOINTS ==============

// Get previous cumulative results (up to but not including current semester)
router.get('/previous-cumulative', VerifyUser, getPreviousCumulativeResults);

// Get current semester courses with grades
router.get('/current-courses', VerifyUser, getCurrentSemesterCourses);

// Get semester summary (current + cumulative stats)
router.get('/semester-summary', VerifyUser, getSemesterSummary);

// Get failed core courses from previous semester
router.get('/carryovers', VerifyUser, getPreviousSemesterCarryovers);

// Approve all level results
router.post('/approve-level', VerifyUser, approveLevelResults);

// Reject all level results
router.post('/reject-level', VerifyUser, rejectLevelResults);

// Download all level results
router.get('/download-level', VerifyUser, downloadLevelResults);

export default router;