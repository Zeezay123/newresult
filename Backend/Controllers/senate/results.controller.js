import { count } from 'console';
import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';
import ExcelJS from 'exceljs';

// Get available departments, programmes and levels with HOD-approved results
export const getAvailableFilters = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if (activeSessionResult.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;
        const sessionName = activeSessionResult.recordset[0].SessionName;

        // Get active semester
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;
        const semesterName = activeSemesterResult.recordset[0].SemesterName;

        // Get departments with HOD-approved results
        const departmentsQuery = `
            SELECT DISTINCT 
                d.DepartmentID,
                d.DepartmentName,
                COUNT(DISTINCT s.MatNo) as StudentCount
            FROM dbo.appDepartment d
            INNER JOIN dbo.student s ON d.DepartmentID = s.department
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            GROUP BY d.DepartmentID, d.DepartmentName
            ORDER BY d.DepartmentName
        `;

        const departmentsResult = await pool.request()
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(departmentsQuery);

        // Get programmes with HOD-approved results
        const programmesQuery = `
            SELECT DISTINCT 
                p.ProgrammeID,
                p.ProgrammeName,
                COUNT(DISTINCT s.MatNo) as StudentCount
            FROM dbo.Programmes p
            INNER JOIN dbo.student s ON p.ProgrammeID = s.ProgrammeID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            GROUP BY p.ProgrammeID, p.ProgrammeName
            ORDER BY p.ProgrammeName
        `;

        const programmesResult = await pool.request()
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(programmesQuery);

        // Get levels with HOD-approved results
        const levelsQuery = `
            SELECT DISTINCT 
                l.LevelID,
                l.LevelName,
                COUNT(DISTINCT s.MatNo) as StudentCount
            FROM dbo.levels l
            INNER JOIN dbo.student s ON l.LevelID = s.LevelID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            GROUP BY l.LevelID, l.LevelName
            ORDER BY l.LevelID
        `;

        const levelsResult = await pool.request()
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
        console.error('Error fetching filters:', error);
        return next(errorHandler(500, 'Error fetching filters: ' + error.message));
    }
};

// Get level results for Senate review (HOD-approved results)
export const getLevelResults = async (req, res, next) => {
    const { departmentID, programmeID, levelID } = req.query;

    if (!departmentID) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    if (!levelID) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if (activeSessionResult.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;
        const sessionName = activeSessionResult.recordset[0].SessionName;

        // Get active semester
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;
        const semesterName = activeSemesterResult.recordset[0].SemesterName;

        // Get results with courses
        const query = `
            SELECT
                r.MatricNo,
                s.LastName,
                s.OtherNames,
                c.course_id AS CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseName,
                c.credit_unit AS CreditUnits,
                c.course_type AS CourseType,
                r.TotalScore,
                r.Grade,
                r.GradePoint
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            ORDER BY r.MatricNo, c.course_code
        `;

        const result = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        // Group results by student
        const studentsMap = new Map();
        result.recordset.forEach(row => {
            if (!studentsMap.has(row.MatricNo)) {
                studentsMap.set(row.MatricNo, {
                    MatricNo: row.MatricNo,
                    StudentName: `${row.LastName} ${row.OtherNames}`,
                    GPA: null,
                    CGPA: null,
                    TotalCreditUnits: 0,
                    TotalCreditUnitsPassed: 0,
                    TotalCreditUnitsFailed: 0,
                    courses: []
                });
            }

            const student = studentsMap.get(row.MatricNo);
            student.TotalCreditUnits += Number(row.CreditUnits || 0);
            if (row.Grade !== 'F') {
                student.TotalCreditUnitsPassed += Number(row.CreditUnits || 0);
            } else if (row.CourseType === 'C') {
                student.TotalCreditUnitsFailed += Number(row.CreditUnits || 0);
            }

            student.courses.push({
                CourseCode: row.CourseCode,
                CourseName: row.CourseName,
                CreditUnits: row.CreditUnits,
                CourseType: row.CourseType,
                TotalScore: row.TotalScore,
                Grade: row.Grade,
                GradePoint: row.GradePoint
            });
        });

        studentsMap.forEach((student) => {
            const totalGradePoints = student.courses.reduce(
                (sum, course) => sum + Number(course.GradePoint || 0) * Number(course.CreditUnits || 0),
                0
            );
            student.GPA = student.TotalCreditUnits > 0
                ? Number((totalGradePoints / student.TotalCreditUnits).toFixed(2))
                : 0;
            student.CGPA = student.GPA;
        });

        return res.status(200).json({
            success: true,
            session: sessionName,
            semester: semesterName,
            students: Array.from(studentsMap.values()),
            count: studentsMap.size
        });

    } catch (error) {
        console.error('Error fetching level results:', error);
        return next(errorHandler(500, 'Error fetching level results: ' + error.message));
    }
};

