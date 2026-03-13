import express from 'express'
import { VerifyUser } from '../../utils/VerifyUser.js'
import { getRoles } from '../../Controllers/roles.controller.js';


const router = express.Router();
router.get('/getroles', VerifyUser, getRoles);



export default router;