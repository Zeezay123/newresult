import ExcelJS from 'exceljs';
import { sql, poolPromise } from '../../db.js';
import { errorHandler } from '../../utils/error.js';

const getActiveSessionAndSemester = async (pool) => {
    const activeSessionResult = await pool.request()
        .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

    if (activeSessionResult.recordset.length === 0) {
        throw errorHandler(404, 'No active session found');
    }

    const activeSemesterResult = await pool.request()
        .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

    if (activeSemesterResult.recordset.length === 0) {
        throw errorHandler(404, 'No active semester found');
    }

    return {
        sessionID: activeSessionResult.recordset[0].SessionID,
        sessionName: activeSessionResult.recordset[0].SessionName,
        semesterID: activeSemesterResult.recordset[0].SemesterID,
        semesterName: activeSemesterResult.recordset[0].SemesterName
    };
};

const deanApprovedExamClause = `
    s.faculty = @FacultyID
    AND r.ResultType = 'Exam'
    AND r.ResultStatus = 'Approved'
    AND r.Advisor = 'Approved'
    AND r.HOD_Approval = 'Approved'
`;

const deanBaseWhereClause = `
    ${deanApprovedExamClause}
    AND r.SessionID = @SessionID
    AND r.SemesterID = @SemesterID
`;

const deanLecturerResubmissionWhereClause = `
    s.faculty = @FacultyID
    AND r.SessionID = @SessionID
    AND r.SemesterID = @SemesterID
    AND r.ResultType = 'Exam'
    AND r.Advisor = 'Approved'
    AND r.HOD_Approval = 'Approved'
    AND r.ResultStatus IN ('Submitted', 'Approved')
`;

const buildDeanLevelRequest = (pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID) => {
    const request = pool.request()
        .input('FacultyID', sql.Int, parseInt(facultyid))
        .input('DepartmentID', sql.Int, parseInt(departmentID))
        .input('ProgrammeID', sql.Int, parseInt(programmeID))
        .input('LevelID', sql.Int, parseInt(levelID));

    if (typeof sessionID !== 'undefined') {
        request.input('SessionID', sql.Int, sessionID);
    }

    if (typeof semesterID !== 'undefined') {
        request.input('SemesterID', sql.Int, semesterID);
    }

    return request;
};

const ensureDeanLevelSelection = (facultyid, departmentID, programmeID, levelID) => {
    if (!facultyid || !departmentID || !programmeID || !levelID) {
        throw errorHandler(400, 'Faculty ID, Department ID, Programme ID, and Level ID are required');
    }
};

const queryDeanPreviousCumulative = async (pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }) => {
    const query = `
        SELECT 
            s.MatNo,
            s.LastName,
            s.OtherNames,
            SUM(CASE WHEN c.course_type = 'C' THEN c.credit_unit ELSE 0 END) AS TotalCoreUnits,
            SUM(c.credit_unit) AS TotalUnitsTaken,
            SUM(CASE WHEN r.Grade != 'F' THEN c.credit_unit ELSE 0 END) AS TotalUnitsPassed,
            SUM(r.GradePoint * c.credit_unit) AS CumulativeGradePoints,
            CASE 
                WHEN SUM(c.credit_unit) > 0 
                THEN CAST(SUM(r.GradePoint * c.credit_unit) / SUM(c.credit_unit) AS DECIMAL(3,2))
                ELSE 0.00
            END AS CGPA,
            SUM(CASE WHEN c.course_type = 'C' AND r.Grade = 'F' THEN c.credit_unit ELSE 0 END) AS CoreUnitsFailed
        FROM dbo.student s
        LEFT JOIN dbo.results r ON s.MatNo = r.MatricNo
        LEFT JOIN dbo.courses c ON r.CourseID = c.course_id
        WHERE s.faculty = @FacultyID
            AND s.LevelID = @LevelID
            AND s.ProgrammeID = @ProgrammeID
            AND s.Department = @DepartmentID
            AND r.ResultType = 'Exam'
            AND r.ResultStatus = 'Approved'
            AND r.Advisor = 'Approved'
            AND r.HOD_Approval = 'Approved'
            AND (
                r.SessionID < @SessionID
                OR (r.SessionID = @SessionID AND r.SemesterID < @SemesterID)
            )
        GROUP BY s.MatNo, s.LastName, s.OtherNames
        ORDER BY s.MatNo
    `;

    const result = await buildDeanLevelRequest(pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID).query(query);
    return result.recordset;
};