// Download level results as Excel
export const downloadLevelResults = async (req, res, next) => {
    const { departmentID, programmeID, levelID } = req.query;

    if (!departmentID) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    if (!levelID) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if (activeSessionResult.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;
        const sessionName = activeSessionResult.recordset[0].SessionName;

        // Get active semester
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;
        const semesterName = activeSemesterResult.recordset[0].SemesterName;

        // Get department, programme and level info
        const infoQuery = `
            SELECT d.DepartmentName, p.ProgrammeName, l.LevelName
            FROM dbo.appdepartment d, dbo.programmes p, dbo.levels l
            WHERE d.DepartmentID = @DepartmentID 
                AND p.ProgrammeID = @ProgrammeID 
                AND l.LevelID = @LevelID
        `;

        const infoResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('LevelID', sql.Int, levelID)
            .query(infoQuery);

        const departmentName = infoResult.recordset[0]?.DepartmentName || 'Unknown';
        const programmeName = infoResult.recordset[0]?.ProgrammeName || 'Unknown';
        const levelName = infoResult.recordset[0]?.LevelName || 'Unknown';

        // Get results with courses
        const query = `
            SELECT
                r.MatricNo,
                s.LastName,
                s.OtherNames,
                c.course_id AS CourseID,
                c.course_code AS CourseCode,
                c.course_title AS CourseName,
                c.credit_unit AS CreditUnits,
                c.course_type AS CourseType,
                r.TotalScore,
                r.Grade,
                r.GradePoint
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            ORDER BY r.MatricNo, c.course_code
        `;

        const result = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(query);

        if (result.recordset.length === 0) {
            return next(errorHandler(404, "No results found"));
        }

        // Group results by student
        const studentsMap = new Map();
        result.recordset.forEach(row => {
            if (!studentsMap.has(row.MatricNo)) {
                studentsMap.set(row.MatricNo, {
                    MatricNo: row.MatricNo,
                    StudentName: `${row.LastName} ${row.OtherNames}`,
                    GPA: null,
                    CGPA: null,
                    TotalCreditUnits: 0,
                    TotalCreditUnitsPassed: 0,
                    TotalCreditUnitsFailed: 0,
                    courses: []
                });
            }

            const student = studentsMap.get(row.MatricNo);
            student.TotalCreditUnits += Number(row.CreditUnits || 0);
            if (row.Grade !== 'F') {
                student.TotalCreditUnitsPassed += Number(row.CreditUnits || 0);
            } else if (row.CourseType === 'C') {
                student.TotalCreditUnitsFailed += Number(row.CreditUnits || 0);
            }

            student.courses.push({
                CourseCode: row.CourseCode,
                CourseName: row.CourseName,
                CreditUnits: row.CreditUnits,
                CourseType: row.CourseType,
                TotalScore: row.TotalScore,
                Grade: row.Grade,
                GradePoint: row.GradePoint
            });
        });

        studentsMap.forEach((student) => {
            const totalGradePoints = student.courses.reduce(
                (sum, course) => sum + Number(course.GradePoint || 0) * Number(course.CreditUnits || 0),
                0
            );
            student.GPA = student.TotalCreditUnits > 0
                ? Number((totalGradePoints / student.TotalCreditUnits).toFixed(2))
                : 0;
            student.CGPA = student.GPA;
        });

        const students = Array.from(studentsMap.values());

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Senate Results');

        // Add header information
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `${departmentName} - ${programmeName}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:E2');
        worksheet.getCell('A2').value = `${levelName} - ${semesterName} Semester, ${sessionName}`;
        worksheet.getCell('A2').font = { bold: true, size: 12 };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.addRow([]);

        // Get all unique courses
        const allCourses = [];
        const courseSet = new Set();
        students.forEach(student => {
            student.courses.forEach(course => {
                if (!courseSet.has(course.CourseCode)) {
                    courseSet.add(course.CourseCode);
                    allCourses.push(course);
                }
            });
        });

        // Create header row
        const headerRow = ['S/N', 'Matric No', 'Student Name'];
        allCourses.forEach(course => {
            headerRow.push(`${course.CourseCode} (${course.CreditUnits}U)`);
        });
        headerRow.push('GPA', 'CGPA', 'Units Taken', 'Units Passed', 'Units Failed');

        worksheet.addRow(headerRow);
        const headerRowNumber = worksheet.lastRow.number;
        worksheet.getRow(headerRowNumber).font = { bold: true };
        worksheet.getRow(headerRowNumber).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add student data
        students.forEach((student, index) => {
            const row = [index + 1, student.MatricNo, student.StudentName];
            
            // Add course scores
            allCourses.forEach(course => {
                const studentCourse = student.courses.find(c => c.CourseCode === course.CourseCode);
                if (studentCourse) {
                    row.push(`${studentCourse.TotalScore} (${studentCourse.Grade})`);
                } else {
                    row.push('-');
                }
            });

            // Add GPA/CGPA and units
            row.push(
                student.GPA ? student.GPA.toFixed(2) : '0.00',
                student.CGPA ? student.CGPA.toFixed(2) : '0.00',
                student.TotalCreditUnits || 0,
                student.TotalCreditUnitsPassed || 0,
                student.TotalCreditUnitsFailed || 0
            );

            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        // Set response headers
        const filename = `${departmentName}_${levelName}_Results_${sessionName}_${semesterName}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error downloading level results:', error);
        return next(errorHandler(500, 'Error downloading level results: ' + error.message));
    }
};

