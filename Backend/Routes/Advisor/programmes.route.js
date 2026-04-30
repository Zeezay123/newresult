import express from "express";
import { VerifyUser } from "../../utils/VerifyUser.js";
import { getProgrammes } from "../../Controllers/programmes.controller.js";

const router = express.Router()


router.get('/',VerifyUser, getProgrammes)

export default router;