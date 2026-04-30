import express from 'express'
import { getStudents } from '../../Controllers/lecturer/students.controller.js'
import { VerifyUser } from '../../utils/VerifyUser.js'


const router = express.Router()

router.get('/getStudents', VerifyUser,getStudents)



export default router