import express from 'express';
import { getLecturers, getLecturersCount, assignCourse, unassignCourse, getlecturerDepartment} from '../../Controllers/hod/lecturers.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';

const router = express.Router();

router.get('/getlecturers', VerifyUser, getLecturers);
// router.get('/getadvisors', VerifyUser, getAdvisors)
router.get('/count', VerifyUser, getLecturersCount);
router.post('/assigncourse', VerifyUser, assignCourse);
router.post('/unassigncourse', VerifyUser, unassignCourse);
router.get('/lecturerdepartments', VerifyUser, getlecturerDepartment);
// router.post('/assignadvisor', VerifyUser, AssignAdvisors);
// router.get('/getassignedadvisors', VerifyUser, GetAssignedAdvisors);

export default router;
