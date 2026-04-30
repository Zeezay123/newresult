import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getCourses = async (req, res, next) => {
   
    const lectid = req.user.id;
    console.log('lecturers code', lectid)

    try {
        
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
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

        // Get active semester
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
            .input('StaffCode', sql.VarChar, lectid)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(`
                SELECT 
                    s.StaffId,
                    c.course_id,
                    c.course_code,
                    c.course_title,
                    c.credit_unit,
                    c.course_type,
                    c.level_id,
                    ca.AssignmentID,
                    ca.AssignedDate,
                    ca.AssignmentStatus,
                    ses.SessionName,
                    sem.SemesterName,
                    d.DepartmentName,
                    dis.Name
                FROM dbo.tblStaffDirectory s
                INNER JOIN dbo.course_assignment ca ON s.StaffId = ca.LecturerID
                INNER JOIN dbo.courses c ON ca.CourseID = c.course_id
                LEFT JOIN dbo.sessions ses ON ca.SessionID = ses.SessionID
                LEFT JOIN dbo.semesters sem ON ca.SemesterID = sem.SemesterID
                LEFT JOIN dbo.appdepartment d ON ca.DepartmentID = d.DepartmentID
                Left JOIN dbo.Disciplines dis ON ca.DisciplineID = dis.DisciplineID
                WHERE s.StaffId = @StaffCode
                    AND ca.AssignmentStatus = 'assigned'
                    AND ca.SessionID = @SessionID
                    AND ca.SemesterID = @SemesterID
                ORDER BY c.course_code
            `);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            courses: result.recordset
        });

    } catch (error) {
        console.error('Error fetching lecturer courses:', error);
        return next(errorHandler(500, "Error fetching courses: " + error.message));
    }
}