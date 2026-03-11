import express from 'express';
import { VerifyUser } from '../../utils/VerifyUser.js';
import { getgpa, getResults, getAvailableSessions, getFailedCoreCourses, getPassedCourses, getMissedCoreCourses, getOutstandingCourses } from '../../Controllers/student/student.controller.js';




const router = express.Router();

router.get('/available-sessions/', VerifyUser, getAvailableSessions);
router.get('/getresults/', VerifyUser, getResults);
router.get('/failed-core-courses/', VerifyUser, getFailedCoreCourses);
router.get('/missed-core-courses/', VerifyUser, getMissedCoreCourses);
router.get('/outstanding-courses/', VerifyUser, getOutstandingCourses);
router.get('/passed-courses/', VerifyUser, getPassedCourses);
router.get('/getgpa/:id', VerifyUser,getgpa); 

export default router;