// Approve level results (Senate final approval)
export const approveLevelResults = async (req, res, next) => {
    const { departmentID, programmeID, levelID } = req.body;

    if (!departmentID) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    if (!levelID) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if (activeSessionResult.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;

        // Get active semester
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;

        // Check if there are results to approve
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return next(errorHandler(404, "No results found to approve"));
        }

        // Update results to approved
        const updateQuery = `
            UPDATE r
            SET r.Bsc_Approval = 'Approved'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results approved successfully by Senate',
            recordsUpdated: updateResult.rowsAffected[0]
        });

    } catch (error) {
        console.error('Error approving level results:', error);
        return next(errorHandler(500, 'Error approving level results: ' + error.message));
    }
};

// Reject level results
export const rejectLevelResults = async (req, res, next) => {
    const { departmentID, programmeID, levelID } = req.body;

    if (!departmentID) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    if (!levelID) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if (activeSessionResult.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const sessionID = activeSessionResult.recordset[0].SessionID;

        // Get active semester
        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemesterResult.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const semesterID = activeSemesterResult.recordset[0].SemesterID;
        // Check if there are results to reject
        const checkQuery = `
            SELECT COUNT(*) as count
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return next(errorHandler(404, "No results found to reject"));
        }

        // Update results to rejected
        const updateQuery = `
            UPDATE r
            SET r.Bsc_Approval = 'Rejected'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.Department = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
                AND (r.Bsc_Approval IS NULL OR r.Bsc_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentID)
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results rejected by Senate',
            recordsUpdated: updateResult.rowsAffected[0]
        });

    } catch (error) {
        console.error('Error rejecting level results:', error);
        return next(errorHandler(500, 'Error rejecting level results: ' + error.message));
    }
};


export const getPreviousCumulative = async (req, res, next) => {

    const { departmentID, programmeID, levelID } = req.body;

    console.log(departmentID,programmeID,levelID)

    if (!departmentID || !programmeID || !levelID) {
        return res.status(400).json({ message: 'Department ID, Programme ID, and Level ID are required' });
    }

  
    try {

        const pool = await poolPromise;
        
        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

     // Get active session and semester
        const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSessionResult.recordset[0].SessionID;

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

       
        
        const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

        const query = `
            SELECT
               s.MatNo, 
               s.LastName, 
               s.OtherNames,
               s.Gender,
               SUM(c.credit_unit) AS TotalCreditUnits,
               SUM(CASE WHEN r.Grade != 'F' THEN c.credit_unit ELSE 0 END) AS TotalCreditUnitsPassed, 
               SUM(r.GradePoint * r.CreditUnits) AS CummulativeGradePoints,
               CASE
                    WHEN SUM(r.CreditUnits) > 0 
                    THEN CAST(SUM(r.GradePoint * r.CreditUnits) / SUM(r.CreditUnits) AS DECIMAL(5, 2))
                    ELSE 0.0
                END AS CGPA,
                SUM(CASE WHEN c.course_type ='C' AND  r.Grade ='F' THEN c.credit_unit ELSE 0 END) AS TotalCoreUnitsFailed

            FROM dbo.student s
            LEFT JOIN dbo.results r ON s.MatNo = r.MatricNo
            LEFT JOIN dbo.courses c ON r.courseID = c.course_id
            WHERE s.LevelID = @LevelID
            AND s.ProgrammeID = @ProgrammeID
             AND s.Department = @DepartmentID
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND HOD_Approval = 'Approved' 
                AND r.ResultType = 'Exam'
                AND (
                    r.SessionID < @ActiveSessionID
                    OR (r.SessionID = @ActiveSessionID AND r.SemesterID < @ActiveSemesterID)
                )
            GROUP BY s.MatNo, s.LastName, s.OtherNames,s.Gender
            ORDER BY s.MatNo

        `

             const result = await pool.request()
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ActiveSessionID', sql.Int, activeSessionID)
            .input('ActiveSemesterID', sql.Int, activeSemesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });
    



    } catch (error) {
        console.error('Error fetching previous cumulative results:', error.stack);
        return next(errorHandler(500, 'Error fetching previous cumulative results: ' + error.message));
    }
}



export const getCurentSemesterCourses = async (req, res, next) =>{
    const { departmentID, programmeID, levelID } = req.body;

    console.log(departmentID,programmeID,levelID)

    if (!departmentID || !programmeID || !levelID) {
        return res.status(400).json({ message: 'Department ID, Programme ID, and Level ID are required' });
    }

  try {

    const pool = await poolPromise;
    
    if (!pool) {
        return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
            const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSessionResult.recordset[0].SessionID;
        const activeSessionName = activeSessionResult.recordset[0].SessionName;

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

        const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
        const activeSemesterName = activeSemesterResult.recordset[0].SemesterName;


        // get all courses taken in the current semester by students in the specified department, programme and level and discipline
    
   const query = `
   SELECT
   r.MatricNo,
   s.LastName,
   s.OtherNames,
   c.course_id,
   c.course_code,
   c.course_title,
   c.credit_unit,
   c.course_type,
   r.TotalScore,
   r.Grade, 
   r.GradePoint,
   s.Gender

