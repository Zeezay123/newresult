import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getStudents = async(req, res, next) => {
    const lectid = req.user.id;

    if(!lectid){
        return(next(errorHandler(403, "Lecturer ID is required")));
    }

    try{
        const pool = await poolPromise

    if(!pool){
        return next(errorHandler(500, "Database connection failed"));
    }

       //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
            WHERE isActive = '1'
         `);

         if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
         }
  
         const SessionID = activeSessionResult.recordset[0].SessionID;
        


         //get active semester
         const activeSemesterResult = await pool.request()
         .query(`
            SELECT  SemesterID , SemesterName 
            FROM dbo.semesters 
            WHERE isActive = 'true'
         `);

        
         if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
         }

         const SemesterID = activeSemesterResult.recordset[0].SemesterID;


    
     const result = await pool.request()


        .input('StaffCode', sql.VarChar, lectid)
        .input('SessionID', sql.Int, SessionID)
        .input('SemesterID', sql.Int, SemesterID)
        .query(`
            SELECT 
                cr.mat_no
            FROM dbo.registrated_courses cr
           INNER JOIN dbo.course_assignment ca ON cr.course_id = ca.CourseID
                WHERE ca.LecturerID = @StaffCode
                AND ca.SessionID = @SessionID
                AND ca.SemesterID = @SemesterID

            
            ORDER BY cr.mat_no
            `)
    
             if(result.recordset.length === 0){
                return next(errorHandler(404,'No Result Found'))
             }

             console.log('students result', result.recordset)
            return res.status(200).json(
                {
                    success:true,
                    count:result.recordset.length,
                    data:result.recordset
                }
            )

    }catch(error){
        console.log("Error fetching students:", error.stack );
        return next(errorHandler(500, "Error fetching students: " + error.message));
    }
}