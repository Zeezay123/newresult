import { sql, poolPromise } from "../../db.js";
import { errorHandler } from '../../utils/error.js';

// Get available sessions and semesters for a student
export const getAvailableSessions = async (req, res, next) => {
    const { MatricNo } = req.query;

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        // Get all sessions and semesters where student has approved results
        const query = `
            SELECT DISTINCT 
                ses.SessionID,
                ses.SessionName,
                sem.SemesterID,
                sem.SemesterName,
                COUNT(DISTINCT r.CourseID) as CourseCount
            FROM dbo.results r
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND (
                    (r.Advisor = 'Approved' AND r.HOD_Approval = 'Approved' AND r.Bsc_Approval = 'Approved')
                    OR (ses.isActive = 1 AND sem.isActive = 'true')
                )
            GROUP BY ses.SessionID, ses.SessionName, sem.SemesterID, sem.SemesterName
            ORDER BY ses.SessionID DESC, sem.SemesterID DESC
        `;

        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(query);

        return res.status(200).json({
            success: true,
            activeSession: activeSessionResult.recordset[0] || null,
            activeSemester: activeSemesterResult.recordset[0] || null,
            availableSessions: result.recordset
        });

    } catch (error) {
        console.error("Error fetching available sessions:", error);
        return next(errorHandler(500, "An error occurred while fetching available sessions"));
    }
};

export const getResults = async (req, res, next) => {
    const { SessionID, SemesterID, MatricNo } = req.query;

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        let sessionID = SessionID ? parseInt(SessionID) : null;
        let semesterID = SemesterID ? parseInt(SemesterID) : null;

        // If no session/semester specified, get the active ones
        if (!sessionID || !semesterID) {
            const activeSessionResult = await pool.request()
                .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);

            const activeSemesterResult = await pool.request()
                .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);

            if (activeSessionResult.recordset.length > 0) {
                sessionID = activeSessionResult.recordset[0].SessionID;
            }

            if (activeSemesterResult.recordset.length > 0) {
                semesterID = activeSemesterResult.recordset[0].SemesterID;
            }

            if (!sessionID || !semesterID) {
                return res.status(404).json({ message: "No active session or semester found" });
            }
        }

        // Check if viewing current semester or historical
        const activeCheck = await pool.request()
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(`
                SELECT 
                    CASE WHEN ses.isActive = 1 AND sem.isActive = 'true' THEN 1 ELSE 0 END AS IsCurrent
                FROM dbo.sessions ses, dbo.semesters sem
                WHERE ses.SessionID = @SessionID AND sem.SemesterID = @SemesterID
            `);

        const isCurrent = activeCheck.recordset[0]?.IsCurrent === 1;

        // Build query - for historical semesters, check full approval chain
        let approvalCondition = '';
        if (!isCurrent) {
            approvalCondition = `
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'
            `;
        }

        const query = `
            SELECT 
                r.MatricNo,
                r.CourseID,
                c.course_code,
                c.course_title,
                r.Grade,
                r.TotalScore,
                c.credit_unit,
                r.GradePoint,
                r.SessionID,
                r.SemesterID,
                ses.SessionName,
                sem.SemesterName,
                gpa.GPA,
                gpa.CGPA,
                gpa.TotalCreditUnits,
                gpa.TotalCreditUnitsPassed,
                gpa.TotalCreditUnitsFailed,
                r.Advisor,
                r.HOD_Approval,
                r.Bsc_Approval
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.student_gpa gpa ON r.MatricNo = gpa.MatricNo 
                AND r.SessionID = gpa.SessionID 
                AND r.SemesterID = gpa.SemesterID
            WHERE r.MatricNo = @MatricNo
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                ${approvalCondition}
            ORDER BY c.course_code
        `;

        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                message: isCurrent 
                    ? "No results found for the current semester" 
                    : "No approved results found for the specified semester" 
            });
        }

        return res.status(200).json({
            success: true,
            results: result.recordset,
            count: result.recordset.length,
            gpa: result.recordset[0]?.GPA || null,
            cgpa: result.recordset[0]?.CGPA || null,
            totalUnits: result.recordset[0]?.TotalCreditUnits || 0,
            unitsPassed: result.recordset[0]?.TotalCreditUnitsPassed || 0,
            unitsFailed: result.recordset[0]?.TotalCreditUnitsFailed || 0,
            sessionName: result.recordset[0]?.SessionName || '',
            semesterName: result.recordset[0]?.SemesterName || '',
            isCurrent: isCurrent
        });

    } catch (error) {
        console.error("Error fetching results:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return next(errorHandler(500, "An error occurred while fetching results"));
    }
};

