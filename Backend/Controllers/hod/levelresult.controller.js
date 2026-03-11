import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';
import ExcelJS from 'exceljs';



export const getLevelResults = async (req, res, next) => {
const departmentId = req.user.departmentID;
const { levelId, programmeID } = req.query;

if (!departmentId) {
    return res.status(400).json({ message: 'Department ID is required' });
}

if (!levelId) {
    return res.status(400).json({ message: 'Level ID is required' });
}
if (!programmeID) {
    return res.status(400).json({ message: 'Programme ID is required' });   }

try{
    const pool = await poolPromise;

      if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
            .query(`
                SELECT SessionID, SessionName 
                FROM dbo.sessions 
                WHERE isActive = 1
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
   
   let query = `
   SELECT
   r.MatricNo, 
   r.CourseID,
   c.CourseCode,
   c.CourseName,
   c.CreditUnits,
   c.CourseType,
   r.TotalScore,
   r.Grade,
   r.GradePoint,
   gpa.GPA,
   gpa.CGPA,
   gpa.TotalCreditUnits,
   gpa.TotalCreditUnitsPassed,
   gpa.TotalCreditUnitsFailed,
   gpa.CumulativeCreditUnits, 
   gpa.CumulativeCreditUnitsPassed, 
   gpa.CumulativeCreditUnitsFailed,
   CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName

   FROM dbo.results r
   INNER JOIN dbo.course c ON r.CourseID = c.CourseID
   INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
   LEFT JOIN dbo.student_gpa gpa ON s.StudentID = gpa.StudentID AND r.SessionID = gpa.SessionID AND r.SemesterID = gpa.SemesterID

   WHERE s.DepartmentID = @DepartmentID
    AND s.LevelID = @LevelID
    AND s.ProgrammeID = @ProgrammeID
    AND r.SessionID = @SessionID
    AND r.SemesterID = @SemesterID
    AND r.ResultType = 'Exam'
    AND r.ResultStatus = 'Approved'
    AND r.Advisor = 'Approved'
   ORDER BY r.MatricNo, c.CourseCode
   `;

    const result = await pool.request()
    .input('DepartmentID', sql.Int, departmentId)
    .input('LevelID', sql.Int, levelId)
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
                StudentName: row.StudentName,
                GPA: row.GPA,
                CGPA: row.CGPA,
                TotalCreditUnits: row.TotalCreditUnits,
                TotalCreditUnitsPassed: row.TotalCreditUnitsPassed,
                TotalCreditUnitsFailed: row.TotalCreditUnitsFailed,
                CumulativeCreditUnits: row.CumulativeCreditUnits,
                CumulativeCreditUnitsPassed: row.CumulativeCreditUnitsPassed,
                CumulativeCreditUnitsFailed: row.CumulativeCreditUnitsFailed,
                courses: []
            });
        }
        studentsMap.get(row.MatricNo).courses.push({
            CourseCode: row.CourseCode,
            CourseName: row.CourseName,
            CreditUnits: row.CreditUnits,
            CourseType: row.CourseType,
            TotalScore: row.TotalScore,
            Grade: row.Grade,
            GradePoint: row.GradePoint
        });
    });

    return res.status(200).json({
        success: true,
        session: activeSessionResult.recordset[0].SessionName,
        semester: activeSemesterResult.recordset[0].SemesterName,
        students: Array.from(studentsMap.values()),
        count: studentsMap.size
    });

}catch(error){
    console.log('error fetching level results', error.message)
    return next(errorHandler(500, 'Error fetching level results'))
}

}

// Get available programmes and levels for HOD department
export const getAvailableProgrammesAndLevels = async (req, res, next) => {
    const departmentId = req.user.departmentID;

    if (!departmentId) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

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
                WHERE isActive = 1
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

        // Get programmes with approved results
        const programmesQuery = `
            SELECT DISTINCT 
                p.ProgrammeID,
                p.ProgrammeName,
                COUNT(DISTINCT s.MatricNo) as StudentCount
            FROM dbo.programmes p
            INNER JOIN dbo.student s ON p.ProgrammeID = s.ProgrammeID
            INNER JOIN dbo.results r ON s.MatricNo = r.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
            GROUP BY p.ProgrammeID, p.ProgrammeName
            ORDER BY p.ProgrammeID
        `;

        const programmesResult = await pool.request()
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(programmesQuery);

        // Get levels with approved results
        const levelsQuery = `
            SELECT DISTINCT 
                l.LevelID,
                l.LevelName,
                COUNT(DISTINCT s.MatricNo) as StudentCount
            FROM dbo.levels l
            INNER JOIN dbo.student s ON l.LevelID = s.LevelID
            INNER JOIN dbo.results r ON s.MatricNo = r.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
            GROUP BY l.LevelID, l.LevelName
            ORDER BY l.LevelID
        `;

        const levelsResult = await pool.request()
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(levelsQuery);

        return res.status(200).json({
            success: true,
            programmes: programmesResult.recordset,
            levels: levelsResult.recordset
        });

    } catch (error) {
        console.error('Error fetching programmes and levels:', error);
        return next(errorHandler(500, 'Error fetching programmes and levels: ' + error.message));
    }
};

// Download level results as Excel
export const downloadLevelResults = async (req, res, next) => {
    const departmentId = req.user.departmentID;
    const { levelId, programmeID } = req.query;

    if (!departmentId) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!levelId) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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

        // Get programme and level info
        const infoQuery = `
            SELECT p.ProgrammeName, l.LevelName, d.DepartmentName
            FROM dbo.programmes p, dbo.levels l, dbo.appdepartment d
            WHERE p.ProgrammeID = @ProgrammeID 
                AND l.LevelID = @LevelID
                AND d.DepartmentID = @DepartmentID
        `;

        const infoResult = await pool.request()
            .input('ProgrammeID', sql.Int, programmeID)
            .input('LevelID', sql.Int, levelId)
            .input('DepartmentID', sql.Int, departmentId)
            .query(infoQuery);

        const programmeName = infoResult.recordset[0]?.ProgrammeName || 'Unknown';
        const levelName = infoResult.recordset[0]?.LevelName || 'Unknown';
        const departmentName = infoResult.recordset[0]?.DepartmentName || 'Unknown';

        // Get results with courses
        const query = `
            SELECT
                r.MatricNo, 
                CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
                r.CourseID,
                c.CourseCode,
                c.CourseName,
                c.CreditUnits,
                c.CourseType,
                r.TotalScore,
                r.Grade,
                r.GradePoint,
                gpa.GPA,
                gpa.CGPA,
                gpa.TotalCreditUnits,
                gpa.TotalCreditUnitsPassed,
                gpa.TotalCreditUnitsFailed
            FROM dbo.results r
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            LEFT JOIN dbo.student_gpa gpa ON s.StudentID = gpa.StudentID 
                AND r.SessionID = gpa.SessionID 
                AND r.SemesterID = gpa.SemesterID
            WHERE s.DepartmentID = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
            ORDER BY r.MatricNo, c.CourseCode
        `;

        const result = await pool.request()
            .input('DepartmentID', sql.Int, departmentId)
            .input('LevelID', sql.Int, levelId)
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
                    StudentName: row.StudentName,
                    GPA: row.GPA,
                    CGPA: row.CGPA,
                    TotalCreditUnits: row.TotalCreditUnits,
                    TotalCreditUnitsPassed: row.TotalCreditUnitsPassed,
                    TotalCreditUnitsFailed: row.TotalCreditUnitsFailed,
                    courses: []
                });
            }
            studentsMap.get(row.MatricNo).courses.push({
                CourseCode: row.CourseCode,
                CourseName: row.CourseName,
                CreditUnits: row.CreditUnits,
                CourseType: row.CourseType,
                TotalScore: row.TotalScore,
                Grade: row.Grade,
                GradePoint: row.GradePoint
            });
        });

        const students = Array.from(studentsMap.values());

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Level Results');

        // Add header information
        worksheet.mergeCells('A1:D1');
        worksheet.getCell('A1').value = `${departmentName} - ${programmeName}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:D2');
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
        const filename = `${levelName}_Results_${sessionName}_${semesterName}.xlsx`;
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

// Approve level results (HOD final approval)
export const approveLevelResults = async (req, res, next) => {
    const departmentId = req.user.departmentID;
    const { levelId, programmeID } = req.body;

    if (!departmentId) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!levelId) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);

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
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND (r.HOD_Approval IS NULL OR r.HOD_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentId)
            .input('LevelID', sql.Int, levelId)
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
            SET r.HOD_Approval = 'Approved'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND (r.HOD_Approval IS NULL OR r.HOD_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentId)
            .input('LevelID', sql.Int, levelId)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results approved successfully',
            recordsUpdated: updateResult.rowsAffected[0]
        });

    } catch (error) {
        console.error('Error approving level results:', error);
        return next(errorHandler(500, 'Error approving level results: ' + error.message));
    }
};

// Reject level results
export const rejectLevelResults = async (req, res, next) => {
    const departmentId = req.user.departmentID;
    const { levelId, programmeID } = req.body;

    if (!departmentId) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!levelId) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    if (!programmeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);

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
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND (r.HOD_Approval IS NULL OR r.HOD_Approval = 'Pending')
        `;

        const checkResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentId)
            .input('LevelID', sql.Int, levelId)
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
            SET r.HOD_Approval = 'Rejected'
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            WHERE s.DepartmentID = @DepartmentID
                AND s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND (r.HOD_Approval IS NULL OR r.HOD_Approval = 'Pending')
        `;

        const updateResult = await pool.request()
            .input('DepartmentID', sql.Int, departmentId)
            .input('LevelID', sql.Int, levelId)
            .input('ProgrammeID', sql.Int, programmeID)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: 'Level results rejected successfully',
            recordsUpdated: updateResult.rowsAffected[0]
        });

    } catch (error) {
        console.error('Error rejecting level results:', error);
        return next(errorHandler(500, 'Error rejecting level results: ' + error.message));
    }
};