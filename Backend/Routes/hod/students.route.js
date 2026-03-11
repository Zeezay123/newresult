import express from 'express';
import { getStudents} from '../../Controllers/hod/students.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';

const router = express.Router();

router.get('/:id', VerifyUser, getStudents);
// router.get('/level/:id', getStudentsByLevel);

export default router; 