const queryDeanCurrentSemesterCourses = async (pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }) => {
    const query = `
        SELECT 
            r.MatricNo,
            s.LastName,
            s.OtherNames,
            c.course_code,
            c.course_title,
            c.course_type,
            c.credit_unit,
            r.TotalScore,
            r.Grade,
            r.GradePoint
        FROM dbo.results r
        INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
        INNER JOIN dbo.courses c ON r.CourseID = c.course_id
        WHERE ${deanBaseWhereClause}
            AND s.Department = @DepartmentID
            AND s.ProgrammeID = @ProgrammeID
            AND s.LevelID = @LevelID
        ORDER BY r.MatricNo, c.course_code
    `;

    const result = await buildDeanLevelRequest(pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID).query(query);

    const studentMap = {};
    result.recordset.forEach((row) => {
        if (!studentMap[row.MatricNo]) {
            studentMap[row.MatricNo] = {
                MatricNo: row.MatricNo,
                LastName: row.LastName,
                OtherNames: row.OtherNames,
                courses: []
            };
        }

        studentMap[row.MatricNo].courses.push({
            CourseCode: row.course_code,
            CourseName: row.course_title,
            CourseType: row.course_type,
            CreditUnits: row.credit_unit,
            TotalScore: row.TotalScore,
            Grade: row.Grade,
            GradePoint: row.GradePoint
        });
    });

    return {
        rows: Object.values(studentMap),
        rawRows: result.recordset
    };
};

const queryDeanSemesterSummary = async (pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }) => {
    const query = `
        SELECT 
            s.MatNo,
            s.LastName,
            s.OtherNames,
            SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID THEN c.credit_unit ELSE 0 END) AS CurrentSemesterUnits,
            SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID AND r.Grade != 'F' THEN c.credit_unit ELSE 0 END) AS CurrentSemesterUnitsPassed,
            SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID THEN r.GradePoint * c.credit_unit ELSE 0 END) AS CurrentSemesterGradePoints,
            CASE 
                WHEN SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID THEN c.credit_unit ELSE 0 END) > 0
                THEN CAST(SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID THEN r.GradePoint * c.credit_unit ELSE 0 END) /
                    SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID THEN c.credit_unit ELSE 0 END) AS DECIMAL(3,2))
                ELSE 0.00
            END AS CurrentGPA,
            SUM(CASE WHEN r.SessionID = @SessionID AND r.SemesterID = @SemesterID AND c.course_type = 'C' AND r.Grade = 'F' THEN c.credit_unit ELSE 0 END) AS CurrentCoreUnitsFailed,
            SUM(c.credit_unit) AS CumulativeUnits,
            SUM(CASE WHEN r.Grade != 'F' THEN c.credit_unit ELSE 0 END) AS CumulativeUnitsPassed,
            SUM(r.GradePoint * c.credit_unit) AS CumulativeGradePoints,
            CASE 
                WHEN SUM(c.credit_unit) > 0
                THEN CAST(SUM(r.GradePoint * c.credit_unit) / SUM(c.credit_unit) AS DECIMAL(3,2))
                ELSE 0.00
            END AS CGPA,
            SUM(CASE WHEN c.course_type = 'C' AND r.Grade = 'F' THEN c.credit_unit ELSE 0 END) AS CumulativeCoreUnitsFailed
        FROM dbo.student s
        LEFT JOIN dbo.results r ON s.MatNo = r.MatricNo
        LEFT JOIN dbo.courses c ON r.CourseID = c.course_id
        WHERE s.faculty = @FacultyID
            AND s.LevelID = @LevelID
            AND s.ProgrammeID = @ProgrammeID
            AND s.Department = @DepartmentID
            AND r.ResultStatus = 'Approved'
            AND r.ResultType = 'Exam'
            AND r.Advisor = 'Approved'
            AND r.HOD_Approval = 'Approved'
            AND (
                r.SessionID < @SessionID
                OR (r.SessionID = @SessionID AND r.SemesterID <= @SemesterID)
            )
        GROUP BY s.MatNo, s.LastName, s.OtherNames
        ORDER BY s.MatNo
    `;

    const result = await buildDeanLevelRequest(pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID).query(query);
    return result.recordset;
};