FROM dbo.results r
  INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
            ORDER BY r.MatricNo, c.course_code
   `
  const result = await pool.request()
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(query);


           const studentMap = {}

           result.recordset.forEach(row => {
            if(!studentMap[row.MatricNo]){
                studentMap[row.MatricNo]= {
                    MatricNo:row.MatricNo,
                    LastName:row.LastName,
                    OtherNames:row.OtherNames,
                    Gender:row.Gender,
                    courses:[]

                }
            }

             studentMap[row.MatricNo].courses.push({
                CourseCode:row.course_code,
                CourseName:row.course_title,
                CourseType:row.course_type,
                CreditUnits: row.credit_unit,
                CourseID: row.course_id,
                 TotalScore: row.TotalScore,
                Grade: row.Grade,
                GradePoint: row.GradePoint
             })

           })

             return res.status(200).json({
            success: true,
            session: activeSessionName,
            semester: activeSemesterName,
            students: Object.values(studentMap),
            count: Object.keys(studentMap).length
        });




  } catch (error) {
    console.log('Error fetching current semester courses:', error.stack);
    return next(errorHandler(500, 'Error fetching current semester courses: ' + error.message));
  } 
}

export const getSemesterSummary =async(req,res,next)=>{
 const { departmentID, programmeID, levelID } = req.body;

    console.log(departmentID,programmeID,levelID)

    if (!departmentID || !programmeID || !levelID) {
        return res.status(400).json({ message: 'Department ID, Programme ID, and Level ID are required' });
    }

    try{
        const pool = await poolPromise; 

        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }

    // Get active session and semester
            const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSessionResult.recordset[0].SessionID;
        const activeSessionName = activeSessionResult.recordset[0].SessionName;

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

        const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
        const activeSemesterName = activeSemesterResult.recordset[0].SemesterName;
   

    const query =`
    SELECT 
    
    s.MatNo,
    s.LastName,
    s.OtherNames,
    s.Gender,

    SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID = @SemesterID THEN r.CreditUnits ELSE 0 END) AS TotalUnitsTaken,
    SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID = @SemesterID AND r.Grade != 'F' THEN r.CreditUnits ELSE 0 END) AS TotalUnitsPassed,
    SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID = @SemesterID THEN r.GradePoint * r.CreditUnits ELSE 0 END) AS TotalGradePoints,
    CASE 
        WHEN SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID = @SemesterID THEN r.CreditUnits ELSE 0 END) > 0
        THEN CAST(SUM(CASE WHEN r.SessionID = @SessionID and SemesterID = @SemesterID THEN r.GradePoint * r.CreditUnits ELSE 0 END) / 
             SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID = @SemesterID THEN r.CreditUnits ELSE 0 END) AS DECIMAL(5,2))
         ELSE 0.00
    END AS GPA,
    SUM(CASE WHEN r.SessionID = @SessionID AND SemesterID =@SemesterID AND c.course_type ='C' AND r.Grade = 'F' THEN r.CreditUnits ELSE 0 END) AS TotalUnitsFailed,


    -- cumulative results

    SUM(r.CreditUnits) as CummulativeUnit,
    SUM(CASE WHEN r.Grade != 'F' THEN r.CreditUnits ELSE 0 END) AS CumulativeUnitsPassed,
    SUM(r.GradePoint * r.CreditUnits) AS CumulativeGradePoints,
    CASE 
        WHEN SUM(r.CreditUnits) > 0
        THEN CAST(SUM(r.GradePoint * r.CreditUnits) / SUM(r.CreditUnits) AS DECIMAL(3,2))
        ELSE 0.00
    END AS CGPA,
    SUM(CASE WHEN c.course_type ='C' AND r.Grade = 'F' THEN r.CreditUnits ELSE 0 END) AS CumulativeUnitsFailed

    FROM dbo.student s
    LEFT JOIN dbo.results r ON s.MatNo = r.MatricNo
    LEFT JOIN dbo.courses c ON r.CourseID = c.course_id
    WHERE s.LevelID = @LevelID
    AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND r.Advisor = 'Approved'
                AND r.HOD_Approval = 'Approved'
               GROUP BY s.MatNo, s.LastName, s.OtherNames, s.Gender
            ORDER BY s.MatNo
    `

    const result = await pool.request()
    .input('LevelID', sql.Int, levelID)
    .input('ProgrammeID', sql.Int, programmeID)
    .input('DepartmentID', sql.Int, parseInt(departmentID))
    .input('SessionID', sql.Int, activeSessionID)
    .input('SemesterID', sql.Int, activeSemesterID)
    .query(query);

    return res.status(200).json({
        success: true,
        session: activeSessionName,
        semester: activeSemesterName,
        data: result.recordset,
        count: result.recordset.length
    });


    }catch(error){
        console.log('Error fetching semester summary:', error.stack);
        return next(errorHandler(500, 'Error fetching semester summary: ' + error.message));
    }
}


export  const carryOverCourses = async (req, res, next) => {
    const { departmentID, programmeID, levelID } = req.body;

    console.log(departmentID,programmeID,levelID)

    if (!departmentID || !programmeID || !levelID) {
        return res.status(400).json({ message: 'Department ID, Programme ID, and Level ID are required' });
    }

    try{
        const pool = await poolPromise; 

        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }

    // Get active session and semester
            const activeSessionResult = await pool.request()
<<<<<<< HEAD
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
=======
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
 
        if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSessionResult.recordset[0].SessionID;
        const activeSessionName = activeSessionResult.recordset[0].SessionName;

        const activeSemesterResult = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
        }

        const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
        const activeSemesterName = activeSemesterResult.recordset[0].SemesterName;

        const previousSessionID = activeSemesterID === 1 ? activeSessionID - 1 : activeSessionID;
        const previousSemesterID = activeSemesterID === 2 ? 1 : 2; 


     //get student details
     const student = await pool.request()
     .input('LevelID', sql.Int, levelID)
     .input('ProgrammeID', sql.Int, programmeID)
     .input('DepartmentID', sql.Int, parseInt(departmentID))
     .query(`SELECT MatNo, Lastname, OtherNames, LevelID, ProgrammeID, department, DisciplineID FROM dbo.student WHERE LevelID = @LevelID AND ProgrammeID = @ProgrammeID AND Department = @DepartmentID`)

        if(student.recordset.length === 0){
            return next(errorHandler(404, "No students found for the specified criteria"))
        }
            
            
    const query = `
    SELECT DISTINCT
      r.MatricNo,
      s.LastName,
      s.OtherNames,
      s.Gender,
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
      WHERE s.LevelID = @LevelID
        AND s.ProgrammeID = @ProgrammeID
        AND s.Department = @DepartmentID
        AND c.course_type = 'C'
        AND r.Grade = 'F'
        AND r.ResultStatus = 'Approved'
        AND r.ResultType = 'Exam'
        AND r.Advisor = 'Approved'
        AND r.HOD_Approval = 'Approved'
        AND (
            r.SessionID < @ActiveSessionID
            OR (r.SessionID = @ActiveSessionID AND r.SemesterID < @ActiveSemesterID)
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
        FROM dbo.course_registrations cr
                CROSS APPLY STRING_SPLIT(cr.courses, ',') reg
         WHERE cr.mat_no = s.MatNo
           AND TRY_CAST(LTRIM(RTRIM(reg.value)) AS INT ) = c.course_id
           AND cr.session = @ActiveSessionID
        )
        ORDER BY r.MatricNo, c.course_code
      
    `
const result = await pool.request()
.input('LevelID', sql.Int, levelID)
.input('ProgrammeID', sql.Int, programmeID)
.input('DepartmentID', sql.Int, parseInt(departmentID))
.input('ActiveSessionID', sql.Int, activeSessionID)
.input('ActiveSemesterID', sql.Int, activeSemesterID)
.query(query); 

const missedQuery =`

