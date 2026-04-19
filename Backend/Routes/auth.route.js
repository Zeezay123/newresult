import express from 'express';
import { Signin, signOut } from '../Controllers/auth.controller.js';
import { VerifyUser } from '../utils/VerifyUser.js';
import { staffSignin } from '../Controllers/staff.auth.controller.js';
import { signIn } from '../Controllers/auth2.controller.js';


const router = express.Router();

// Define your auth routes here
 
// Login route - no authentication required
router.post('/login', Signin)
router.get('/signout', signOut)
router.post('/staff-login', staffSignin)

// Protected routes (use VerifyUser middleware for routes that need authentication)
// Example: router.get('/profile', VerifyUser, getProfile)

export default router;