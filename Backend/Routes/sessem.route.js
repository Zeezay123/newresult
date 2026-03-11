import express from 'express';
import { getSessions, getSemesters, getActiveSession } from '../Controllers/sessem.controller.js';
import { VerifyUser } from '../utils/VerifyUser.js';

const router = express.Router();

router.get('/getsessions', VerifyUser, getSessions);
router.get('/getsemesters', VerifyUser, getSemesters);
router.get('/active-session', VerifyUser, getActiveSession);

export default router;