const queryDeanCarryovers = async (pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }) => {
    const previousSemesterID = semesterID === 2 ? 1 : 2;

    const failedQuery = `
        SELECT DISTINCT
            r.MatricNo,
            s.LastName,
            s.OtherNames,
            c.course_id,
            c.course_code,
            c.course_title,
            c.credit_unit,
            c.semester AS CourseSemester,
            r.TotalScore,
            r.Grade
        FROM dbo.results r
        INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
        INNER JOIN dbo.courses c ON r.CourseID = c.course_id
        WHERE s.faculty = @FacultyID
            AND s.LevelID = @LevelID
            AND s.ProgrammeID = @ProgrammeID
            AND s.Department = @DepartmentID
            AND c.course_type = 'C'
            AND r.Grade = 'F'
            AND r.ResultStatus = 'Approved'
            AND r.ResultType = 'Exam'
            AND r.Advisor = 'Approved'
            AND r.HOD_Approval = 'Approved'
            AND (
                r.SessionID < @SessionID
                OR (r.SessionID = @SessionID AND r.SemesterID < @SemesterID)
            )
            AND NOT EXISTS (
                SELECT 1
                FROM dbo.results r2
                WHERE r2.MatricNo = r.MatricNo
                  AND r2.CourseID = r.CourseID
                  AND r2.Grade != 'F'
                  AND r2.ResultStatus = 'Approved'
                  AND r2.ResultType = 'Exam'
                  AND r2.Advisor = 'Approved'
                  AND r2.HOD_Approval = 'Approved'
            )
            AND EXISTS (
                SELECT 1
                FROM dbo.registration_courses cr
                INNER JOIN dbo.courses c2 ON c2.course_id = cr.course_id
                WHERE cr.mat_no = s.MatNo
                  AND cr.session = @SessionID
            )
        ORDER BY r.MatricNo, c.course_code
    `;

    const missedQuery = `
        SELECT 
            s.MatNo AS MatricNo,
            s.LastName,
            s.OtherNames,
            c.course_id,
            c.course_type,
            c.credit_unit,
            c.course_title,
            c.course_code,
            'Missed' AS CourseStatus
        FROM dbo.student s
        INNER JOIN dbo.courses c ON
            c.course_type = 'C'
            AND c.level_id <= @LevelID
            AND c.semester = @PreviousSemesterID
        WHERE s.faculty = @FacultyID
            AND s.LevelID = @LevelID
            AND s.ProgrammeID = @ProgrammeID
            AND s.Department = @DepartmentID
            AND NOT EXISTS (
                SELECT 1
                FROM dbo.registrated_courses cr
                inner join dbo.courses c2 ON c2.course_id = cr.course_id 
                WHERE cr.mat_no = s.MatNo
                  AND cr.session <= @SessionID
            )
        ORDER BY s.MatNo, c.course_code
    `;

    const failedResult = await buildDeanLevelRequest(pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID).query(failedQuery);
    const missedResult = await buildDeanLevelRequest(pool, facultyid, departmentID, programmeID, levelID, sessionID, semesterID)
        .input('PreviousSemesterID', sql.Int, previousSemesterID)
        .query(missedQuery);

    const studentMap = {};

    failedResult.recordset.forEach((row) => {
        if (!studentMap[row.MatricNo]) {
            studentMap[row.MatricNo] = {
                MatricNo: row.MatricNo,
                LastName: row.LastName,
                OtherNames: row.OtherNames,
                failedCourses: [],
                missedCourses: []
            };
        }

        studentMap[row.MatricNo].failedCourses.push({
            CourseID: row.course_id,
            CourseCode: row.course_code,
            CourseName: row.course_title,
            CreditUnits: row.credit_unit,
            CourseSemester: row.CourseSemester,
            TotalScore: row.TotalScore,
            Grade: row.Grade
        });
    });

    missedResult.recordset.forEach((row) => {
        if (!studentMap[row.MatricNo]) {
            studentMap[row.MatricNo] = {
                MatricNo: row.MatricNo,
                LastName: row.LastName,
                OtherNames: row.OtherNames,
                failedCourses: [],
                missedCourses: []
            };
        }

        studentMap[row.MatricNo].missedCourses.push({
            CourseID: row.course_id,
            CourseCode: row.course_code,
            CourseName: row.course_title,
            CreditUnits: row.credit_unit,
            CourseType: row.course_type
        });
    });

    return {
        rows: Object.values(studentMap),
        failedCarryovers: failedResult.recordset,
        missedCarryovers: missedResult.recordset
    };
};