export const getFailedCoreCourses = async (req, res, next) => {
    const { MatricNo } = req.query;

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get all failed core courses for the student (courses they took but failed)
        const query = `
            SELECT DISTINCT
                c.course_id,
                c.course_code,
                c.course_title,
                c.credit_unit,
                c.course_type,
                r.Grade,
                r.GradePoint,
                r.TotalScore,
                r.SessionID,
                r.SemesterID,
                ses.SessionName,
                sem.SemesterName,
                l.LevelName,
                'Failed' AS CourseStatus
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND (r.Grade = 'F' OR r.GradePoint = 0)
                AND (c.course_type = 'C' OR c.course_type = 'Compulsory')
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'
           
        `;
 //ORDER BY ses.SessionID DESC, sem.SemesterID DESC, c.course_code
        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(query);

        return res.status(200).json({
            success: true,
            failedCoreCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
        });

    } catch (error) {
        console.error("Error fetching failed core courses:", error);
        return next(errorHandler(500, "An error occurred while fetching failed core courses"));
    }
};

// Get unregistered (missed) core courses for a student
export const getMissedCoreCourses = async (req, res, next) => {
    const { MatricNo } = req.query;

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get student information
        const studentInfo = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(`
                SELECT StudentID, MatNo, LevelID, department, DisciplineID,faculty, ProgrammeID
                FROM dbo.student
                WHERE MatNo = @MatricNo
            `);

        if (studentInfo.recordset.length === 0) {
            return next(errorHandler(404, "Student not found"));
        }

        const student = studentInfo.recordset[0];

        // Get active semester to avoid listing future-semester courses as missed.
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"));
        }

        const currentSemesterID = activeSemesterResult.recordset[0].SemesterID;

        // Find required core/compulsory courses due up to the current semester that are not registered.
        const query = `
            SELECT 
                c.course_id,
                c.course_code,
                c.course_title,
                c.credit_unit,
                c.course_type,
                c.semester AS SemesterID,
                l.LevelName,
                sem.SemesterName,
                'Missed' AS CourseStatus
            FROM dbo.courses c
            LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
            LEFT JOIN dbo.semesters sem ON c.semester = sem.SemesterID

            WHERE c.course_type = 'C'
            AND c.programme_id = @ProgrammeID
            AND c.discipline = @DisciplineID
            AND c.faculty = @FacultyID
            AND c.level_id = @LevelID
                AND c.semester <= @CurrentSemesterID
         
            
            AND NOT EXISTS (
            SELECT * FROM dbo.results r 
            where c.course_id = r.CourseID
            AND
            r.MatricNo = @MatricNo
            ) 

           
            ORDER BY c.course_code
        `






        const result = await pool.request()
            
            .input('MatricNo', sql.VarChar, MatricNo)
            .input('LevelID', sql.Int, student.LevelID)
            .input('CurrentSemesterID', sql.Int, currentSemesterID)
            .input('ProgrammeID', sql.Int, student.ProgrammeID)
            .input('DepartmentID', sql.Int, student.department)
            .input('FacultyID', sql.Int, student.faculty)
            .input('DisciplineID', sql.Int, student.DisciplineID)
            .query(query);

        return res.status(200).json({
            success: true,
            missedCoreCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
        });

    } catch (error) {
        console.error("Error fetching missed core courses:", error);
        return next(errorHandler(500, "An error occurred while fetching missed core courses"));
    }
};


//  AND NOT EXISTS (
//                     SELECT 1
//                     FROM dbo.course_registrations cr
//                     CROSS APPLY STRING_SPLIT(CAST(ISNULL(cr.courses, '') AS NVARCHAR(MAX)), ',') AS registeredCourse
//                     WHERE cr.mat_no = @MatricNo
//                       AND TRY_CAST(LTRIM(RTRIM(registeredCourse.value)) AS INT) = c.course_id
//                 ) 
       
//                 AND EXISTS (
//                     SELECT 1
//                     FROM dbo.courses c2
//                     CROSS APPLY STRING_SPLIT(CAST(ISNULL(c2.faculty, '') AS NVARCHAR(MAX)), ',') AS courseFaculty
//                     CROSS APPLY STRING_SPLIT(CAST(ISNULL(c2.discipline, '') AS NVARCHAR(MAX)), ',') AS courseDiscipline
//                     where c2.course_id = c.course_id 
//                       AND TRY_CAST(LTRIM(RTRIM(courseFaculty.value)) AS INT) = @FacultyID
//                       AND TRY_CAST(LTRIM(RTRIM(courseDiscipline.value)) AS INT) = @DisciplineID
//                       AND c2.semester = @currentSemesterID
//                 )