SELECT 
s.MatNo,
s.LastName,
s.OtherNames,
c.course_id,
s.Gender,
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
WHERE 
  s.LevelID = @LevelID
AND s.ProgrammeID = @ProgrammeID
AND s.Department = @DepartmentID

AND NOT EXISTS(
 SELECT 1
 FROM dbo.course_registrations cr
 CROSS APPLY STRING_SPLIT(cr.courses, ',') reg
    WHERE cr.mat_no = s.MatNo
    AND TRY_CAST(LTRIM(RTRIM(reg.value)) AS INT) = c.course_id
    AND cr.session <= @ActiveSessionID
 )
 
ORDER BY s.MatNo, c.course_code

`

const missedResult = await pool.request()
.input('LevelID', sql.Int, levelID)
.input('ProgrammeID', sql.Int, programmeID)
.input('DepartmentID', sql.Int, parseInt(departmentID))
.input('PreviousSemesterID', sql.Int, previousSemesterID)
.input('ActiveSessionID', sql.Int, activeSessionID)
.query(missedQuery);

    const combinedResults = Array.from(
        new Set([
            ...result.recordset.map((row) => row.course_id),
            ...missedResult.recordset.map((row) => row.course_id)
        ])
    );

    let finalResult = { recordset: [] };

    // fetch the results for the combined course list in the current semester
    if (combinedResults.length > 0) {
        const courseParamNames = combinedResults.map((_, index) => `@CourseID${index}`);
        const finalquery = `SELECT
 r.MatricNo,
 c.course_id,
 c.course_code,
 c.course_title,
 c.credit_unit,
 c.course_type,
 r.TotalScore,
 r.Grade,
 s.Gender