export const getDeanDashboardStats = async (req, res, next) => {
    const facultyid = req.user.departmentID;

    if (!facultyid) {
        return next(errorHandler(400, 'Faculty ID is required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const registrationQuery = `
            SELECT COUNT(DISTINCT cr.mat_no) AS RegisteredStudents
            FROM dbo.course_registrations cr
            INNER JOIN dbo.student s ON cr.mat_no = s.MatNo
            WHERE s.faculty = @FacultyID
              AND cr.session = @SessionID
        `;

        const courseStatsQuery = `
            WITH RegisteredCourses AS (
                SELECT DISTINCT
                    cr.course_id AS CourseID
                FROM dbo.registrated_courses cr
                INNER JOIN dbo.student s ON cr.mat_no = s.MatNo
                INNER JOIN dbo.courses c ON c.course_id = cr.course_id
                WHERE s.faculty = @FacultyID
                  AND cr.session = @SessionID
                  AND c.semester = @SemesterID
            ),
            CourseSubmissionStatus AS (
                SELECT
                    r.CourseID,
                    CASE
                        WHEN SUM(CASE WHEN r.ResultStatus IN ('Submitted', 'Approved') THEN 1 ELSE 0 END) > 0 THEN 1
                        ELSE 0
                    END AS HasSubmittedStatus
                FROM dbo.results r
                INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
                WHERE s.faculty = @FacultyID
                  AND r.SessionID = @SessionID
                  AND r.SemesterID = @SemesterID
                  AND r.ResultType = 'Exam'
                GROUP BY r.CourseID
            )
            SELECT
                COUNT(*) AS TotalCourses,
                SUM(CASE WHEN ISNULL(css.HasSubmittedStatus, 0) = 1 THEN 1 ELSE 0 END) AS SubmittedResults,
                SUM(CASE WHEN ISNULL(css.HasSubmittedStatus, 0) = 0 THEN 1 ELSE 0 END) AS PendingResults
            FROM RegisteredCourses rc
            LEFT JOIN CourseSubmissionStatus css ON css.CourseID = rc.CourseID
        `;

        const registrationResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .query(registrationQuery);

        const courseStatsResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(courseStatsQuery);

        const registrationStats = registrationResult.recordset[0] || {};
        const courseStats = courseStatsResult.recordset[0] || {};

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            stats: {
                RegisteredStudents: Number(registrationStats.RegisteredStudents || 0),
                TotalCourses: Number(courseStats.TotalCourses || 0),
                SubmittedResults: Number(courseStats.SubmittedResults || 0),
                PendingResults: Number(courseStats.PendingResults || 0)
            }
        });
    } catch (error) {
        console.error('Error fetching dean stats:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean stats: ' + error.message));
    }
};

export const getDeanAvailableFilters = async (req, res, next) => {
    const facultyid = req.user.departmentID;

    if (!facultyid) {
        return next(errorHandler(400, 'Faculty ID is required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const departmentsQuery = `
            SELECT DISTINCT
                d.DepartmentID,
                d.DepartmentName
            FROM dbo.appDepartment d
            INNER JOIN dbo.student s ON d.DepartmentID = s.department
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE ${deanBaseWhereClause}
            ORDER BY d.DepartmentName
        `;

        const programmesQuery = `
            SELECT DISTINCT
                p.ProgrammeID,
                p.ProgrammeName
            FROM dbo.Programmes p
            INNER JOIN dbo.student s ON p.ProgrammeID = s.ProgrammeID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE ${deanBaseWhereClause}
            ORDER BY p.ProgrammeName
        `;

        const levelsQuery = `
            SELECT DISTINCT
                l.LevelID,
                l.LevelName
            FROM dbo.levels l
            INNER JOIN dbo.student s ON l.LevelID = s.LevelID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE ${deanBaseWhereClause}
            ORDER BY l.LevelID
        `;

        const departmentsResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(departmentsQuery);

        const programmesResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(programmesQuery);

        const levelsResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(levelsQuery);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            departments: departmentsResult.recordset,
            programmes: programmesResult.recordset,
            levels: levelsResult.recordset
        });
    } catch (error) {
        console.error('Error fetching dean filters:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean filters: ' + error.message));
    }
};

export const getDeanLevelResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.query;

    if (!facultyid) {
        return next(errorHandler(400, 'Faculty ID is required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const filters = [];

        if (departmentID) {
            filters.push('s.Department = @DepartmentID');
        }

        if (programmeID) {
            filters.push('s.ProgrammeID = @ProgrammeID');
        }

        if (levelID) {
            filters.push('s.LevelID = @LevelID');
        }

        const levelResultsQuery = `
            SELECT
                s.Department AS DepartmentID,
                d.DepartmentName,
                s.ProgrammeID,
                p.ProgrammeName,
                s.LevelID,
                l.LevelName,
                COUNT(DISTINCT r.MatricNo) AS StudentCount,
                SUM(CASE WHEN ISNULL(r.Bsc_Approval, 'Pending') = 'Pending' THEN 1 ELSE 0 END) AS PendingRows,
                SUM(CASE WHEN r.Bsc_Approval = 'Approved' THEN 1 ELSE 0 END) AS ApprovedRows,
                SUM(CASE WHEN r.Bsc_Approval = 'Rejected' THEN 1 ELSE 0 END) AS RejectedRows,
                CASE
                    WHEN SUM(CASE WHEN r.Bsc_Approval = 'Rejected' THEN 1 ELSE 0 END) > 0 THEN 'Rejected'
                    WHEN SUM(CASE WHEN ISNULL(r.Bsc_Approval, 'Pending') = 'Pending' THEN 1 ELSE 0 END) > 0 THEN 'Pending'
                    WHEN SUM(CASE WHEN r.Bsc_Approval = 'Approved' THEN 1 ELSE 0 END) > 0 THEN 'Approved'
                    ELSE 'Pending'
                END AS BatchStatus
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.appDepartment d ON s.Department = d.DepartmentID
            INNER JOIN dbo.Programmes p ON s.ProgrammeID = p.ProgrammeID
            INNER JOIN dbo.levels l ON s.LevelID = l.LevelID
            WHERE ${deanBaseWhereClause}
            ${filters.length > 0 ? `AND ${filters.join(' AND ')}` : ''}
            GROUP BY s.Department, d.DepartmentName, s.ProgrammeID, p.ProgrammeName, s.LevelID, l.LevelName
            ORDER BY d.DepartmentName, p.ProgrammeName, s.LevelID
        `;

        const request = pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID);

        if (departmentID) {
            request.input('DepartmentID', sql.Int, parseInt(departmentID));
        }

        if (programmeID) {
            request.input('ProgrammeID', sql.Int, parseInt(programmeID));
        }

        if (levelID) {
            request.input('LevelID', sql.Int, parseInt(levelID));
        }

        const result = await request.query(levelResultsQuery);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            results: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching dean level results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean level results: ' + error.message));
    }
};

export const getDeanLevelResultDetails = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.query;

    if (!facultyid || !departmentID || !programmeID || !levelID) {
        return next(errorHandler(400, 'Faculty ID, Department ID, Programme ID, and Level ID are required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const query = `
            SELECT
                r.CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseTitle,
                r.SubmittedBy AS LecturerID,
                CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
                COUNT(DISTINCT r.MatricNo) AS StudentCount,
                SUM(CASE WHEN ISNULL(r.Bsc_Approval, 'Pending') = 'Pending' THEN 1 ELSE 0 END) AS PendingRows,
                SUM(CASE WHEN r.Bsc_Approval = 'Approved' THEN 1 ELSE 0 END) AS ApprovedRows,
                SUM(CASE WHEN r.Bsc_Approval = 'Rejected' THEN 1 ELSE 0 END) AS RejectedRows,
                MAX(r.SubmittedDate) AS SubmittedDate,
                CASE
                    WHEN SUM(CASE WHEN r.Bsc_Approval = 'Rejected' THEN 1 ELSE 0 END) > 0 THEN 'Rejected'
                    WHEN SUM(CASE WHEN ISNULL(r.Bsc_Approval, 'Pending') = 'Pending' THEN 1 ELSE 0 END) > 0 THEN 'Pending'
                    WHEN SUM(CASE WHEN r.Bsc_Approval = 'Approved' THEN 1 ELSE 0 END) > 0 THEN 'Approved'
                    ELSE 'Pending'
                END AS Status
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            LEFT JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
            WHERE ${deanBaseWhereClause}
              AND s.Department = @DepartmentID
              AND s.ProgrammeID = @ProgrammeID
              AND s.LevelID = @LevelID
            GROUP BY
                r.CourseID,
                c.course_code,
                c.course_title,
                r.SubmittedBy,
                CONCAT(staff.LastName, ' ', staff.OtherNames)
            ORDER BY c.course_code ASC
        `;

        const detailResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid ))
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ProgrammeID', sql.Int, parseInt(programmeID))
            .input('LevelID', sql.Int, parseInt(levelID))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            summary: {
                departmentID: parseInt(departmentID),
                programmeID: parseInt(programmeID),
                levelID: parseInt(levelID),
                courseCount: detailResult.recordset.length,
                studentCount: detailResult.recordset.reduce((total, row) => total + (row.StudentCount || 0), 0)
            },
            results: detailResult.recordset
        });
    } catch (error) {
        console.error('Error fetching dean level result details:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean level result details: ' + error.message));
    }
};

export const approveDeanLevelResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    if (!facultyid   || !departmentID || !programmeID || !levelID) {
        return next(errorHandler(400, 'Faculty ID, Department ID, Programme ID, and Level ID are required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);

        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE ${deanBaseWhereClause}
              AND s.Department = @DepartmentID
              AND s.ProgrammeID = @ProgrammeID
              AND s.LevelID = @LevelID
              AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ProgrammeID', sql.Int, parseInt(programmeID))
            .input('LevelID', sql.Int, parseInt(levelID))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return next(errorHandler(404, 'No pending level results found to approve'));
        }

        const updateQuery = `
            UPDATE r
            SET r.Bsc_Approval = 'Approved'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE ${deanBaseWhereClause}
              AND s.Department = @DepartmentID
              AND s.ProgrammeID = @ProgrammeID
              AND s.LevelID = @LevelID
              AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ProgrammeID', sql.Int, parseInt(programmeID))
            .input('LevelID', sql.Int, parseInt(levelID))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results approved successfully by Dean',
            recordsUpdated: updateResult.rowsAffected[0]
        });
    } catch (error) {
        console.error('Error approving dean level results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error approving dean level results: ' + error.message));
    }
};

