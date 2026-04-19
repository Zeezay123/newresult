import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


// submit courses for a lecturer

export const submittedCourses = async(req, res, next) => {
    const lectid = req.user.id;
    const selectedSessionId = req.query.sessionId;
    const selectedSemesterId = req.query.semesterId;

    if(!lectid){
        return(next(errorHandler(403, "Lecturer ID is required")));
    }

    try {
        const pool = await poolPromise

    if(!pool){
        return next(errorHandler(500, "Database connection failed"));
    }
    
    
      //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
            WHERE isActive = 1
         `);

         if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
         }
  
            const SessionID = selectedSessionId
                ? parseInt(selectedSessionId)
                : activeSessionResult.recordset[0].SessionID;
        


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

         const SemesterID = selectedSemesterId
            ? parseInt(selectedSemesterId)
            : activeSemesterResult.recordset[0].SemesterID;
       
         const result = await pool.request()
        .input('StaffCode', sql.VarChar, lectid)
        .input('SessionID', sql.Int, SessionID)
        .input('SemesterID', sql.Int, SemesterID)
        .query(`
            SELECT 
            COUNT(DISTINCT r.CourseID) AS count
        FROM DBO.results r 
        WHERE r.SubmittedBy = @StaffCode
        AND r.SessionID = @SessionID
        AND r.SemesterID = @SemesterID
        AND r.ResultStatus = 'Submitted'
        AND r.ResultType = 'Exam'
        `)

        const submissions = await pool.request()
        .input('StaffCode', sql.VarChar, lectid)
        .input('SessionID', sql.Int, SessionID)
        .input('SemesterID', sql.Int, SemesterID)
        .query(`
            SELECT
                r.CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseTitle,
                p.ProgrammeID,
                p.ProgrammeName,
                l.LevelID,
                COALESCE(ca.CourseCategory, c.course_type, 'N/A') AS Category,
                r.ResultType,
                l.LevelName,
                COUNT(DISTINCT r.MatricNo) AS StudentCount,
                MAX(ISNULL(reg.TotalStudents, 0)) AS TotalStudents,
                MAX(r.SubmittedDate) AS SubmittedDate,
                CASE
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Rejected' THEN 1 ELSE 0 END) > 0 THEN 'Rejected'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Approved' THEN 1 ELSE 0 END) > 0 THEN 'Approved'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Submitted' THEN 1 ELSE 0 END) > 0 THEN 'Submitted'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Pending' THEN 1 ELSE 0 END) > 0 THEN 'Pending'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Test' THEN 1 ELSE 0 END) > 0 THEN 'Submitted'
                    ELSE COALESCE(MAX(r.ResultStatus), 'N/A')
                END AS Status
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            LEFT JOIN dbo.programmes p ON c.programme_id = p.ProgrammeID
            LEFT JOIN dbo.levels l ON r.LevelID = l.LevelID
            LEFT JOIN dbo.course_assignment ca
                ON ca.CourseID = r.CourseID
                AND ca.LecturerID = r.SubmittedBy
                AND ca.SessionID = r.SessionID
                AND ca.SemesterID = r.SemesterID
            OUTER APPLY (
                SELECT COUNT(DISTINCT cr.mat_no) AS TotalStudents
                FROM dbo.course_registrations cr
                WHERE cr.session = r.SessionID
                    AND EXISTS (
                        SELECT 1
                        FROM STRING_SPLIT(CAST(ISNULL(cr.courses, '') AS NVARCHAR(MAX)), ',') AS registeredCourse
                        WHERE TRY_CAST(LTRIM(RTRIM(registeredCourse.value)) AS INT) = r.CourseID
                    )
            ) reg
            WHERE r.SubmittedBy = @StaffCode
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.SubmittedDate IS NOT NULL
                AND (
                    (r.ResultType = 'Test' AND r.ResultStatus IN ('Pending', 'Approved', 'Rejected', 'Test'))
                    OR (r.ResultType = 'Exam' AND r.ResultStatus IN ('Submitted', 'Approved', 'Rejected'))
                )
            GROUP BY
                r.CourseID,
                c.course_code,
                c.course_title,
                p.ProgrammeID,
                p.ProgrammeName,
                l.LevelID,
                COALESCE(ca.CourseCategory, c.course_type, 'N/A'),
                r.ResultType,
                l.LevelName
            ORDER BY MAX(r.SubmittedDate) DESC, c.course_code ASC
        `)

        const rows = submissions.recordset;
        const stats = {
            testSubmitted: rows.filter((row) => row.ResultType === 'Test').length,
            examSubmitted: rows.filter((row) => row.ResultType === 'Exam').length,
            approved: rows.filter((row) => row.Status === 'Approved').length,
            rejected: rows.filter((row) => row.Status === 'Rejected').length,
        };

        if(result.recordset.length === 0){
            return res.status(200).json({ count: 0, results: rows, stats });
        }

        res.status(200).json({ count: result.recordset[0].count, results: rows, stats });



    } catch (error) {
        console.log("Error fetching submitted courses:", error.stack );
        return next(errorHandler(500, "Error fetching submitted courses: " + error.message));
    }

}

