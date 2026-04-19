import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { 
  downloadTestResults, 
  downloadExamResults,
  getExamResults,
  getALLExamResults,
  getTestResults, 
  viewTestResultDetails,
  viewExamResultDetails,
  approveOrRejectExamResults,
  getResultStats,

} from '../../Controllers/hod/results.controller.js';
import { 
  getLevelResults, 
  getAvailableProgrammesAndLevels,
  downloadLevelResults,
  approveLevelResults,
  rejectLevelResults,
   getPreviousCumulativeResults,
    getCurrentSemesterCourses,
    getSemesterSummary,
    getPreviousSemesterCarryovers
} from '../../Controllers/hod/levelresult.controller.js';

const router = express.Router();

//result stat
router.get('/resultstats', VerifyUser, getResultStats)
// Test Results Routes
router.get('/testResults/:id', VerifyUser, getTestResults);
router.post('/viewTestResults/:id', VerifyUser, viewTestResultDetails);
router.get('/downloadTestResults/:id', VerifyUser, downloadTestResults);


// Exam Results Routes
router.get('/examResults/:id', VerifyUser, getExamResults);
router.get('/allExamResults/', VerifyUser, getALLExamResults);
router.post('/viewExamResults/:id', VerifyUser, viewExamResultDetails);
router.get('/downloadExamResults/:id', VerifyUser, downloadExamResults);

//Result Approval and Rejection 
router.put('/approveOrReject/:id', VerifyUser, approveOrRejectExamResults)

// Level Results Routes (for viewing approved results by programme and level)
router.get('/programmes-levels/', VerifyUser, getAvailableProgrammesAndLevels);
// router.get('/levelResults/:id', VerifyUser, getLevelResults);
router.get('/downloadLevelResults/:id', VerifyUser, downloadLevelResults);
router.put('/approveLevelResults/:id', VerifyUser, approveLevelResults);
router.put('/rejectLevelResults/:id', VerifyUser, rejectLevelResults);
router.post('/previous-cumulative', VerifyUser, getPreviousCumulativeResults);
router.post('/current-courses', VerifyUser, getCurrentSemesterCourses);
router.post('/semester-summary', VerifyUser, getSemesterSummary);
router.post('/carryovers', VerifyUser, getPreviousSemesterCarryovers);


export default router;