// Get all outstanding courses (both failed and missed)
export const getOutstandingCourses = async (req, res, next) => {
    const { MatricNo } = req.query;

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get student information
        const studentInfo = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(`
                SELECT StudentID, MatNo, LevelID, department, faculty, ProgrammeID
                FROM dbo.student
                WHERE MatNo = @MatricNo
            `);

        if (studentInfo.recordset.length === 0) {
            return next(errorHandler(404, "Student not found"));
        }

        const student = studentInfo.recordset[0];

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"));
        }

        const currentSemesterID = activeSemesterResult.recordset[0].SemesterID;

        // Failed = registered and attempted but failed.
        // Missed = due required core/compulsory courses not present in comma-separated registrations.
        const query = `
            SELECT DISTINCT
                c.course_id,
                c.course_code,
                c.course_title,
                c.credit_unit,
                c.course_type,
                r.Grade,
                r.GradePoint,
                r.TotalScore,
                r.SessionID,
                r.SemesterID,
                ses.SessionName,
                sem.SemesterName,
                l.LevelName,
                'Failed' AS CourseStatus
                
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND (r.Grade = 'F' OR r.GradePoint = 0)
                AND c.course_type IN ('C', 'Compulsory')
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'

            UNION ALL

            SELECT DISTINCT
                c.course_id,
                c.course_code,
                c.course_title,
                c.credit_unit,
                c.course_type,
                NULL AS Grade,
                NULL AS GradePoint,
                NULL AS TotalScore,
                NULL AS SessionID,
                c.semester AS SemesterID,
                NULL AS SessionName,
                sem.SemesterName,
                l.LevelName,
                'Missed' AS CourseStatus
            FROM dbo.courses c
            LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
            LEFT JOIN dbo.semesters sem ON  c.semester = sem.SemesterID
            WHERE c.course_type ='E'
                
               
            ORDER BY CourseStatus, LevelName, SemesterName, course_code
        `;

        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .input('LevelID', sql.Int, student.LevelID)
            .input('CurrentSemesterID', sql.Int, currentSemesterID)
            .query(query);

        const failedCourses = result.recordset.filter(c => c.CourseStatus === 'Failed');
        const missedCourses = result.recordset.filter(c => c.CourseStatus === 'Missed');

        return res.status(200).json({
            success: true,
            outstandingCourses: result.recordset,
            failedCourses: failedCourses,
            missedCourses: missedCourses,
            summary: {
                total: result.recordset.length,
                failed: failedCourses.length,
                missed: missedCourses.length,
                totalUnits: result.recordset.reduce((sum, course) => sum + (course.credit_unit || 0), 0),
                failedUnits: failedCourses.reduce((sum, course) => sum + (course.credit_unit || 0), 0),
                missedUnits: missedCourses.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
            }
        });

    } catch (error) {
        console.error("Error fetching outstanding courses:", error);
        return next(errorHandler(500, "An error occurred while fetching outstanding courses"));
    }
};

export const getPassedCourses = async (req, res, next) => {
    const { MatricNo } = req.query;

    console.log('Fetching passed courses for MatricNo:', MatricNo);

    if (!MatricNo) {
        return res.status(400).json({ message: "MatricNo is required" });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get all passed courses (both core and elective) for the student
        const query = `
            SELECT DISTINCT
                c.course_id,
                c.course_code,
                c.course_title,
                c.credit_unit,
                c.course_type,
                r.Grade,
                r.GradePoint,
                r.TotalScore,
                r.SessionID,
                r.SemesterID,
                ses.SessionName,
                sem.SemesterName,
                l.LevelName
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND r.Grade != 'F'
                AND r.GradePoint > 0
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'

          
        `;

          // ORDER BY ses.SessionID DESC, sem.SemesterID DESC, c.CourseCode

        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(query);

        // Group courses by type for summary
        const coreCourses = result.recordset.filter(c => c.course_type === 'C' || c.course_type === 'core');
        const electiveCourses = result.recordset.filter(c => c.course_type === 'E' || c.course_type === 'elective');
        const otherCourses = result.recordset.filter(c => c.course_type !== 'C' && c.course_type !== 'core' && c.course_type !== 'E' && c.course_type !== 'elective');

        return res.status(200).json({
            success: true,
            passedCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.credit_unit || 0), 0),
            summary: {
                core: {
                    count: coreCourses.length,
                    units: coreCourses.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
                },
                elective: {
                    count: electiveCourses.length,
                    units: electiveCourses.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
                },
                other: {
                    count: otherCourses.length,
                    units: otherCourses.reduce((sum, course) => sum + (course.credit_unit || 0), 0)
                }
            }
        });

    } catch (error) {
        console.error("Error fetching passed courses:", error);
        return next(errorHandler(500, "An error occurred while fetching passed courses"));
    }
};

export const getgpa = async (req, res, next) => {

}


// AND (
//                     c.level_id < @LevelID
//                     OR (c.level_id = @LevelID AND  c.semester <= @CurrentSemesterID)
//                 )

//  AND NOT EXISTS (
//                     SELECT 1
//                     FROM dbo.course_registrations cr
//                     CROSS APPLY STRING_SPLIT(CAST(ISNULL(cr.courses, '') AS NVARCHAR(MAX)), ',') AS registeredCourse
//                     WHERE cr.mat_no = @MatricNo
//                       AND TRY_CAST(LTRIM(RTRIM(registeredCourse.value)) AS INT) = c.course_id
//                 )