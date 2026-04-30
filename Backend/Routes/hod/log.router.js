import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { getResultLog } from '../../Controllers/hod/log.controller.js';


const router = express.Router();


router.get('/resultlog', VerifyUser, getResultLog)

export default router;