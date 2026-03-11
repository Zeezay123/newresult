import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorHandler } from './error.js';

export const  VerifyUser =(req, res, next)=>{

    const token = req.cookies.access_token


    if(!token){
        return next(errorHandler(401, 'Unauthorized - no token found'))
    }




    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{

        if(err){
            return next(errorHandler(401, "Unauthorized - Invalid Token"))
        }

        req.user = user
        

        next()
    })
}