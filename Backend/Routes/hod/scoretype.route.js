import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { getAssignedScoreTypes, getScoreTypes, setScoreType } from '../../Controllers/hod/scoretype.controller.js';




const router = express.Router();

router.get('/', VerifyUser, getScoreTypes);
router.get('/assignedScoreTypes', VerifyUser, getAssignedScoreTypes);
router.post('/assign', VerifyUser, setScoreType);

export default router;