import express from 'express';
import { getAllDepartments } from '../Controllers/department.controller.js';

const router = express.Router();

// Public route - no authentication needed for login page
router.get('/all', getAllDepartments);

export default router;
