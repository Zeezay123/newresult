import {sql, poolPromise} from '../db.js';
import { errorHandler } from '../utils/error.js';



export const getLevels = async (req,res, next) => {
        
    const user = req.user;

    if(!user){
        return res.status(401).json({message: "Unauthorized"})
    }

    try {
        const pool = await poolPromise;
       
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const result = await pool.request().query('SELECT * FROM dbo.levels');
        res.json({success:true, levels: result.recordset });

    }catch (error) {
        console.error('Database connection failed:', error);
        return next(errorHandler(500, "Database connection failed"));
    }
}