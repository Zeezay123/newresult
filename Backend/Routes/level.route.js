import express from 'express';
import { VerifyUser } from '../utils/VerifyUser.js';
import { getLevels } from '../Controllers/level.controller.js';



const router = express.Router();

router.get('/getlevels', VerifyUser, getLevels);

export default router;