import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { 
    getAvailableFilters,
    getLevelResults,
    downloadLevelResults,
    approveLevelResults,
    rejectLevelResults,
    getPreviousCumulative,
    getCurentSemesterCourses,
    getSemesterSummary,
    carryOverCourses
} from '../../Controllers/senate/results.controller.js';

const router = express.Router();

// Senate Results Routes
router.get('/filters', VerifyUser, getAvailableFilters);
router.get('/levelResults', VerifyUser, getLevelResults);
router.post('/previouscumres', VerifyUser, getPreviousCumulative)
router.post('/currentcourses', VerifyUser, getCurentSemesterCourses)
router.post('/semestersummary', VerifyUser, getSemesterSummary)
router.post('/carryover', VerifyUser, carryOverCourses)
router.get('/downloadLevelResults', VerifyUser, downloadLevelResults);
router.put('/approveLevelResults', VerifyUser, approveLevelResults);
router.put('/rejectLevelResults', VerifyUser, rejectLevelResults);

export default router;
