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
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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
                .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);

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
                c.CourseCode,
                c.CourseName,
                r.Grade,
                r.TotalScore,
                c.CreditUnits,
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
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
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
            ORDER BY c.CourseCode
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
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
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
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND (r.Grade = 'F' OR r.GradePoint = 0)
                AND (c.CourseType = 'Core' OR c.CourseType = 'Compulsory')
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'
           
        `;
 //ORDER BY ses.SessionID DESC, sem.SemesterID DESC, c.CourseCode
        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .query(query);

        return res.status(200).json({
            success: true,
            failedCoreCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
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
                SELECT StudentID, LevelID, DepartmentID, FacultyID, ProgrammeID
                FROM dbo.student
                WHERE MatricNo = @MatricNo
            `);

        if (studentInfo.recordset.length === 0) {
            return next(errorHandler(404, "Student not found"));
        }

        const student = studentInfo.recordset[0];

        // Find core courses that the student should have taken but didn't register for
        // These are courses for levels <= student's current level that they never registered
        const query = `
            SELECT DISTINCT
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
                c.SemesterID,
                l.LevelName,
                sem.SemesterName,
                'Missed' AS CourseStatus
            FROM dbo.course c
            LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
            LEFT JOIN dbo.semesters sem ON c.SemesterID = sem.SemesterID
            WHERE c.CourseType IN ('Core', 'Compulsory')
                AND c.LevelID <= @LevelID
                AND (
                    -- Department courses
                    (c.CourseCategory = 'department' AND c.DepartmentID = @DepartmentID)
                    OR
                    -- Faculty courses
                    (c.CourseCategory = 'faculty' AND c.FacultyID = @FacultyID)
                    OR
                    -- General courses
                    (c.CourseCategory = 'general')
                )
                AND c.CourseID NOT IN (
                    -- Exclude courses the student has already registered for
                    SELECT CourseID 
                    FROM dbo.course_registration 
                    WHERE StudentID = @StudentID
                )
            ORDER BY c.LevelID, c.SemesterID, c.CourseCode
        `;

        const result = await pool.request()
            .input('StudentID', sql.Int, student.StudentID)
            .input('MatricNo', sql.VarChar, MatricNo)
            .input('LevelID', sql.Int, student.LevelID)
            .input('DepartmentID', sql.Int, student.DepartmentID)
            .input('FacultyID', sql.Int, student.FacultyID)
            .input('ProgrammeID', sql.Int, student.ProgrammeID)
            .query(query);

        return res.status(200).json({
            success: true,
            missedCoreCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
        });

    } catch (error) {
        console.error("Error fetching missed core courses:", error);
        return next(errorHandler(500, "An error occurred while fetching missed core courses"));
    }
};

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
                SELECT StudentID, LevelID, DepartmentID, FacultyID, ProgrammeID
                FROM dbo.student
                WHERE MatricNo = @MatricNo
            `);

        if (studentInfo.recordset.length === 0) {
            return next(errorHandler(404, "Student not found"));
        }

        const student = studentInfo.recordset[0];

        // Get both failed and missed courses in a single query
        const query = `
            -- Failed courses (courses taken but failed)
            SELECT DISTINCT
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
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
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
            WHERE r.MatricNo = @MatricNo
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND (r.Grade = 'F' OR r.GradePoint = 0)
                AND (c.CourseType = 'Core' OR c.CourseType = 'Compulsory')
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND r.Bsc_Approval = 'Approved'
            
            UNION ALL
            
            -- Missed courses (courses not registered for)
            SELECT DISTINCT
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
                NULL AS Grade,
                NULL AS GradePoint,
                NULL AS TotalScore,
                NULL AS SessionID,
                c.SemesterID,
                NULL AS SessionName,
                sem.SemesterName,
                l.LevelName,
                'Missed' AS CourseStatus
            FROM dbo.course c
            LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
            LEFT JOIN dbo.semesters sem ON c.SemesterID = sem.SemesterID
            WHERE c.CourseType IN ('Core', 'Compulsory')
                AND c.LevelID <= @LevelID
                AND (
                    (c.CourseCategory = 'department' AND c.DepartmentID = @DepartmentID)
                    OR (c.CourseCategory = 'faculty' AND c.FacultyID = @FacultyID)
                    OR (c.CourseCategory = 'general')
                )
                AND c.CourseID NOT IN (
                    SELECT CourseID 
                    FROM dbo.course_registration 
                    WHERE StudentID = @StudentID
                )
            ORDER BY CourseStatus, LevelName, SemesterName, CourseCode
        `;

        const result = await pool.request()
            .input('MatricNo', sql.VarChar, MatricNo)
            .input('StudentID', sql.Int, student.StudentID)
            .input('LevelID', sql.Int, student.LevelID)
            .input('DepartmentID', sql.Int, student.DepartmentID)
            .input('FacultyID', sql.Int, student.FacultyID)
            .input('ProgrammeID', sql.Int, student.ProgrammeID)
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
                totalUnits: result.recordset.reduce((sum, course) => sum + (course.CreditUnits || 0), 0),
                failedUnits: failedCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0),
                missedUnits: missedCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
            }
        });

    } catch (error) {
        console.error("Error fetching outstanding courses:", error);
        return next(errorHandler(500, "An error occurred while fetching outstanding courses"));
    }
};

export const getPassedCourses = async (req, res, next) => {
    const { MatricNo } = req.query;

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
                c.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
                r.Grade,
                r.GradePoint,
                r.TotalScore,
                r.SessionID,
                r.SemesterID,
                ses.SessionName,
                sem.SemesterName,
                l.LevelName
            FROM dbo.results r
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.levels l ON c.LevelID = l.LevelID
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
        const coreCourses = result.recordset.filter(c => c.CourseType === 'Core' || c.CourseType === 'core');
        const electiveCourses = result.recordset.filter(c => c.CourseType === 'Elective' || c.CourseType === 'elective');
        const otherCourses = result.recordset.filter(c => c.CourseType !== 'Core' && c.CourseType !== 'core' && c.CourseType !== 'Elective' && c.CourseType !== 'elective');

        return res.status(200).json({
            success: true,
            passedCourses: result.recordset,
            count: result.recordset.length,
            totalUnits: result.recordset.reduce((sum, course) => sum + (course.CreditUnits || 0), 0),
            summary: {
                core: {
                    count: coreCourses.length,
                    units: coreCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
                },
                elective: {
                    count: electiveCourses.length,
                    units: electiveCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
                },
                other: {
                    count: otherCourses.length,
                    units: otherCourses.reduce((sum, course) => sum + (course.CreditUnits || 0), 0)
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