import { get } from 'http';
import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'
import ExcelJS from 'exceljs';


// Get results of all students in the advisor's assigned level


export const getResults = async (req, res, next) => {
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;
    const { semesterID, levelID, sessionID, search } = req.query;
    
    console.log('getResults called with:', { StaffCode, departmentId, semesterID, levelID, sessionID, search });
    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        // Get the level(s) assigned to this advisor
        const advisorLevel = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT LevelID, ProgrammeID
                FROM dbo.Level_Advisors
                WHERE StaffCode = @StaffCode 
                  AND DepartmentID = @DepartmentID
                 
            `);

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }
  
      
        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;
  console.log('getting ids', {assignedLevelID, assignedProgrammeID})
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


        console.log('depat and pro info', {departmentName, programmeName})

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
  
         const activeSessionID = activeSessionResult.recordset[0].SessionID;
         const activeSessionName = activeSessionResult.recordset[0].SessionName;


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

         const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
         const activeSemesterName = activeSemesterResult.recordset[0].SemesterName;


         //get inactive semester
         const inactiveSemesterResult = await pool.request()
         .query(`
            SELECT  SemesterID , SemesterName 
            FROM dbo.semesters 
            WHERE isActive = 'false'
         `);

        
         if(inactiveSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No inactive semester found"))
         }

         const inactiveSemesterID = inactiveSemesterResult.recordset[0].SemesterID;
         const inactiveSemesterName = inactiveSemesterResult.recordset[0].SemesterName;

    

        //get units of core courses that was failed for the assigned level and programme this semester and session
        let CurOutCorecourses = await pool.request()
        .input('LevelID', sql.Int, assignedLevelID)
        .input('ProgrammeID', sql.Int, assignedProgrammeID)
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, activeSemesterID)

        .query(`
            SELECT 
            r.MatricNo,
            r.CourseID,
            c.credit_unit,
            c.course_code,
            c.course_type,
            p.ProgrammeName,
            l.LevelName
            
            
            FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
            INNER JOIN dbo.programmes p ON c.programme_is = p.ProgrammeID
            WHERE l.LevelID = @LevelID AND c.programme_id = @ProgrammeID AND c.course_type = 'C'
            AND r.SessionID = @SessionID AND r.SemesterID = @SemesterID
            AND r.ResultType = 'Exam' AND r.ResultStatus = 'Approved'
            AND r.Grade = 'F'
        `);
        if(CurOutCorecourses.recordset.length === 0){
            CurOutCorecourses = { recordset: [] };
        }
        
     
        //previous semester cumulative result summary of courses from previous semester if any using inactive semester since only one semester can be active at a time.


        let PrevCumulativeResult = await pool.request()
        .input('LevelID', sql.Int, assignedLevelID)
        .input('ProgrammeID', sql.Int, assignedProgrammeID)
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, inactiveSemesterID)
        .input('DepartmentID', sql.Int,departmentId)
        .query(`

            SELECT  
            gpa.MatricNo, 
            gpa.CumulativeCreditUnits,
            gpa.CumulativeCreditUnitsPassed,
            gpa.CumulativeCreditUnitsFailed,
            gpa.CGPA

            FROM dbo.student_gpa gpa
            INNER JOIN dbo.student s ON gpa.StudentID = s.StudentID
            WHERE gpa.DepartmentID = @DepartmentID AND gpa.LevelID = @LevelID AND s.ProgrammeID = @ProgrammeID
            AND gpa.SessionID = @SessionID AND gpa.SemesterID = @SemesterID`)

            
        




        //previous units of failed core courses for the assigned level and programme
        const PrevOutCorecourses = await pool.request()
        .input('LevelID', sql.Int, assignedLevelID)
        .input('ProgrammeID', sql.Int, assignedProgrammeID) 
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, inactiveSemesterID)
        .input('DepartmentID', sql.Int,departmentId)
        
        .query(` 
                 SELECT 
            r.MatricNo,
            r.CourseID,
            r.StudentID,    
            c.credit_unit,
            c.course_code,
            c.course_type,
            p.ProgrammeName,
            l.LevelName


             FROM dbo.results r
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.programmes p ON c.programme_id = p.ProgrammeID
            WHERE l.LevelID = @LevelID AND c.programme_id = @ProgrammeID AND c.CourseType = 'C'
            AND r.SessionID = @SessionID AND r.SemesterID = @SemesterID
            AND s.department = @DepartmentID
            AND r.ResultType = 'Exam' AND r.ResultStatus = 'Approved'
            AND r.Grade = 'F'
            
            `)

    



        

        // Build dynamic filters
        const whereConditions = ['1=1'];
        whereConditions.push('r.ResultType = \'Exam\'');
        whereConditions.push('ses.isActive = 1');
        whereConditions.push('s.DepartmentID = @DepartmentID');
        whereConditions.push('s.LevelID = @AssignedLevelID');
        whereConditions.push('r.ResultStatus = \'Approved\''); 
          whereConditions.push(`s.department = @DepartmentID`);
        

        

        const query = `
            SELECT 
                r.MatricNo,
                r.CourseID,
                c.course_code,
                c.course_title,
                c.credit_unit,
                sem.SemesterName,
                ses.SessionName,
                l.LevelName,
                l.LevelID,
                r.TotalScore,
                r.Grade,
                gpa.TotalCreditUnits,
                gpa.TotalCreditUnitsPassed,
                gpa.TotalCreditUnitsFailed,
                gpa.GPA,
                gpa.CumulativeCreditUnits,
                gpa.CumulativeCreditUnitsPassed,
                gpa.CumulativeCreditUnitsFailed,
                gpa.CGPA

            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
            LEFT JOIN dbo.student_gpa gpa ON s.StudentID = gpa.StudentID 
            WHERE ${whereConditions.join(' AND ')}
            
            AND r.SessionID = gpa.SessionID 
            ORDER BY r.MatricNo, c.course_code
            
          
           
        `;

        const request = pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('AssignedLevelID', sql.Int, assignedLevelID);

    

        const results = await request.query(query);
       
       
        // Group results by student for easier frontend pivoting
        const studentMap = {};
        results.recordset.forEach(row => {
            if (!studentMap[row.MatricNo]) {
                studentMap[row.MatricNo] = {
                    MatricNo: row.MatricNo,
                    TotalCreditUnits: row.TotalCreditUnits,
                    TotalCreditUnitsPassed: row.TotalCreditUnitsPassed,
                    TotalCreditUnitsFailed: row.TotalCreditUnitsFailed,
                    GPA: row.GPA,
                    CumulativeCreditUnits: row.CumulativeCreditUnits,
                    CumulativeCreditUnitsPassed: row.CumulativeCreditUnitsPassed,
                    CumulativeCreditUnitsFailed: row.CumulativeCreditUnitsFailed,
                    CGPA: row.CGPA,
                    courses: []
                };
            }
            studentMap[row.MatricNo].courses.push({
                CourseID: row.CourseID,
                CourseCode: row.CourseCode,
                CourseName: row.CourseName,
                CreditUnits: row.CreditUnits,
                TotalScore: row.TotalScore,
                Grade: row.Grade
            });
        });

        const students = Object.values(studentMap);

        return res.status(200).json({
            success: true,
            meta: {
                department: departmentName,
                programme: programmeName,
                level: `${assignedLevelID}00 Level`,
                session: activeSessionName,
                semester: activeSemesterName,
                levelID: assignedLevelID,
                programmeID: assignedProgrammeID
            },
            students: students,
            carryoverCourses: CurOutCorecourses.recordset || [],
            previousCarryoverCourses: PrevOutCorecourses.recordset || [],
            previousCulativeResults: PrevCumulativeResult.recordset || [],
            count: results.recordset.length,
            studentCount: students.length
        });

    } catch (error) {
        console.error('Error fetching results:', error.stack);
        return next(errorHandler(500, `Server error: ${error.message}`))
    }
}





export const viewResults = async (req, res, next) => {
        const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;
    const { courseID, lecturerID } = req.body


    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }
    try{

        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500,'Database connection failed'))
        }


        const advisorLevel = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT LevelID 
                FROM dbo.Level_Advisors
                WHERE StaffCode = @StaffCode 
                  AND DepartmentID = @DepartmentID
            `);

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;


   const query = `SELECT 
     r.MatricNo,
      CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
      r.CA_Score,
        r.Exam_Score,
        r.TotalScore,
        r.Grade,
        r.Remarks,
        c.course_code,
        c.course_title,
        CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
        l.LevelName

      FROM dbo.results r

        INNER JOIN dbo.courses c ON r.CourseID = c.course_id
      INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
      INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
      INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
      INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
      
      WHERE r.CourseID = @courseID
        AND ses.isActive = 1
        AND r.SubmittedBy = @StaffCode

        AND r.ResultType = 'Exam'
        AND r.ResultStatus = 'Approved'
        AND s.LevelID = @AssignedLevelID
        AND s.Department = @departmentId
     

      ORDER BY r.MatricNo
   `

   const results = await pool.request()
        .input('courseID', sql.Int, parseInt(courseID))
        .input('StaffCode', sql.VarChar, lecturerID)
        .input('AssignedLevelID', sql.Int, assignedLevelID)
        .input('departmentId', sql.Int, parseInt(departmentId))
        .query(query);


        if(results.recordset.length === 0){
            return next(errorHandler(404, "No results found for this course"))
        }

        return res.status(200).json({
            success: true,
            results: results.recordset,
            count: results.recordset.length
        });

    }catch(error){

        console.error('Internal server Error', error)
        return next(errorHandler(500, `Server error: ${error.message}`))
    }
}


