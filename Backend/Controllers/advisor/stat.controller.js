import { poolPromise } from '../../db';
import {sql, poolPromis, errorHandler}from '../../utils/error.js'
import { VerifyUser } from '../../utils/VerifyUser.js';

export const getAdvisorsStudents = async (req, res, next) => {
    
    
    try{


        const pool = await poolPromise

        if(!poolPromise){
            return next(errorHandler(404,'Database not connected'))
        }



    }catch(error){
        console.error('Error fetching advisor students:', error.stack)
       return res.status(500).json({ error: 'Internal server error' })
        
    }
}