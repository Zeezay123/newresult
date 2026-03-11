import express from 'express';
import { getCourses} from '../../Controllers/lecturer/courses.controller.js';
import { VerifyUser } from '../../utils/VerifyUser.js';


const router = express.Router();

router.get('/getcourses', VerifyUser, getCourses);
// router.post('/assignlecturer', VerifyUser, assignLecturer);
// router.post('/unassignlecturer/:id', VerifyUser, unassignLecturer);
// router.get('/coursestats/:lectid', VerifyUser, getCourseStats);


export default router;