export const downloadResults = async (req, res, next) => {
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;
    const { courseID, lecturerID } = req.query;

    if (!courseID || !lecturerID) {
        return next(errorHandler(400, "CourseID and LecturerID are required"));
    }

    if (!departmentId) {
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'))
        }

        // Get the level assigned to this advisor
        const advisorLevel = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT LevelID 
                FROM dbo.Level_Advisors
                WHERE StaffCode = @StaffCode 
                  AND DepartmentID = @DepartmentID
            `);

        if (advisorLevel.recordset.length === 0) {
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;

        // Query to get student results - exact same format as viewResults
        const query = `SELECT 
            r.MatricNo,
            CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
            r.CA_Score,
            r.Exam_Score,
            r.TotalScore,
            r.Grade,
            r.Remarks,
            c.course_code,
            c.course_title,
            CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
            l.LevelName
        FROM dbo.results r
        INNER JOIN dbo.courses c ON r.CourseID = c.course_id
        INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
        INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
        INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
        INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
        WHERE r.CourseID = @courseID
            AND ses.isActive = 1
            AND r.SubmittedBy = @StaffCode
            AND r.ResultType = 'Exam'
            AND r.ResultStatus = 'Approved'
            AND s.LevelID = @AssignedLevelID
            AND s.DepartmentID = @departmentId
        ORDER BY r.MatricNo
        `;

        const results = await pool.request()
            .input('courseID', sql.Int, parseInt(courseID))
            .input('StaffCode', sql.VarChar, lecturerID)
            .input('AssignedLevelID', sql.Int, assignedLevelID)
            .input('departmentId', sql.Int, parseInt(departmentId))
            .query(query);

        if (results.recordset.length === 0) {
            return next(errorHandler(404, "No results found for this course"))
        }

        const students = results.recordset;
        const courseInfo = students[0];

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Results');

        // Set column widths
        worksheet.columns = [
            { header: 'S/N', key: 'sn', width: 8 },
            { header: 'Matric Number', key: 'matricNo', width: 20 },
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Level', key: 'level', width: 10 },
            { header: 'CA Score (30)', key: 'caScore', width: 15 },
            { header: 'Exam Score (70)', key: 'examScore', width: 15 },
            { header: 'Total (100)', key: 'totalScore', width: 12 },
            { header: 'Grade', key: 'grade', width: 10 },
            { header: 'Remarks', key: 'remarks', width: 12 }
        ];

        // Add course information header
        worksheet.insertRow(1, ['Course Code:', courseInfo.CourseCode]);
        worksheet.insertRow(2, ['Course Name:', courseInfo.CourseName]);
        worksheet.insertRow(3, ['Credit Units:', courseInfo.CreditUnits]);
        worksheet.insertRow(4, ['Session:', courseInfo.SessionName]);
        worksheet.insertRow(5, ['Semester:', courseInfo.SemesterName]);
        worksheet.insertRow(6, ['Level:', courseInfo.LevelName]);
        worksheet.insertRow(7, ['Lecturer:', courseInfo.LecturerName]);
        worksheet.insertRow(8, ['Submitted Date:', courseInfo.SubmittedDate ? new Date(courseInfo.SubmittedDate).toLocaleDateString() : 'N/A']);
        worksheet.insertRow(9, ['Level:', courseInfo.LevelName]);
        worksheet.insertRow(4, ['Lecturer:', courseInfo.LecturerName]);
        worksheet.insertRow(5, ['Downloaded By:', 'Level Advisor']);
        worksheet.insertRow(6, ['Download Date:', new Date().toLocaleString()]);
        worksheet.insertRow(7, []);

        // Style header rows
        for (let i = 1; i <= 6; i++) {
            worksheet.getRow(i).getCell(1).font = { bold: true };
            worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
        }

        // Style table header (row 8)
        worksheet.getRow(8).font = { bold: true, size: 12 };
        worksheet.getRow(8).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(8).height = 25;
        worksheet.getRow(8).eachCell((cell) => {
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF000000' } },
                bottom: { style: 'medium', color: { argb: 'FF000000' } }
            };
        });

        // Add student data
        students.forEach((student, index) => {
            const row = worksheet.addRow({
                sn: index + 1,
                matricNo: student.MatricNo,
                name: student.StudentName,
                level: student.LevelName,
                caScore: student.CA_Score || '',
                examScore: student.Exam_Score || '',
                totalScore: student.TotalScore || '',
                grade: student.Grade || '',
                gradePoint: student.GradePoint || '',
                semesterGPA: student.SemesterGPA ? parseFloat(student.SemesterGPA).toFixed(2) : 'N/A',
                cgpa: student.CGPA ? parseFloat(student.CGPA).toFixed(2) : 'N/A',
                remarks: student.Remarks || '',
                remarks: student.Remarks || ''
            });

            // Add borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Color code grades
            // const gradeCell = row.getCell('grade');
            // switch (student.Grade) {
            //     case 'A':
            //         gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
            //         break;
            //     case 'B':
            //         gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
            //         break;
            //     case 'C':
            //         gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
            //         break;
            //     case 'D':
            //         gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
            //         break;
            //     case 'E':
            //     case 'F':
            //         gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFECACA' } };
            //         break;
            // }
        });

        const lastRow = worksheet.lastRow.number;
        worksheet.addRow([]);
        worksheet.addRow(['Statistics:', '']);
        worksheet.addRow(['Total Students:', students.length]);
        worksheet.addRow(['Pass Count:', students.filter(s => s.Remarks === 'Pass').length]);
        worksheet.addRow(['Fail Count:', students.filter(s => s.Remarks === 'Fail').length]);

        const scores = students.map(s => s.TotalScore).filter(s => s != null);
        if (scores.length > 0) {
            worksheet.addRow(['Average Score:', (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)]);
            worksheet.addRow(['Highest Score:', Math.max(...scores)]);
            worksheet.addRow(['Lowest Score:', Math.min(...scores)]);
        }

        // Style summary section
        for (let i = lastRow + 2; i <= worksheet.lastRow.number; i++) {
            worksheet.getRow(i).getCell(1).font = { bold: true };
            worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
        }

        // Protect worksheet
        await worksheet.protect('StudentDash2026', {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: false,
            formatColumns: false,
            formatRows: false,
            insertRows: false,
            insertColumns: false,
            deleteRows: false,
            deleteColumns: false,
            sort: false,
            autoFilter: false
        });

        // Generate filename
        const filename = `Advisor_${courseInfo.CourseCode}_Results_${courseInfo.CourseName}_${courseInfo.CourseName.replace('/', '-')}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Download results error:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}

