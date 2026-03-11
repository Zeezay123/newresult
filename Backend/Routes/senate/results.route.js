import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { 
    getAvailableFilters,
    getLevelResults,
    downloadLevelResults,
    approveLevelResults,
    rejectLevelResults
} from '../../Controllers/senate/results.controller.js';

const router = express.Router();

// Senate Results Routes
router.get('/filters', VerifyUser, getAvailableFilters);
router.get('/levelResults', VerifyUser, getLevelResults);
router.get('/downloadLevelResults', VerifyUser, downloadLevelResults);
router.put('/approveLevelResults', VerifyUser, approveLevelResults);
router.put('/rejectLevelResults', VerifyUser, rejectLevelResults);

export default router;
