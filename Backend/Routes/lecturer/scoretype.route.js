import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { getAssignedScoreTypes } from '../../Controllers/lecturer/scoretype.controller.js';


const router = express.Router();
router.get('/assignedscoretypes', VerifyUser, getAssignedScoreTypes);

export default router;