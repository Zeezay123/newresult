import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { CheckAdvisor, getRoles } from '../../Controllers/lecturer/roles.controller.js';


const router = express.Router();


 router.get('/checkAdvisor', VerifyUser, CheckAdvisor );
 router.get('/getroles', VerifyUser, getRoles);


export default router;