FROM dbo.results r
INNER JOIN dbo.courses c ON r.CourseID = c.course_id
INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
WHERE c.course_id IN (${courseParamNames.join(',')})
AND s.LevelID = @LevelID
AND s.ProgrammeID = @ProgrammeID
AND s.Department = @DepartmentID
AND r.SessionID = @ActiveSessionID
AND r.SemesterID = @ActiveSemesterID
AND r.ResultStatus = 'Approved'
AND r.ResultType = 'Exam'
AND r.Advisor = 'Approved'
AND r.HOD_Approval = 'Approved'
ORDER BY r.MatricNo, c.course_code

 `;

        const finalRequest = pool.request()
            .input('LevelID', sql.Int, levelID)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('DepartmentID', sql.Int, parseInt(departmentID))
            .input('ActiveSessionID', sql.Int, activeSessionID)
            .input('ActiveSemesterID', sql.Int, activeSemesterID);

        combinedResults.forEach((courseID, index) => {
            finalRequest.input(`CourseID${index}`, sql.Int, courseID);
        });

        finalResult = await finalRequest.query(finalquery);
    }

    return res.status(200).json({
        success: true,
        session: activeSessionName,
        semester: activeSemesterName,
        failedCarryovers: result.recordset,
        missedCarryovers: missedResult.recordset,
        currentSemesterRetakes: finalResult.recordset,
        courseCount: combinedResults.length
    });


   
}catch(error){
    console.log('Error fetching carry over courses:', error.stack);
    return next(errorHandler(500, 'Error fetching carry over courses: ' + error.message));
}

}