export const rejectDeanLevelResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    if (!facultyid || !departmentID || !programmeID || !levelID) {
        return next(errorHandler(400, 'Faculty ID, Department ID, Programme ID, and Level ID are required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);

        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE ${deanBaseWhereClause}
              AND s.Department = @DepartmentID
              AND s.ProgrammeID = @ProgrammeID
              AND s.LevelID = @LevelID
              AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ProgrammeID', sql.Int, parseInt(programmeID))
            .input('LevelID', sql.Int, parseInt(levelID))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return next(errorHandler(404, 'No pending level results found to reject'));
        }

        const updateQuery = `
            UPDATE r
            SET r.Bsc_Approval = 'Rejected'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE ${deanBaseWhereClause}
              AND s.Department = @DepartmentID
              AND s.ProgrammeID = @ProgrammeID
              AND s.LevelID = @LevelID
              AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ProgrammeID', sql.Int, parseInt(programmeID))
            .input('LevelID', sql.Int, parseInt(levelID))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results rejected by Dean',
            recordsUpdated: updateResult.rowsAffected[0]
        });
    } catch (error) {
        console.error('Error rejecting dean level results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error rejecting dean level results: ' + error.message));
    }
};

export const getDeanLecturerResubmissions = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.query;

    if (!facultyid) {
        return next(errorHandler(400, 'Faculty ID is required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const filters = [];

        if (departmentID) {
            filters.push('s.Department = @DepartmentID');
        }

        if (programmeID) {
            filters.push('s.ProgrammeID = @ProgrammeID');
        }

        if (levelID) {
            filters.push('s.LevelID = @LevelID');
        }

        const query = `
            SELECT
                r.CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseTitle,
                r.SubmittedBy AS LecturerID,
                CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
                s.Department AS DepartmentID,
                d.DepartmentName,
                s.ProgrammeID,
                p.ProgrammeName,
                s.LevelID,
                l.LevelName,
                COUNT(DISTINCT r.MatricNo) AS StudentCount,
                MAX(r.SubmittedDate) AS SubmittedDate,
                CASE
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Approved' THEN 1 ELSE 0 END) > 0 THEN 'Approved'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Submitted' THEN 1 ELSE 0 END) > 0 THEN 'Submitted'
                    ELSE COALESCE(MAX(r.ResultStatus), 'N/A')
                END AS ResultStatus
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.appDepartment d ON s.Department = d.DepartmentID
            INNER JOIN dbo.Programmes p ON s.ProgrammeID = p.ProgrammeID
            INNER JOIN dbo.levels l ON s.LevelID = l.LevelID
            LEFT JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
            WHERE ${deanLecturerResubmissionWhereClause}
              AND r.SubmittedBy IS NOT NULL
              ${filters.length > 0 ? `AND ${filters.join(' AND ')}` : ''}
            GROUP BY
                r.CourseID,
                c.course_code,
                c.course_title,
                r.SubmittedBy,
                CONCAT(staff.LastName, ' ', staff.OtherNames),
                s.Department,
                d.DepartmentName,
                s.ProgrammeID,
                p.ProgrammeName,
                s.LevelID,
                l.LevelName
            ORDER BY MAX(r.SubmittedDate) DESC, c.course_code ASC
        `;

        const request = pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID);

        if (departmentID) {
            request.input('DepartmentID', sql.Int, parseInt(departmentID));
        }

        if (programmeID) {
            request.input('ProgrammeID', sql.Int, parseInt(programmeID));
        }

        if (levelID) {
            request.input('LevelID', sql.Int, parseInt(levelID));
        }

        const result = await request.query(query);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            results: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching dean lecturer resubmissions:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean lecturer resubmissions: ' + error.message));
    }
};

export const getDeanLecturerSubmissionTimeline = async (req, res, next) => {
    const facultyid = req.user.departmentID;

    if (!facultyid) {
        return next(errorHandler(400, 'Faculty ID is required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const query = `
            SELECT
                r.CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseTitle,
                r.SubmittedBy AS LecturerID,
                CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
                d.DepartmentName,
                p.ProgrammeName,
                l.LevelName,
                COUNT(DISTINCT r.MatricNo) AS StudentCount,
                MAX(r.SubmittedDate) AS SubmittedDate,
                CASE
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Rejected' THEN 1 ELSE 0 END) > 0 THEN 'Rejected'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Approved' THEN 1 ELSE 0 END) > 0 THEN 'Approved'
                    WHEN SUM(CASE WHEN r.ResultStatus = 'Submitted' THEN 1 ELSE 0 END) > 0 THEN 'Submitted'
                    ELSE COALESCE(MAX(r.ResultStatus), 'N/A')
                END AS SubmissionStatus
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.appDepartment d ON s.Department = d.DepartmentID
            INNER JOIN dbo.Programmes p ON s.ProgrammeID = p.ProgrammeID
            INNER JOIN dbo.levels l ON s.LevelID = l.LevelID
            LEFT JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
            WHERE s.faculty = @FacultyID
              AND r.SessionID = @SessionID
              AND r.SemesterID = @SemesterID
              AND r.ResultType = 'Exam'
              AND r.SubmittedBy IS NOT NULL
              AND r.SubmittedDate IS NOT NULL
              AND r.Advisor = 'Approved'
              AND r.ResultStatus IN ('Submitted', 'Approved', 'Rejected')
            GROUP BY
                r.CourseID,
                c.course_code,
                c.course_title,
                r.SubmittedBy,
                CONCAT(staff.LastName, ' ', staff.OtherNames),
                d.DepartmentName,
                p.ProgrammeName,
                l.LevelName
            ORDER BY MAX(r.SubmittedDate) DESC, c.course_code ASC
        `;

        const result = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            results: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching dean lecturer submission timeline:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean lecturer submission timeline: ' + error.message));
    }
};

export const getDeanLecturerResubmissionDetails = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { courseID, lecturerID } = req.query;

    if (!facultyid || !courseID || !lecturerID) {
        return next(errorHandler(400, 'Faculty ID, Course ID, and Lecturer ID are required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const query = `
            SELECT
                r.ResultID,
                r.MatricNo,
                CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
                r.CA_Score,
                r.Exam_Score,
                r.TotalScore,
                r.Grade,
                r.GradePoint,
                r.ResultStatus,
                r.HOD_Approval,
                r.Bsc_Approval,
                r.SubmittedDate
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
                        WHERE ${deanLecturerResubmissionWhereClause}
              AND r.CourseID = @CourseID
              AND r.SubmittedBy = @LecturerID
            ORDER BY r.MatricNo ASC
        `;

        const detailResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('LecturerID', sql.VarChar, lecturerID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            results: detailResult.recordset,
            count: detailResult.recordset.length
        });
    } catch (error) {
        console.error('Error fetching dean lecturer resubmission details:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean lecturer resubmission details: ' + error.message));
    }
};

export const reopenDeanLecturerResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { courseID, lecturerID } = req.body;

    if (!facultyid || !courseID || !lecturerID) {
        return next(errorHandler(400, 'Faculty ID, Course ID, and Lecturer ID are required'));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);

        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
                        WHERE ${deanLecturerResubmissionWhereClause}
              AND r.CourseID = @CourseID
              AND r.SubmittedBy = @LecturerID
        `;

        const checkResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('LecturerID', sql.VarChar, lecturerID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return next(errorHandler(404, 'No dean-eligible lecturer results found to reopen'));
        }

        const updateQuery = `
            UPDATE r
            SET r.ResultStatus = 'Rejected',
                r.HOD_Approval = 'Pending',
                r.Bsc_Approval = 'Pending'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE ${deanLecturerResubmissionWhereClause}
              AND r.CourseID = @CourseID
              AND r.SubmittedBy = @LecturerID
        `;

        const updateResult = await pool.request()
            .input('FacultyID', sql.Int, parseInt(facultyid))
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('LecturerID', sql.VarChar, lecturerID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Lecturer results reopened for correction and resubmission',
            recordsUpdated: updateResult.rowsAffected[0]
        });
    } catch (error) {
        console.error('Error reopening lecturer results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error reopening lecturer results: ' + error.message));
    }
};

export const getDeanPreviousCumulativeResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    try {
        ensureDeanLevelSelection(facultyid, departmentID, programmeID, levelID);

        const pool = await poolPromise;
        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);
        const data = await queryDeanPreviousCumulative(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID });

        return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
        console.error('Error fetching dean previous cumulative results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean previous cumulative results: ' + error.message));
    }
};

export const getDeanCurrentSemesterCourses = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    try {
        ensureDeanLevelSelection(facultyid, departmentID, programmeID, levelID);

        const pool = await poolPromise;
        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);
        const data = await queryDeanCurrentSemesterCourses(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID });

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            students: data.rows,
            count: data.rows.length
        });
    } catch (error) {
        console.error('Error fetching dean current semester courses:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean current semester courses: ' + error.message));
    }
};

export const getDeanSemesterSummary = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    try {
        ensureDeanLevelSelection(facultyid, departmentID, programmeID, levelID);

        const pool = await poolPromise;
        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);
        const data = await queryDeanSemesterSummary(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID });

        return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
        console.error('Error fetching dean semester summary:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean semester summary: ' + error.message));
    }
};

export const getDeanPreviousSemesterCarryovers = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.body;

    try {
        ensureDeanLevelSelection(facultyid, departmentID, programmeID, levelID);

        const pool = await poolPromise;
        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, semesterID } = await getActiveSessionAndSemester(pool);
        const data = await queryDeanCarryovers(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID });

        return res.status(200).json({
            success: true,
            students: data.rows,
            failedCarryovers: data.failedCarryovers,
            missedCarryovers: data.missedCarryovers,
            count: data.rows.length
        });
    } catch (error) {
        console.error('Error fetching dean carryovers:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error fetching dean carryovers: ' + error.message));
    }
};

