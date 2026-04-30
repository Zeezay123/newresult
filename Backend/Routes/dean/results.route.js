import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import {
    getDeanAvailableFilters,
    getDeanCurrentSemesterCourses,
    getDeanDashboardStats,
    getDeanLevelResults,
    getDeanLevelResultDetails,
    getDeanPreviousCumulativeResults,
    getDeanPreviousSemesterCarryovers,
    getDeanSemesterSummary,
    approveDeanLevelResults,
    downloadDeanLevelResults,
    rejectDeanLevelResults,
    getDeanLecturerSubmissionTimeline,
    getDeanLecturerResubmissions,
    getDeanLecturerResubmissionDetails,
    reopenDeanLecturerResults
} from '../../Controllers/dean/results.controller.js';

const router = express.Router();

router.get('/stats', VerifyUser, getDeanDashboardStats);
router.get('/filters', VerifyUser, getDeanAvailableFilters);
router.get('/level-results', VerifyUser, getDeanLevelResults);
router.get('/level-results/details', VerifyUser, getDeanLevelResultDetails);
router.get('/download-level-results', VerifyUser, downloadDeanLevelResults);
router.post('/previous-cumulative', VerifyUser, getDeanPreviousCumulativeResults);
router.post('/current-courses', VerifyUser, getDeanCurrentSemesterCourses);
router.post('/semester-summary', VerifyUser, getDeanSemesterSummary);
router.post('/carryovers', VerifyUser, getDeanPreviousSemesterCarryovers);
router.get('/submission-timeline', VerifyUser, getDeanLecturerSubmissionTimeline);
router.get('/lecturer-resubmissions', VerifyUser, getDeanLecturerResubmissions);
router.get('/lecturer-resubmissions/details', VerifyUser, getDeanLecturerResubmissionDetails);
router.put('/approve-level-results', VerifyUser, approveDeanLevelResults);
router.put('/reject-level-results', VerifyUser, rejectDeanLevelResults);
router.put('/reopen-lecturer-results', VerifyUser, reopenDeanLecturerResults);

export default router;