export const approveResults = async(req, res, next)=>{
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;
    const { courseID, lecturerID, action } = req.body;

    if (!courseID || !lecturerID || !action) {
        return next(errorHandler(400, "CourseID, LecturerID and action are required"));
    }

    if (action !== 'Approved' && action !== 'Rejected') {
        return next(errorHandler(400, "Action must be either 'Approved' or 'Rejected'"));
    }

    if (!departmentId) {
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'))
        }

        // Get the level assigned to this advisor
        const advisorLevel = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT LevelID 
                FROM dbo.Level_Advisors
                WHERE StaffCode = @StaffCode 
                  AND DepartmentID = @DepartmentID
            `);

        if (advisorLevel.recordset.length === 0) {
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;

        // Update the Advisor column for all matching results
        const updateQuery = `
            UPDATE r
            SET r.Advisor = @Action
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatricNo
            INNER JOIN dbo.course c ON r.CourseID = c.CourseID
            INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
            WHERE r.CourseID = @CourseID
                AND r.SubmittedBy = @LecturerID
                AND ses.isActive = 1
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND s.LevelID = @AssignedLevelID
                AND s.Department = @DepartmentID
               
        `;

        const result = await pool.request()
            .input('Action', sql.VarChar, action)
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('LecturerID', sql.VarChar, lecturerID)
            .input('AssignedLevelID', sql.Int, assignedLevelID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return next(errorHandler(404, "No results found to update"))
        }

        return res.status(200).json({
            success: true,
            message: `Results ${action.toLowerCase()} successfully`,
            rowsAffected: result.rowsAffected[0]
        });

    } catch (error) {
        console.error('Approve results error:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}

// ============== NEW SIMPLIFIED CONTROLLERS ==============

// 1. Get Previous Cumulative Results (up to but not including current semester)
export const getPreviousCumulativeResults = async (req, res, next) => {
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;

    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
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

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;

    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
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

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;

    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
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

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;

    if(!departmentId){
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
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

        if(advisorLevel.recordset.length === 0){
            return next(errorHandler(404, "No level assigned to you as advisor"))
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;

        // Get active session and semester
        const activeSessionResult = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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
                c.SemesterID AS CourseSemester,
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
                    FROM dbo.course_registrations cr
                    CROSS APPLY STRING_SPLIT(COALESCE(CONVERT(NVARCHAR(MAX), cr.courses), ''), ',') reg
                    WHERE cr.mat_no = s.MatNo
                      AND TRY_CAST(LTRIM(RTRIM(reg.value)) AS INT) = c.course_id
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
            INNER JOIN dbo.courses c ON
                c.course_type = 'C'
                AND c.level_id <= @LevelID
                AND c.SemesterID = @PreviousSemesterID
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.Department = @DepartmentID
                AND NOT EXISTS (
                    SELECT 1
                    FROM dbo.course_registrations cr
                    CROSS APPLY STRING_SPLIT(COALESCE(CONVERT(NVARCHAR(MAX), cr.courses), ''), ',') reg
                    WHERE cr.mat_no = s.MatNo
                      AND TRY_CAST(LTRIM(RTRIM(reg.value)) AS INT) = c.course_id
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

// Advisor dashboard summary cards.
// - pendingApprovals: HOD-approved exam results not yet advisor-approved
// - totalStudents: all students in advisor-assigned level/programme
// - approvedResults: HOD-approved exam results approved by advisor
export const getDashboardStats = async (req, res, next) => {
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;

    if (!departmentId) {
        return next(errorHandler(403, "Department information missing in token"));
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const advisorLevel = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT TOP 1 LevelID, ProgrammeID
                FROM dbo.Level_Advisors
                WHERE StaffCode = @StaffCode
                  AND DepartmentID = @DepartmentID
            `);

        if (advisorLevel.recordset.length === 0) {
            return next(errorHandler(404, "No level assigned to you as advisor"));
        }

        const assignedLevelID = advisorLevel.recordset[0].LevelID;
        const assignedProgrammeID = advisorLevel.recordset[0].ProgrammeID;

        const totalStudentsResult = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT COUNT(*) AS TotalStudents
                FROM dbo.student s
                WHERE s.LevelID = @LevelID
                  AND s.ProgrammeID = @ProgrammeID
                  AND s.Department = @DepartmentID
            `);

        const resultCounts = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .query(`
                SELECT
                    SUM(CASE
                        WHEN (r.Advisor IS NULL OR LTRIM(RTRIM(r.Advisor)) <> 'Approved') THEN 1
                        ELSE 0
                    END) AS PendingApprovals,
                    SUM(CASE
                        WHEN LTRIM(RTRIM(r.Advisor)) = 'Approved' THEN 1
                        ELSE 0
                    END) AS ApprovedResults
                FROM dbo.results r
                INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
                WHERE s.LevelID = @LevelID
                  AND s.ProgrammeID = @ProgrammeID
                  AND s.Department = @DepartmentID
                  AND r.ResultType = 'Exam'
                  AND r.ResultStatus = 'Approved'
            `);

        const statsRow = resultCounts.recordset[0] || {};
        const studentsRow = totalStudentsResult.recordset[0] || {};

        return res.status(200).json({
            success: true,
            data: {
                pendingApprovals: Number(statsRow.PendingApprovals || 0),
                totalStudents: Number(studentsRow.TotalStudents || 0),
                approvedResults: Number(statsRow.ApprovedResults || 0)
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}

export const approveLevelResults = async(req,res,next)=>{
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

        // Get the level assigned to this advisor
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

        // Get active session
        const activeSession = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

        if (activeSession.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSession.recordset[0].SessionID;

        // Get active semester
        const activeSemester = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemester.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const activeSemesterID = activeSemester.recordset[0].SemesterID;

        // Pre-approval validation: Get statistics
        // const statsQuery = `
        //     SELECT 
        //         COUNT(DISTINCT s.MatricNo) AS TotalStudents,
        //         COUNT(DISTINCT r.MatricNo) AS StudentsWithResults,
        //         COUNT(DISTINCT r.CourseID) AS CoursesWithResults,
        //         SUM(CASE WHEN r.Advisor IS NULL THEN 1 ELSE 0 END) AS PendingApprovals,
        //         SUM(CASE WHEN r.Advisor = 'Approved' THEN 1 ELSE 0 END) AS AlreadyApproved,
        //         SUM(CASE WHEN r.Advisor = 'Rejected' THEN 1 ELSE 0 END) AS AlreadyRejected,
        //         SUM(CASE WHEN r.ResultStatus != 'Approved' THEN 1 ELSE 0 END) AS NotHODApproved,
        //         SUM(CASE WHEN c.CourseType = 'core' AND r.Grade = 'F' THEN 1 ELSE 0 END) AS FailedCoreCount
        //     FROM dbo.student s
        //     LEFT JOIN dbo.results r ON s.MatricNo = r.MatricNo 
        //         AND r.SessionID = @SessionID 
        //         AND r.SemesterID = @SemesterID
        //         AND r.ResultType = 'Exam'
        //     LEFT JOIN dbo.course c ON r.CourseID = c.CourseID
        //     WHERE s.LevelID = @LevelID
        //         AND s.ProgrammeID = @ProgrammeID
        //         AND s.DepartmentID = @DepartmentID
        // `;

        // const stats = await pool.request()
        //     .input('LevelID', sql.Int, assignedLevelID)
        //     .input('ProgrammeID', sql.Int, assignedProgrammeID)
        //     .input('DepartmentID', sql.Int, parseInt(departmentId))
        //     .input('SessionID', sql.Int, activeSessionID)
        //     .input('SemesterID', sql.Int, activeSemesterID)
        //     .query(statsQuery);

        // const statistics = stats.recordset[0];

        // // Validation checks
        // if (statistics.PendingApprovals === 0) {
        //     return res.status(200).json({
        //         success: true,
        //         message: "No pending results to approve. All results have already been processed.",
        //         statistics: statistics
        //     });
        // }

        // if (statistics.NotHODApproved > 0) {
        //     return next(errorHandler(400, `Cannot approve level results. ${statistics.NotHODApproved} result(s) are not yet approved by HOD.`))
        // }

        // if (statistics.StudentsWithResults < statistics.TotalStudents) {
        //     const missingCount = statistics.TotalStudents - statistics.StudentsWithResults;
        //     return next(errorHandler(400, `Cannot approve level results. ${missingCount} student(s) have no results submitted for current semester.`))
        // }

        // Update the Advisor column for all matching results
        const updateQuery = `
            UPDATE dbo.results
            SET Advisor = 'Approved',
                AdvisorApprovedDate = GETDATE(),
                AdvisorApprovedBy = @StaffCode
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Pending'
                
        `;

        const result = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode) 
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(updateQuery);

            if(result.rowsAffected[0] === 0){
                return next(errorHandler(404, "No results found to approve"))
                
            }


        return res.status(200).json({
            success: true,
            message: `Level ${assignedLevelID}00 results approved successfully`,
            rowsAffected: result.rowsAffected[0]
        });

    } catch (error) {
        console.error('Approve level results error:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}


export const rejectLevelResults = async(req,res,next)=>{
    const StaffCode = req.user.id;
    const departmentId = req.user.departmentID;
    const { reason } = req.body;

    if (!reason) {
        return next(errorHandler(400, "Rejection reason is required"));
    }

    if (!departmentId) {
        return next(errorHandler(403, "Department information missing in token"))
    }

    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, 'Database connection failed'))
        }

        // Get the level assigned to this advisor
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

        // Get active session
        const activeSession = await pool.request()
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

        if (activeSession.recordset.length === 0) {
            return next(errorHandler(404, "No active session found"))
        }

        const activeSessionID = activeSession.recordset[0].SessionID;

        // Get active semester
        const activeSemester = await pool.request()
            .query(`SELECT SemesterID, SemesterName FROM dbo.semesters WHERE isActive = 'true'`);

        if (activeSemester.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"))
        }

        const activeSemesterID = activeSemester.recordset[0].SemesterID;

        // Check if there are results to reject
        const checkQuery = `
            SELECT COUNT(*) AS PendingCount
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Pending'
        `;

        const checkResult = await pool.request()
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(checkQuery);

        if (checkResult.recordset[0].PendingCount === 0) {
            return res.status(200).json({
                success: true,
                message: "No pending results to reject. All results have already been processed."
            });
        }

        // Update the Advisor column for all matching results
        const updateQuery = `
            UPDATE r
            SET r.Advisor = 'Rejected',
                r.AdvisorRejectionReason = @Reason,
                r.AdvisorRejectedDate = GETDATE(),
                r.AdvisorRejectedBy = @StaffCode
            FROM dbo.results r
            INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
            INNER JOIN dbo.courses c ON r.CourseID = c.course_id
            WHERE s.LevelID = @LevelID
                AND s.ProgrammeID = @ProgrammeID
                AND s.department = @DepartmentID
                AND r.SessionID = @SessionID
                AND r.SemesterID = @SemesterID
                AND r.ResultType = 'Exam'
                AND r.ResultStatus = 'Approved'
                AND r.Advisor = 'Pending'
               
        `;

        const result = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .input('Reason', sql.NVarChar, reason)
            .input('LevelID', sql.Int, assignedLevelID)
            .input('ProgrammeID', sql.Int, assignedProgrammeID)
            .input('DepartmentID', sql.Int, parseInt(departmentId))
            .input('SessionID', sql.Int, activeSessionID)
            .input('SemesterID', sql.Int, activeSemesterID)
            .query(updateQuery);

        return res.status(200).json({
            success: true,
            message: `Level ${assignedLevelID}00 results rejected successfully`,
            rowsAffected: result.rowsAffected[0],
            reason: reason
        });

    } catch (error) {
        console.error('Reject level results error:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}

export const downloadLevelResults = async(req,res,next)=>{
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
            .query(`SELECT SessionID, SessionName FROM dbo.sessions WHERE isActive = 1`);

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

        // Create Excel workbook with multiple sheets
        const workbook = new ExcelJS.Workbook();

        // Helper function to add borders
        const addBorders = (cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        };

        // Helper function to convert column number to Excel column letter
        const getColumnLetter = (columnNumber) => {
            let dividend = columnNumber;
            let columnName = '';
            let modulo;

            while (dividend > 0) {
                modulo = (dividend - 1) % 26;
                columnName = String.fromCharCode(65 + modulo) + columnName;
                dividend = Math.floor((dividend - modulo) / 26);
            }

            return columnName;
        };

        // Sheet 1: Previous Cumulative Results
        const sheet1 = workbook.addWorksheet('Previous Cumulative');
        sheet1.mergeCells('A1:H1');
        sheet1.getCell('A1').value = `${departmentName} - ${programmeName}`;
        sheet1.getCell('A1').font = { size: 14, bold: true };
        sheet1.getCell('A1').alignment = { horizontal: 'center' };

        sheet1.mergeCells('A2:H2');
        sheet1.getCell('A2').value = `Previous Cumulative Results - Level ${assignedLevelID}00`;
        sheet1.getCell('A2').font = { size: 12, bold: true };
        sheet1.getCell('A2').alignment = { horizontal: 'center' };

        const header1 = sheet1.getRow(4);
        header1.values = ['S/N', 'Matric No', 'Core Units', 'Total Units', 'Units Passed', 'Cum. Points', 'CGPA', 'Core Failed'];
        header1.font = { bold: true };
        header1.alignment = { horizontal: 'center' };
        header1.eachCell(addBorders);

        previousCumulative.forEach((student, index) => {
            const row = sheet1.addRow([
                index + 1,
                student.MatNo,
                student.TotalCoreUnits || 0,
                student.TotalUnitsTaken || 0,
                student.TotalUnitsPassed || 0,
                student.CumulativeGradePoints || 0,
                student.CGPA || '0.00',
                student.CoreUnitsFailed || 0
            ]);
            row.eachCell(addBorders);
        });

        sheet1.columns = [
            { width: 8 }, { width: 15 }, { width: 12 }, { width: 12 }, 
            { width: 12 }, { width: 12 }, { width: 10 }, { width: 12 }
        ];

        // Sheet 2: Current Semester Courses (Horizontal Layout)
        const sheet2 = workbook.addWorksheet('Current Semester Courses');
        
        // Get unique courses and organize data by student
        const uniqueCourses = [];
        const courseMap = new Map();
        const studentCoursesMap = new Map();

        currentCourses.forEach(course => {
            const key = course.course_code;
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    CourseCode: course.course_code,
                    CourseName: course.course_title,
                    CreditUnits: course.credit_unit,
                    CourseType: course.course_type
                });
                uniqueCourses.push(key);
            }

            if (!studentCoursesMap.has(course.MatNo)) {
                studentCoursesMap.set(course.MatNo, {});
            }
            studentCoursesMap.get(course.MatNo)[course.course_code] = `${course.TotalScore}${course.Grade}`;
        });

        // Sort courses by course code
        uniqueCourses.sort();

        // Calculate merged cells range
        const totalColumns = 2 + uniqueCourses.length;
        const lastColumn = getColumnLetter(totalColumns);
        
        sheet2.mergeCells(`A1:${lastColumn}1`);
        sheet2.getCell('A1').value = `${departmentName} - ${programmeName}`;
        sheet2.getCell('A1').font = { size: 14, bold: true };
        sheet2.getCell('A1').alignment = { horizontal: 'center' };

        sheet2.mergeCells(`A2:${lastColumn}2`);
        sheet2.getCell('A2').value = `Current Semester Courses - ${activeSemesterName}, ${activeSessionName}`;
        sheet2.getCell('A2').font = { size: 12, bold: true };
        sheet2.getCell('A2').alignment = { horizontal: 'center' };

        // Create headers
        const header2Row = sheet2.getRow(4);
        const header2Values = ['S/N', 'Matric No'];
        uniqueCourses.forEach(courseCode => {
            const course = courseMap.get(courseCode);
            header2Values.push(`${courseCode}\n(${course.CreditUnits}U ${course.CourseType === 'core' ? 'C' : 'E'})`);
        });
        header2Row.values = header2Values;
        header2Row.font = { bold: true };
        header2Row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        header2Row.height = 30;
        header2Row.eachCell(addBorders);

        // Get unique students from the courses data
        const students = Array.from(studentCoursesMap.keys()).sort();

        // Add data rows
        students.forEach((matricNo, index) => {
            const rowValues = [index + 1, matricNo];
            const studentCourses = studentCoursesMap.get(matricNo);
            
            uniqueCourses.forEach(courseCode => {
                rowValues.push(studentCourses[courseCode] || '-');
            });

            const row = sheet2.addRow(rowValues);
            row.alignment = { horizontal: 'center' };
            row.eachCell(addBorders);
        });

        // Set column widths
        const sheet2Columns = [
            { width: 8 },  // S/N
            { width: 15 }  // Matric No
        ];
        uniqueCourses.forEach(() => {
            sheet2Columns.push({ width: 12 });
        });
        sheet2.columns = sheet2Columns;

        // Sheet 3: Semester Summary
        const sheet3 = workbook.addWorksheet('Semester Summary');
        sheet3.mergeCells('A1:M1');
        sheet3.getCell('A1').value = `${departmentName} - ${programmeName}`;
        sheet3.getCell('A1').font = { size: 14, bold: true };
        sheet3.getCell('A1').alignment = { horizontal: 'center' };

        sheet3.mergeCells('A2:M2');
        sheet3.getCell('A2').value = `Semester Summary - ${activeSemesterName}, ${activeSessionName}`;
        sheet3.getCell('A2').font = { size: 12, bold: true };
        sheet3.getCell('A2').alignment = { horizontal: 'center' };

        const header3 = sheet3.getRow(4);
        header3.values = [
            'S/N', 'Matric No', 'Full Name',
            'Curr Sem Units', 'Curr Passed', 'Curr Points', 'Curr GPA', 'Curr Core Failed',
            'Cum. Units', 'Cum. Passed', 'Cum. Points', 'CGPA', 'Cum. Core Failed'
        ];
        header3.font = { bold: true };
        header3.alignment = { horizontal: 'center' };
        header3.eachCell(addBorders);

        semesterSummary.forEach((student, index) => {
            const row = sheet3.addRow([
                index + 1,
                student.MatricNo,
                student.FullName,
                student.CurrentSemesterUnits || 0,
                student.CurrentSemesterUnitsPassed || 0,
                student.CurrentSemesterGradePoints || 0,
                student.CurrentGPA || '0.00',
                student.CurrentCoreUnitsFailed || 0,
                student.CumulativeUnits || 0,
                student.CumulativeUnitsPassed || 0,
                student.CumulativeGradePoints || 0,
                student.CGPA || '0.00',
                student.CumulativeCoreUnitsFailed || 0
            ]);
            row.eachCell(addBorders);
        });

        sheet3.columns = [
            { width: 8 }, { width: 15 }, { width: 25 }, { width: 12 }, 
            { width: 12 }, { width: 12 }, { width: 10 }, { width: 14 },
            { width: 12 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 14 }
        ];

        // Sheet 4: Carryover Courses (Aggregated by Student)
        const sheet4 = workbook.addWorksheet('Carryover Courses');
        sheet4.mergeCells('A1:D1');
        sheet4.getCell('A1').value = `${departmentName} - ${programmeName}`;
        sheet4.getCell('A1').font = { size: 14, bold: true };
        sheet4.getCell('A1').alignment = { horizontal: 'center' };

        sheet4.mergeCells('A2:D2');
        sheet4.getCell('A2').value = `Carryover Courses (Failed Core Courses from Previous Semester)`;
        sheet4.getCell('A2').font = { size: 12, bold: true };
        sheet4.getCell('A2').alignment = { horizontal: 'center' };

        const header4 = sheet4.getRow(4);
        header4.values = ['S/N', 'Matric No', 'Carryover Courses', 'Total Failed Units'];
        header4.font = { bold: true };
        header4.alignment = { horizontal: 'center' };
        header4.eachCell(addBorders);

        if (carryovers.length > 0) {
            // Group carryovers by student
            const carryoversByStudent = new Map();
            carryovers.forEach(course => {
                if (!carryoversByStudent.has(course.MatricNo)) {
                    carryoversByStudent.set(course.MatricNo, {
                        courses: [],
                        totalUnits: 0
                    });
                }
                const studentData = carryoversByStudent.get(course.MatricNo);
                studentData.courses.push(course.CourseCode);
                studentData.totalUnits += course.CreditUnits;
            });

            // Add aggregated rows
            let rowIndex = 1;
            carryoversByStudent.forEach((data, matricNo) => {
                const row = sheet4.addRow([
                    rowIndex++,
                    matricNo,
                    data.courses.join(', '),
                    data.totalUnits
                ]);
                row.eachCell(addBorders);
            });
        } else {
            const row = sheet4.addRow(['', '', 'No carryover courses found', '']);
            row.getCell(3).alignment = { horizontal: 'center' };
            row.eachCell(addBorders);
        }

        sheet4.columns = [
            { width: 8 }, { width: 15 }, { width: 40 }, { width: 15 }
        ];

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Level_${assignedLevelID}00_Complete_Results_${activeSessionName}_${activeSemesterName}.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Download level results error:', error);
        return next(errorHandler(500, `Server error: ${error.message}`));
    }
}