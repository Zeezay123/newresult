import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { CheckAdvisor } from '../../Controllers/lecturer/roles.controller.js';


const router = express.Router();


 router.get('/checkAdvisor', VerifyUser, CheckAdvisor );


export default router;