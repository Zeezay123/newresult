
import express from 'express';
import {VerifyUser} from '../../utils/VerifyUser.js';
import { assignAdvisor, getAdvisors, getAssignedAdvisors } from '../../Controllers/hod/advisor.controller.js';

const router = express.Router();

router.get('/levelandlecturers', VerifyUser, getAdvisors)
router.post('/assignadvisor', VerifyUser, assignAdvisor)
router.get('/assignedadvisors/:HodID', VerifyUser, getAssignedAdvisors )
export default router;