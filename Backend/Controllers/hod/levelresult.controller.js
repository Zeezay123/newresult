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

        // Get programmes with approved results
        const programmesQuery = `
            SELECT DISTINCT 
                p.ProgrammeID,
                p.ProgrammeName,
                COUNT(DISTINCT s.MatNo) as StudentCount
            FROM dbo.programmes p
            INNER JOIN dbo.student s ON p.ProgrammeID = s.ProgrammeID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE s.department = @DepartmentID
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
                COUNT(DISTINCT s.MatNo) as StudentCount
            FROM dbo.levels l
            INNER JOIN dbo.student s ON l.LevelID = s.LevelID
            INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
            WHERE s.department = @DepartmentID
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
     const StaffCode = req.user.id;
      const departmentId = req.user.departmentID;
  
      if (!departmentId) {
          return next(errorHandler(403, "Department information missing in token"))
      }
  
      try {
          const pool = await poolPromise;
  
          if (!pool) {
              return next(errorHandler(500, 'Database connection failed'))
          }
  
          // Get advisor's assigned level and programme
          const advisorLevel = await pool.request()
              .input('StaffCode', sql.VarChar, StaffCode)
              .input('DepartmentID', sql.Int, parseInt(departmentId))
              .query(`
                  SELECT LevelID, ProgrammeID
                  FROM dbo.Level_Advisors
                  WHERE StaffCode = @StaffCode 
                    AND DepartmentID = @DepartmentID
              `);
  
          if (advisorLevel.recordset.length === 0) {
              return next(errorHandler(404, "No level assigned to you as advisor"))
          }
  
          const assignedLevelID = advisorLevel.recordset[0].LevelID;
          const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;
  
          // Get active session and semester
          const activeSessionResult = await pool.request()
              .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);
  
          if (activeSessionResult.recordset.length === 0) {
              return next(errorHandler(404, "No active session found"))
          }
  
          const activeSessionID = activeSessionResult.recordset[0].SessionID;
          const activeSessionName = activeSessionResult.recordset[0].SessionName;
  
          const activeSemesterResult = await pool.request()
              .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);
  
          if (activeSemesterResult.recordset.length === 0) {
              return next(errorHandler(404, "No active semester found"))
          }
  
          const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
          const activeSemesterName = activeSemesterResult.recordset[0].SemesterName;
  
          // Get inactive semester
          const inactiveSemesterResult = await pool.request()
              .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'false'`);
  
          const inactiveSemesterID = inactiveSemesterResult.recordset.length > 0 ? inactiveSemesterResult.recordset[0].SemesterID : null;
  
          // Get department and programme info
          const deptAndProgInfo = await pool.request()
              .input('DepartmentID', sql.Int, parseInt(departmentId))
              .input('ProgrammeID', sql.Int, assignedProgrammeID)
              .query(`
                  SELECT d.DepartmentName, p.ProgrammeName
                  FROM dbo.appdepartment d
                  INNER JOIN dbo.programmes p ON p.ProgrammeID = @ProgrammeID
                  WHERE d.DepartmentID = @DepartmentID
              `);
  
          const departmentName = deptAndProgInfo.recordset[0]?.DepartmentName || '';
          const programmeName = deptAndProgInfo.recordset[0]?.ProgrammeName || '';
  
          // 1. Get Previous Cumulative Results (excluding current semester)
          const prevCumulativeQuery = `
              SELECT 
                  s.MatNo,
                  SUM(CASE WHEN c.course_type = 'C' THEN c.credit_unit ELSE 0 END) as TotalCoreUnits,
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
              WHERE s.LevelID = @LevelID
                  AND s.ProgrammeID = @ProgrammeID
                  AND s.department = @DepartmentID
                  AND r.ResultStatus = 'Approved'
                  AND r.ResultType = 'Exam'
                  AND r.Advisor = 'Approved'
                  AND (r.SessionID < @SessionID 
                      OR (r.SessionID = @SessionID AND r.SemesterID < @SemesterID))
              GROUP BY s.MatNo
              HAVING SUM(c.credit_unit) > 0
              ORDER BY s.MatNo
          `;
  
          const prevCumulativeResult = await pool.request()
              .input('LevelID', sql.Int, assignedLevelID)
              .input('ProgrammeID', sql.Int, assignedProgrammeID)
              .input('DepartmentID', sql.Int, parseInt(departmentId))
              .input('SessionID', sql.Int, activeSessionID)
              .input('SemesterID', sql.Int, activeSemesterID)
              .query(prevCumulativeQuery);
  
          const previousCumulative = prevCumulativeResult.recordset;
  
          // 2. Get Current Semester Courses with Grades
          const currentCoursesQuery = `
              SELECT 
                  s.MatNo,
                  c.course_code,
                  c.course_title,
                  c.credit_unit,
                  c.course_type,
                  r.TotalScore,
                  r.Grade
              FROM dbo.student s
              INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
              INNER JOIN dbo.courses c ON r.CourseID = c.course_id
              WHERE s.LevelID = @LevelID
                  AND s.ProgrammeID = @ProgrammeID
                  AND s.department = @DepartmentID
                  AND r.SessionID = @SessionID
                  AND r.SemesterID = @SemesterID
                  AND r.ResultType = 'Exam'
                  AND r.Advisor = 'Approved'
                  AND r.ResultStatus = 'Approved'
              ORDER BY s.MatNo, c.course_code
          `;
  
          const currentCoursesResult = await pool.request()
              .input('LevelID', sql.Int, assignedLevelID)
              .input('ProgrammeID', sql.Int, assignedProgrammeID)
              .input('DepartmentID', sql.Int, parseInt(departmentId))
              .input('SessionID', sql.Int, activeSessionID)
              .input('SemesterID', sql.Int, activeSemesterID)
              .query(currentCoursesQuery);
  
          const currentCourses = currentCoursesResult.recordset;
  
          // 3. Get Semester Summary
          const summaryQuery = `
              SELECT 
                  s.MatNo,
                  CONCAT(s.LastName, ' ', s.OtherNames) AS FullName,
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
              WHERE s.LevelID = @LevelID
                  AND s.ProgrammeID = @ProgrammeID
                  AND s.Department = @DepartmentID
                  AND r.ResultStatus = 'Approved'
                  AND r.Advisor = 'Approved'
                  AND r.ResultType = 'Exam'
                  AND (r.SessionID < @SessionID OR (r.SessionID = @SessionID AND r.SemesterID <= @SemesterID))
              GROUP BY s.MatNo, s.LastName, s.OtherNames
              ORDER BY s.MatNo
          `;
  
          const summaryResult = await pool.request()
              .input('LevelID', sql.Int, assignedLevelID)
              .input('ProgrammeID', sql.Int, assignedProgrammeID)
              .input('DepartmentID', sql.Int, parseInt(departmentId))
              .input('SessionID', sql.Int, activeSessionID)
              .input('SemesterID', sql.Int, activeSemesterID)
              .query(summaryQuery);
  
          const semesterSummary = summaryResult.recordset;
  
          // 4. Get Carryover Courses (failed core courses from previous semester)
          let carryovers = [];
          if (inactiveSemesterID) {
              const carryoversQuery = `
                  SELECT 
                      s.MatNo,
                      c.course_code,
                      c.course_title,
                      c.credit_unit
                  FROM dbo.student s
                  INNER JOIN dbo.results r ON s.MatNo = r.MatricNo
                  INNER JOIN dbo.courses c ON r.CourseID = c.course_id
                  WHERE s.LevelID = @LevelID
                      AND s.ProgrammeID = @ProgrammeID
                      AND s.Department = @DepartmentID
                      AND r.SessionID = @SessionID
                      AND r.SemesterID = @InactiveSemesterID
                      AND r.ResultType = 'Exam'
                      AND r.ResultStatus = 'Approved'
                      AND r.Advisor = 'Approved'
                      AND c.course_type = 'C'
                      AND r.Grade = 'F'
                  ORDER BY s.MatNo, c.course_code
              `;
  
              const carryoversResult = await pool.request()
                  .input('LevelID', sql.Int, assignedLevelID)
                  .input('ProgrammeID', sql.Int, assignedProgrammeID)
                  .input('DepartmentID', sql.Int, parseInt(departmentId))
                  .input('SessionID', sql.Int, activeSessionID)
                  .input('InactiveSemesterID', sql.Int, inactiveSemesterID)
                  .query(carryoversQuery);
  
              carryovers = carryoversResult.recordset;
          }
  
          // Create Excel workbook with a single sheet
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Level Results');

          const addBorders = (cell) => {
              cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
              };
          };

          const uniqueCourses = [];
          const courseMap = new Map();
          const studentCoursesMap = new Map();

          currentCourses.forEach((course) => {
              if (!courseMap.has(course.course_code)) {
                  courseMap.set(course.course_code, {
                      creditUnit: course.credit_unit,
                      courseType: course.course_type
                  });
                  uniqueCourses.push(course.course_code);
              }

              if (!studentCoursesMap.has(course.MatNo)) {
                  studentCoursesMap.set(course.MatNo, {});
              }

              studentCoursesMap.get(course.MatNo)[course.course_code] = `${course.TotalScore}${course.Grade}`;
          });

          uniqueCourses.sort();

          const previousCumulativeMap = new Map(previousCumulative.map((student) => [student.MatNo, student]));
          const semesterSummaryMap = new Map(semesterSummary.map((student) => [student.MatNo, student]));

          const carryoversByStudent = new Map();
          carryovers.forEach((course) => {
              if (!carryoversByStudent.has(course.MatNo)) {
                  carryoversByStudent.set(course.MatNo, {
                      courses: [],
                      totalUnits: 0
                  });
              }

              const studentCarryover = carryoversByStudent.get(course.MatNo);
              studentCarryover.courses.push(course.course_code);
              studentCarryover.totalUnits += course.credit_unit;
          });

          const allStudentMatricNos = new Set([
              ...previousCumulative.map((student) => student.MatNo),
              ...Array.from(studentCoursesMap.keys()),
              ...semesterSummary.map((student) => student.MatNo),
              ...carryovers.map((course) => course.MatNo)
          ]);
          const sortedStudents = Array.from(allStudentMatricNos).sort();

          const sharedHeaders = ['S/N', 'Matric No', 'Full Name'];
          const previousHeaders = ['Core Units', 'Total Units', 'Units Passed', 'Cum. Points', 'CGPA', 'Core Failed'];
          const summaryHeaders = [
              'Curr Sem Units', 'Curr Passed', 'Curr Points', 'Curr GPA', 'Curr Core Failed',
              'Cum. Units', 'Cum. Passed', 'Cum. Points', 'CGPA', 'Cum. Core Failed'
          ];
          const carryoverHeaders = ['Carryover Courses', 'Total Failed Units'];

          const buildColumns = () => {
              const columns = [];
              sharedHeaders.forEach(() => columns.push({ width: 16 }));
              columns[0].width = 8;
              columns[2].width = 28;

              columns.push({ width: 3 });

              previousHeaders.forEach(() => columns.push({ width: 14 }));

              columns.push({ width: 3 });

              uniqueCourses.forEach((courseCode) => {
                  const courseInfo = courseMap.get(courseCode);
                  columns.push({
                      width: Math.max(12, `${courseCode} (${courseInfo?.creditUnit || 0}U)`.length + 2)
                  });
              });

              columns.push({ width: 3 });

              summaryHeaders.forEach(() => columns.push({ width: 14 }));

              columns.push({ width: 3 });

              columns.push({ width: 36 });
              columns.push({ width: 14 });

              return columns;
          };

          worksheet.columns = buildColumns();

          const totalColumnCount = worksheet.columns.length;
          worksheet.mergeCells(1, 1, 1, totalColumnCount);
          worksheet.getCell(1, 1).value = `${departmentName} - ${programmeName} | Level ${assignedLevelID} Results`;
          worksheet.getCell(1, 1).font = { size: 14, bold: true };
          worksheet.getCell(1, 1).alignment = { horizontal: 'center' };

          worksheet.mergeCells(2, 1, 2, totalColumnCount);
          worksheet.getCell(2, 1).value = `${activeSemesterName}, ${activeSessionName}`;
          worksheet.getCell(2, 1).font = { size: 11, bold: true };
          worksheet.getCell(2, 1).alignment = { horizontal: 'center' };

          let columnIndex = 1;
          const sectionRow = worksheet.getRow(3);
          const headerRow = worksheet.getRow(4);

          const sharedStart = columnIndex;
          sharedHeaders.forEach((header, index) => {
              headerRow.getCell(columnIndex + index).value = header;
          });
          worksheet.mergeCells(3, sharedStart, 3, sharedStart + sharedHeaders.length - 1);
          sectionRow.getCell(sharedStart).value = 'Student Info';
          columnIndex += sharedHeaders.length;

          columnIndex += 1;

          const previousStart = columnIndex;
          previousHeaders.forEach((header, index) => {
              headerRow.getCell(columnIndex + index).value = header;
          });
          worksheet.mergeCells(3, previousStart, 3, previousStart + previousHeaders.length - 1);
          sectionRow.getCell(previousStart).value = 'Previous Cumulative';
          columnIndex += previousHeaders.length;

          columnIndex += 1;

          const coursesStart = columnIndex;
          if (uniqueCourses.length > 0) {
              uniqueCourses.forEach((courseCode, index) => {
                  const courseInfo = courseMap.get(courseCode);
                  headerRow.getCell(columnIndex + index).value = `${courseCode}\n(${courseInfo?.creditUnit || 0}U)`;
              });
              worksheet.mergeCells(3, coursesStart, 3, coursesStart + uniqueCourses.length - 1);
              sectionRow.getCell(coursesStart).value = 'Current Semester Courses';
              columnIndex += uniqueCourses.length;
          } else {
              headerRow.getCell(columnIndex).value = 'No Current Courses';
              worksheet.mergeCells(3, columnIndex, 3, columnIndex);
              sectionRow.getCell(columnIndex).value = 'Current Semester Courses';
              columnIndex += 1;
          }

          columnIndex += 1;

          const summaryStart = columnIndex;
          summaryHeaders.forEach((header, index) => {
              headerRow.getCell(columnIndex + index).value = header;
          });
          worksheet.mergeCells(3, summaryStart, 3, summaryStart + summaryHeaders.length - 1);
          sectionRow.getCell(summaryStart).value = 'Semester Summary';
          columnIndex += summaryHeaders.length;

          columnIndex += 1;

          const carryoverStart = columnIndex;
          carryoverHeaders.forEach((header, index) => {
              headerRow.getCell(columnIndex + index).value = header;
          });
          worksheet.mergeCells(3, carryoverStart, 3, carryoverStart + carryoverHeaders.length - 1);
          sectionRow.getCell(carryoverStart).value = 'Carryovers';

          sectionRow.font = { bold: true, color: { argb: 'FF1F2937' } };
          sectionRow.alignment = { horizontal: 'center', vertical: 'center' };
          sectionRow.height = 22;

          headerRow.font = { bold: true, color: { argb: 'FF000000' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
          headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          headerRow.height = 28;
          headerRow.eachCell(addBorders);

          for (let rowIndex = 5; rowIndex < 5 + sortedStudents.length; rowIndex += 1) {
              const matricNo = sortedStudents[rowIndex - 5];
              const row = worksheet.getRow(rowIndex);
              const previousStudent = previousCumulativeMap.get(matricNo);
              const summaryStudent = semesterSummaryMap.get(matricNo);
              const currentStudentCourses = studentCoursesMap.get(matricNo) || {};
              const carryoverStudent = carryoversByStudent.get(matricNo);

              let dataColumn = 1;
              row.getCell(dataColumn).value = rowIndex - 4;
              row.getCell(dataColumn + 1).value = matricNo;
              row.getCell(dataColumn + 2).value = summaryStudent?.FullName || '-';
              dataColumn += 4;

              row.getCell(dataColumn).value = previousStudent?.TotalCoreUnits || 0;
              row.getCell(dataColumn + 1).value = previousStudent?.TotalUnitsTaken || 0;
              row.getCell(dataColumn + 2).value = previousStudent?.TotalUnitsPassed || 0;
              row.getCell(dataColumn + 3).value = previousStudent?.CumulativeGradePoints || 0;
              row.getCell(dataColumn + 4).value = previousStudent?.CGPA || '0.00';
              row.getCell(dataColumn + 5).value = previousStudent?.CoreUnitsFailed || 0;
              dataColumn += previousHeaders.length + 1;

              if (uniqueCourses.length > 0) {
                  uniqueCourses.forEach((courseCode) => {
                      row.getCell(dataColumn).value = currentStudentCourses[courseCode] || '-';
                      dataColumn += 1;
                  });
              } else {
                  row.getCell(dataColumn).value = '-';
                  dataColumn += 1;
              }
              dataColumn += 1;

              row.getCell(dataColumn).value = summaryStudent?.CurrentSemesterUnits || 0;
              row.getCell(dataColumn + 1).value = summaryStudent?.CurrentSemesterUnitsPassed || 0;
              row.getCell(dataColumn + 2).value = summaryStudent?.CurrentSemesterGradePoints || 0;
              row.getCell(dataColumn + 3).value = summaryStudent?.CurrentGPA || '0.00';
              row.getCell(dataColumn + 4).value = summaryStudent?.CurrentCoreUnitsFailed || 0;
              row.getCell(dataColumn + 5).value = summaryStudent?.CumulativeUnits || 0;
              row.getCell(dataColumn + 6).value = summaryStudent?.CumulativeUnitsPassed || 0;
              row.getCell(dataColumn + 7).value = summaryStudent?.CumulativeGradePoints || 0;
              row.getCell(dataColumn + 8).value = summaryStudent?.CGPA || '0.00';
              row.getCell(dataColumn + 9).value = summaryStudent?.CumulativeCoreUnitsFailed || 0;
              dataColumn += summaryHeaders.length + 1;

              row.getCell(dataColumn).value = carryoverStudent ? carryoverStudent.courses.join(', ') : '-';
              row.getCell(dataColumn + 1).value = carryoverStudent ? carryoverStudent.totalUnits : 0;

              row.alignment = { horizontal: 'center', vertical: 'middle' };
              row.eachCell(addBorders);
          }

          worksheet.views = [{ state: 'frozen', ySplit: 4, xSplit: 3 }];
  
          // Set response headers
          res.setHeader(
              'Content-Type',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader(
              'Content-Disposition',
              `attachment; filename=Level_${assignedLevelID}00_Results_${activeSessionName}_${activeSemesterName}.xlsx`
          );
  
          // Write to response
          await workbook.xlsx.write(res);
          res.end();
  
      } catch (error) {
          console.error('Download level results error:', error);
          return next(errorHandler(500, `Server error: ${error.message}`));
      }
};

// Approve level results (HOD final approval)
export const approveLevelResults = async (req, res, next) => {
    const departmentId = req.user.departmentID;
    const { LevelID, ProgrammeID } = req.body;

    if (!departmentId) {
        return res.status(400).json({ message: 'Department ID is required' });
    }

    if (!LevelID) {
        return res.status(400).json({ message: 'Level ID is required' });
    }

    if (!ProgrammeID) {
        return res.status(400).json({ message: 'Programme ID is required' });
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        // Get the active session
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);

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
            WHERE s.department = @DepartmentID
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
            .input('LevelID', sql.Int, LevelID)
            .input('ProgrammeID', sql.Int, ProgrammeID)
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
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.department = @DepartmentID
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
            .input('LevelID', sql.Int, LevelID)
            .input('ProgrammeID', sql.Int, ProgrammeID)
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
            .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);

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


export const getPreviousCumulativeResults = async (req, res, next) => {
    const HodId = req.user.id;
    const departmentId = req.user.departmentID;

    const assignedLevelID =  req.body.LevelID || 1
    const assignedProgrammeID =  req.body.ProgrammeID || 1

    if(!departmentId || !HodId  ){
        return next(errorHandler(403, "Department and HOD information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

      

     

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

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

        // Get previous cumulative data for each student
        // This includes all approved results BEFORE the current active semester
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
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Approved'
                AND r.ResultType = 'Exam'
                AND (
                    r.SessionID < @ActiveSessionID
                    OR (r.SessionID = @ActiveSessionID AND r.SemesterID < @ActiveSemesterID)
                )
            GROUP BY s.MatNo, s.LastName, s.OtherNames
            ORDER BY s.MatNo
        `;

        const result = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('ActiveSessionID', sql.Int, activeSessionID)
            .input('ActiveSemesterID', sql.Int, activeSemesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });

    } catch (error) {
        console.error('Error in getPreviousCumulativeResults:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}


// 2. Get Current Semester Courses (list of all courses in current semester)
export const getCurrentSemesterCourses = async (req, res, next) => {
      const HodId = req.user.id;
    const departmentId = req.user.departmentID;

    const assignedLevelID =  req.body.LevelID || 1
    const assignedProgrammeID =  req.body.ProgrammeID || 1

    if(!departmentId || !HodId  ){
        return next(errorHandler(403, "Department and HOD information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

     

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

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

        // Get all courses taken in current semester
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
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND r.Advisor = 'Approved'
            ORDER BY r.MatricNo, c.course_code
        `;

        const result = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(query);

        // Group courses by student
        const studentMap = {};
        result.recordset.forEach(row => {
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

        return res.status(200).json({
            success: true,
            session: activeSessionName,
            semester: activeSemesterName,
            students: Object.values(studentMap),
            count: Object.keys(studentMap).length
        });

    } catch (error) {
        console.error('Error in getCurrentSemesterCourses:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}


// 3. Get Semester Summary (current semester stats + cumulative totals)
export const getSemesterSummary = async (req, res, next) => {
      const HodId = req.user.id;
    const departmentId = req.user.departmentID;

    const assignedLevelID = req.body.LevelID || 1
    const assignedProgrammeID = req.body.ProgrammeID || 1

    if(!departmentId || !HodId  ){
        return next(errorHandler(403, "Department and HOD information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

   

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

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

        // Get both current semester and cumulative stats
        const query = `
            SELECT 
                s.MatNo,
                s.LastName,
                s.OtherNames,
                -- Current Semester Stats
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
                -- Cumulative Stats (including current semester)
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
            WHERE s.LevelID = @LevelID
                AND s.programmeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND r.ResultStatus = 'Approved'
                AND r.ResultType = 'Exam'
                AND r.Advisor = 'Approved'
                AND (
                    r.SessionID < @SessionID
                    OR (r.SessionID = @SessionID AND r.SemesterID <= @SemesterID)
                )
            GROUP BY s.MatNo, s.LastName, s.OtherNames
            ORDER BY s.MatNo
        `;

        const result = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(query);

        return res.status(200).json({
            success: true,
            data: result.recordset,
            count: result.recordset.length
        });

    } catch (error) {
        console.error('Error in getSemesterSummary:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}


// 4. Get Previous Semester Carryovers (failed core courses from previous semester)
export const getPreviousSemesterCarryovers = async (req, res, next) => {
       const HodId = req.user.id;
    const departmentId = req.user.departmentID;

    const assignedLevelID =  req.body.LevelID || 1
    const assignedProgrammeID =  req.body.ProgrammeID || 1

    if(!departmentId || !HodId  ){
        return next(errorHandler(403, "Department and HOD information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }


        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = '1'`);

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

        // Determine previous semester
        // If current is Semester 2, previous is Semester 1 (same session)
        // If current is Semester 1, previous is Semester 2 (previous session)
        const previousSemesterID = activeSemesterID === 2 ? 1 : 2;
        const previousSessionID = activeSemesterID === 1 ? activeSessionID - 1 : activeSessionID;

        // Get outstanding failed core courses from past sessions/semesters.
        const query = `
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
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.department = @DepartmentID
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
                    FROM dbo.registrated_courses cr
                    INNER JOIN dbo.courses c2 ON c2.course_id = cr.course_id
                    WHERE cr.mat_no = s.MatNo
                      AND cr.session = @ActiveSessionID
                )
            ORDER BY r.MatricNo, c.course_code
        `;

        const result = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('ActiveSessionID', sql.Int, activeSessionID)
            .input('ActiveSemesterID', sql.Int, activeSemesterID)
            .query(query);

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
            inner join dbo.course_allocations cal ON cal.level_id <= @LevelID
            INNER JOIN dbo.courses c ON
                c.course_type = 'C'
                AND c.semester = @PreviousSemesterID
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND NOT EXISTS (
                    SELECT 1
                    FROM dbo.registrated_courses cr
                    INNER JOIN dbo.courses c2 ON c2.course_id = cr.course_id
                    WHERE cr.mat_no = s.MatNo
                      AND cr.session <= @ActiveSessionID
                )
            ORDER BY s.MatNo, c.course_code
        `;

        const missedResult = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('PreviousSemesterID', sql.Int, previousSemesterID)
            .input('ActiveSessionID', sql.Int, activeSessionID)
            .query(missedQuery);

        const combinedCourseIDs = Array.from(
            new Set([
                ...result.recordset.map((row) => row.course_id),
                ...missedResult.recordset.map((row) => row.course_id)
            ])
        );

        let finalResult = { recordset: [] };
        if (combinedCourseIDs.length > 0) {
            const courseParamNames = combinedCourseIDs.map((_, index) => `@CourseID${index}`);
            const finalQuery = `
                SELECT
                    r.MatricNo,
                    c.course_id,
                    c.course_code,
                    c.course_title,
                    c.credit_unit,
                    c.course_type,
                    r.TotalScore,
                    r.Grade
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
                .input('LevelID', sql.Int, assignedLevelID)
                .input('ProgrammeID', sql.Int, assignedProgrammeID)
                .input('DepartmentID', sql.Int, parseInt(departmentId))
                .input('ActiveSessionID', sql.Int, activeSessionID)
                .input('ActiveSemesterID', sql.Int, activeSemesterID);

            combinedCourseIDs.forEach((courseID, index) => {
                finalRequest.input(`CourseID${index}`, sql.Int, courseID);
            });

            finalResult = await finalRequest.query(finalQuery);
        }

        const studentMap = {};
        result.recordset.forEach((row) => {
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

        return res.status(200).json({
            success: true,
            previousSession: previousSessionID,
            previousSemester: previousSemesterID,
            students: Object.values(studentMap),
            failedCarryovers: result.recordset,
            missedCarryovers: missedResult.recordset,
            currentSemesterRetakes: finalResult.recordset,
            courseCount: combinedCourseIDs.length,
            count: Object.keys(studentMap).length
        });

    } catch (error) {
        console.error('Error in getPreviousSemesterCarryovers:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}
