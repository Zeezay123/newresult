import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getStudents = async(req, res, next) => {
    const lectid = req.user.id;

    if(!lectid){
        return(next(403, "Lecturer ID is required"));
    }

    try{
        const pool = await poolPromise

    if(!pool){
        return next(errorHandler(500, "Database connection failed"));
    }

     const result = await pool.request()


        .input('StaffCode', sql.VarChar, lectid)
        .query(`
            SELECT DISTINCT
       
            cr.StudentID
         
            FROM course_assignment ca
            INNER JOIN course_registrations cr ON ca.CourseID = cr.courses
             E
            INNER JOIN staff s ON ca.LecturerID = s.StaffID
            WHERE s.StaffNo = @StaffCode
                ORDER BY cr.StudentID
            `)
    
             if(result.recordset.length === 0){
                return next(errorHandler(404,'No Result Found'))
             }
            return res.status(200).json(
                {
                    success:true,
                    count:result.recordset.length,
                    data:result.recordset
                }
            )

    }catch(error){
        return next(errorHandler(500, "Error fetching students: " + error.message));
    }
}