export const downloadDeanLevelResults = async (req, res, next) => {
    const facultyid = req.user.departmentID;
    const { departmentID, programmeID, levelID } = req.query;

    try {
        ensureDeanLevelSelection(facultyid, departmentID, programmeID, levelID);

        const pool = await poolPromise;
        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'));
        }

        const { sessionID, sessionName, semesterID, semesterName } = await getActiveSessionAndSemester(pool);

        const [previousCumulative, currentCourses, semesterSummary, carryovers] = await Promise.all([
            queryDeanPreviousCumulative(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }),
            queryDeanCurrentSemesterCourses(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }),
            queryDeanSemesterSummary(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID }),
            queryDeanCarryovers(pool, { facultyid, departmentID, programmeID, levelID, sessionID, semesterID })
        ]);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GitHub Copilot';
        workbook.created = new Date();

        const previousSheet = workbook.addWorksheet('Previous Cumulative');
        previousSheet.columns = [
            { header: 'Matric No', key: 'MatNo', width: 18 },
            { header: 'Core Units', key: 'TotalCoreUnits', width: 14 },
            { header: 'Total Units', key: 'TotalUnitsTaken', width: 14 },
            { header: 'Units Passed', key: 'TotalUnitsPassed', width: 14 },
            { header: 'Cum. Points', key: 'CumulativeGradePoints', width: 14 },
            { header: 'CGPA', key: 'CGPA', width: 10 },
            { header: 'O/S', key: 'CoreUnitsFailed', width: 10 }
        ];
        previousCumulative.forEach((row) => previousSheet.addRow(row));

        const currentSheet = workbook.addWorksheet('Current Courses');
        currentSheet.columns = [
            { header: 'Matric No', key: 'MatricNo', width: 18 },
            { header: 'Name', key: 'StudentName', width: 28 },
            { header: 'Course Code', key: 'CourseCode', width: 16 },
            { header: 'Course Title', key: 'CourseTitle', width: 32 },
            { header: 'Units', key: 'CreditUnits', width: 10 },
            { header: 'Type', key: 'CourseType', width: 10 },
            { header: 'Total Score', key: 'TotalScore', width: 12 },
            { header: 'Grade', key: 'Grade', width: 10 },
            { header: 'Grade Point', key: 'GradePoint', width: 12 }
        ];
        currentCourses.rawRows.forEach((row) => {
            currentSheet.addRow({
                MatricNo: row.MatricNo,
                StudentName: `${row.LastName} ${row.OtherNames}`,
                CourseCode: row.course_code,
                CourseTitle: row.course_title,
                CreditUnits: row.credit_unit,
                CourseType: row.course_type,
                TotalScore: row.TotalScore,
                Grade: row.Grade,
                GradePoint: row.GradePoint
            });
        });

        const summarySheet = workbook.addWorksheet('Semester Summary');
        summarySheet.columns = [
            { header: 'Matric No', key: 'MatNo', width: 18 },
            { header: 'Name', key: 'FullName', width: 28 },
            { header: 'Current Units', key: 'CurrentSemesterUnits', width: 14 },
            { header: 'Current Passed', key: 'CurrentSemesterUnitsPassed', width: 14 },
            { header: 'Current GP', key: 'CurrentSemesterGradePoints', width: 14 },
            { header: 'Current GPA', key: 'CurrentGPA', width: 12 },
            { header: 'Current O/S', key: 'CurrentCoreUnitsFailed', width: 12 },
            { header: 'Cumulative Units', key: 'CumulativeUnits', width: 16 },
            { header: 'Cumulative Passed', key: 'CumulativeUnitsPassed', width: 16 },
            { header: 'Cumulative GP', key: 'CumulativeGradePoints', width: 16 },
            { header: 'CGPA', key: 'CGPA', width: 10 },
            { header: 'Cumulative O/S', key: 'CumulativeCoreUnitsFailed', width: 14 }
        ];
        semesterSummary.forEach((row) => {
            summarySheet.addRow({
                ...row,
                FullName: `${row.LastName} ${row.OtherNames}`
            });
        });

        const carryoverSheet = workbook.addWorksheet('Carryovers');
        carryoverSheet.columns = [
            { header: 'Matric No', key: 'MatricNo', width: 18 },
            { header: 'Name', key: 'StudentName', width: 28 },
            { header: 'Failed Carryovers', key: 'FailedCarryovers', width: 40 },
            { header: 'Missed Carryovers', key: 'MissedCarryovers', width: 40 }
        ];
        carryovers.rows.forEach((row) => {
            carryoverSheet.addRow({
                MatricNo: row.MatricNo,
                StudentName: `${row.LastName} ${row.OtherNames}`,
                FailedCarryovers: row.failedCourses.map((course) => course.CourseCode).join(', '),
                MissedCarryovers: row.missedCourses.map((course) => course.CourseCode).join(', ')
            });
        });

        const fileName = `Dean_Level_Results_${sessionName}_${semesterName}.xlsx`.replace(/\s+/g, '_');
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error downloading dean level results:', error);
        return next(error.statusCode ? error : errorHandler(500, 'Error downloading dean level results: ' + error.message));
    }
};