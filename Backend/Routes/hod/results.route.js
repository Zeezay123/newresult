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

} from '../../Controllers/hod/results.controller.js';
import { 
  getLevelResults, 
  getAvailableProgrammesAndLevels,
  downloadLevelResults,
  approveLevelResults,
  rejectLevelResults
} from '../../Controllers/hod/levelresult.controller.js';

const router = express.Router();

// Test Results Routes
router.get('/testResults/:id', VerifyUser, getTestResults);
router.post('/viewTestResults/:id', VerifyUser, viewTestResultDetails);
router.get('/downloadTestResults/:id', VerifyUser, downloadTestResults);

// Exam Results Routes
router.get('/examResults/:id', VerifyUser, getExamResults);
router.get('/allExamResults/:id', VerifyUser, getALLExamResults);
router.post('/viewExamResults/:id', VerifyUser, viewExamResultDetails);
router.get('/downloadExamResults/:id', VerifyUser, downloadExamResults);

//Result Approval and Rejection 
router.put('/approveOrReject/:id', VerifyUser, approveOrRejectExamResults)

// Level Results Routes (for viewing approved results by programme and level)
router.get('/programmes-levels/:id', VerifyUser, getAvailableProgrammesAndLevels);
router.get('/levelResults/:id', VerifyUser, getLevelResults);
router.get('/downloadLevelResults/:id', VerifyUser, downloadLevelResults);
router.put('/approveLevelResults/:id', VerifyUser, approveLevelResults);
router.put('/rejectLevelResults/:id', VerifyUser, rejectLevelResults);


export default router;