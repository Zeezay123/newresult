import {sql,poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';

export const getResultLog = async (req, res, next) => {

const userId = req.user.id;
const hodID = req.user.departmentID;

console.log("Fetching result log for HOD ID:", hodID, "User ID:", userId);
console.log(typeof hodID, typeof userId);
try{

    const pool = await poolPromise;
 

    if(!pool){
        return res.status(500).json({ success: false, message: "Database connection failed" });
    }

    // active session and semester    const sessionSemesterResult = await pool.request()
  const activeSessionResult = await pool.request()
            .query(`
                SELECT SessionID, SessionName 
                FROM dbo.sessions 
                WHERE isActive = '1'
            `);

        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;

        const activeSemesterResult = await pool.request()
            .query(`
                SELECT SemesterID, SemesterName 
                FROM dbo.semesters 
                WHERE isActive = 'true'
            `);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;
   
    const result = await pool.request()
            .input('hodID', sql.Int, hodID)
            .input('sessionID', sql.Int, sessionID)
            .input('semesterID', sql.Int, semesterID)
            .query(`
                Select distinct  r.SubmittedDate, r.SubmittedBy
                from dbo.results r
            
                
                `)

            if(result.recordset.length === 0){
                return res.status(404).json({ success: false, message: "No result log found for the current session and semester" })
            }

            return res.status(200).json({ success: true, log: result.recordset })
//, co.course_code, co.course_title,c.course_id
    // INNER JOIN dbo.course_allocations c ON c.course_id = r.CourseID 
                // INNER JOIN dbo.courses co ON co.course_id = c.course_id
                // where r.SessionID = @sessionID
                // and r.SemesterID = @semesterID
                // and c.department = @hodID 

                // group by r.SubmittedDate, r.SubmittedBy, co.course_code, co.course_title,c.course_id
                // order by r.SubmittedDate desc
              
} catch(err){
    console.error("Error fetching result log:", err.stack)
    return res.status(500).json({ success: false, message: "An error occurred while fetching result log" })
}
}