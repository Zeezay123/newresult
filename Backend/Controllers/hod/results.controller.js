import ExcelJS from 'exceljs'
import { sql, poolPromise } from "../../db.js";
import { errorHandler } from "../../utils/error.js";



//get result count for dashboard

export const getResultStats = async (req, res, next) => {
  const hodId = req.user.id;
  const departmentId = req.user.departmentID;

   if(!hodId || !departmentId){
    return next(errorHandler(400, "HOD ID and Department ID are required"));
   }


  try {
    const pool = await poolPromise;
    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }


// Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
  
    const result = await pool.request()
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .input('DepartmentId', sql.Int, parseInt(departmentId))
      .query(`SELECT COUNT(DISTINCT r.ResultID) AS TotalResults FROM dbo.results r 
        WHERE r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND r.ResultStatus = 'Submitted'
        `)

      if(result.recordset.length === 0){  
        return res.status(200).json({ success: true, stats: { total: 0 } });
      }


        //AND s.DepartmentId = @DepartmentId
    // LEFT JOIN dbo.tblStaffDirectory s ON r.SubmittedBy = s.StaffId




    return res.status(200).json({ success: true, stats: result.recordset[0] });

  }catch (error) {  
    console.log("Error fetching result stats:", error.stack);
    return next(errorHandler(500, "Server Error: " + error.message));
  }
}

//------ get all result
export const getALLExamResults = async (req, res, next) => {
  const HodId = req.user.departmentID;
  const { semesterID, levelID, search } = req.query;
   
  const SemesterID = parseInt(semesterID);
  const LevelID = parseInt(levelID);

  console.log("HOD ID:", HodId, "SemesterID:", SemesterID, "LevelID:", LevelID, "Search:", search);

  if (!HodId) {
    return res.status(400).json({ message: "HOD ID is required" });
  }
   
  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
     
    const whereConditions = [`1=1`];
    whereConditions.push(`r.ResultType = 'Exam'`);
    whereConditions.push(`r.SessionID = @activeSessionID`);
    whereConditions.push(`r.SemesterID = @activeSemesterID`);
    whereConditions.push(`(
      s.department = @HodId
    )`);
    
    const params = []
    let paramIndex = 1; 
    let filtersClause = '';

    if (SemesterID) {
      filtersClause += `AND r.SemesterID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: SemesterID });
      paramIndex++;
    }

    if (LevelID) {
      filtersClause += `AND r.LevelID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: LevelID });
      paramIndex++;
    }

    if (search) {
      filtersClause += `AND (c.course_code LIKE @param${paramIndex} OR c.course_title LIKE @param${paramIndex}) `
      params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
      paramIndex++;
    }
   
    let query = `
SELECT 
COUNT(DISTINCT r.MatricNo) as StudentCount,
MAX(ISNULL(reg.TotalStudents, 0)) AS TotalStudents,
r.CourseID,
c.course_code,
c.course_title,
r.semesterID,
l.LevelName,
r.sessionID,
r.SubmittedBy,
r.ResultStatus,
r.ResultType,

CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName

FROM dbo.results r
INNER JOIN dbo.courses c ON r.CourseID = c.course_id
INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
OUTER APPLY (
    SELECT COUNT(DISTINCT cr.mat_no) AS TotalStudents
    FROM dbo.registrated_courses cr
    WHERE cr.session = r.SessionID
      AND cr.CourseID = r.CourseID
      )
) reg

WHERE ${whereConditions.join(' AND ')}
${filtersClause}

GROUP BY r.CourseID, c.course_code, c.course_title, r.semesterID, l.LevelName, 
         r.sessionID, CONCAT(staff.LastName, ' ', staff.OtherNames), r.SubmittedBy, r.ResultStatus, r.ResultType
ORDER BY c.course_code`;

  const request = pool.request()
    .input('HodId', sql.Int, parseInt(HodId))
    .input('activeSessionID', sql.Int, activeSessionID)
    .input('activeSemesterID', sql.Int, activeSemesterID);
  
  params.forEach(param => {
    request.input(param.name, param.type, param.value);
  });

  const result = await request.query(query);

    return res
      .status(200)
      .json({ success: true, results: result.recordset, count: result.recordset.length });
  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
};



// ----------------- View Test-------------------
export const getTestResults = async (req, res, next) => {
  const HodId = req.params.id;
  const { semesterID, levelID, search } = req.query;
   
  const SemesterID = parseInt(semesterID);
  const LevelID = parseInt(levelID);

  if (!HodId) {
    return res.status(400).json({ message: "HOD ID is required" });
  }
   

  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
     
   
    const whereConditions = [`1=1`];
    whereConditions.push(`r.ResultType = 'Test'`);
    whereConditions.push(`r.ResultStatus = 'Test'`);
    whereConditions.push(`r.SessionID = @activeSessionID`);
    whereConditions.push(`r.SemesterID = @activeSemesterID`);
    whereConditions.push(`(
      s.Department = @HodId
    )`);

    
   
    const params = []
    let paramIndex = 1; 
    let filtersClause = '';


    if (SemesterID) {
      filtersClause += `AND r.SemesterID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: SemesterID });
      paramIndex++;
    }

    if (LevelID) {
      filtersClause += `AND r.LevelID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: LevelID });
      paramIndex++;
    }

    if (search) {
      filtersClause += `AND (c.course_code LIKE @param${paramIndex} OR c.course_title LIKE @param${paramIndex}) `
      params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
      paramIndex++;
    }



   
    let query = `
SELECT 
COUNT(DISTINCT r.MatricNo) as StudentCount,  
r.CourseID,
c.course_code,
c.course_title,
r.semesterID,
l.LevelName,
r.sessionID, 
r.SubmittedBy,

CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName

FROM dbo.results r
INNER JOIN dbo.courses c ON r.CourseID = c.course_id
INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
INNER JOIN dbo.student s ON r.MatricNo = s.MatNo

WHERE ${whereConditions.join(' AND ')}
${filtersClause}

GROUP BY r.CourseID, c.course_code, c.course_title, r.semesterID, l.LevelName, 
         r.sessionID, CONCAT(staff.LastName, ' ', staff.OtherNames), r.SubmittedBy
ORDER BY c.course_code`;

  const request = pool.request()
    .input('HodId', sql.Int, parseInt(HodId))
    .input('activeSessionID', sql.Int, activeSessionID)
    .input('activeSemesterID', sql.Int, activeSemesterID);
  
  params.forEach(param => {
    request.input(param.name, param.type, param.value);
  });

  const result = await request.query(query);

    return res
      .status(200)
      .json({ success: true, results: result.recordset, count: result.recordset.length });
  } catch (error) {
    return next(errorHandler(500, "Server Error" + error.message));
  }
};


// ----------------- View Test-------------------

export const viewTestResultDetails = async (req, res, next) => {
  const { courseID, semesterID, staffCode } = req.body;
  const hodId = req.params.id;

  if (!courseID) {
    return next(errorHandler(400, "CourseID is are required"));
  }

  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

    // Get individual student results
    const query = `
      SELECT 
        r.MatricNo,
        CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
        r.CA_Score,
        c.course_code,
        CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
        l.levelName

      FROM dbo.results r
      
      INNER JOIN dbo.courses c ON r.CourseID = c.course_id
      INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
      INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
      INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
      INNER JOIN dbo.student s ON r.MatricNo = s.MatNo

      
      WHERE r.CourseID = @courseID
        AND r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND r.SubmittedBy = @StaffCode
       
        AND r.ResultType = 'Test'
        AND s.Department = @hodId
      ORDER BY r.MatricNo
    `;

    const result = await pool.request()
      .input('courseID', sql.Int, parseInt(courseID))
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .input('hodId', sql.Int, parseInt(hodId))
      .input('StaffCode', sql.VarChar, staffCode)
      .query(query);

    if (result.recordset.length === 0) {
      return next(errorHandler(404, "No test results found for this course"));
    }

    // Calculate statistics
    // const scores = result.recordset.map(r => r.CA_Score).filter(s => s !== null);
    // const stats = {
    //   totalStudents: result.recordset.length,
    //   averageScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0,
    //   minScore: scores.length > 0 ? Math.min(...scores) : 0,
    //   maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    //   passCount: result.recordset.filter(r => r.Remarks === 'Pass').length,
    //   failCount: result.recordset.filter(r => r.Remarks === 'Fail').length
    // };

    // // Get course info from first record
    // const courseInfo = result.recordset[0];

    return res.status(200).json({
      success: true,
      // courseInfo: {
      //   courseCode: courseInfo.CourseCode,
      //   courseName: courseInfo.CourseName,
      //   creditUnits: courseInfo.CreditUnits,
      //   sessionName: courseInfo.SessionName,
      //   semesterName: courseInfo.SemesterName,
      //   lecturerName: courseInfo.LecturerName,
      //   submittedDate: courseInfo.SubmittedDate
      // },
      // stats,
      students: result.recordset
    });

  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
}


export const downloadTestResults = async (req, res, next) => {
  const { courseID, staffCode } = req.query;
  const hodId = req.params.id;

  if (!courseID || !staffCode) {
    return next(errorHandler(400, "CourseID and StaffCode are required"));
  }

  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

    // Get student results
    const query = `
      SELECT 
        r.MatricNo,
        CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
        l.LevelName,
        r.CA_Score,
        r.Grade,
        r.Remarks,
        c.course_code,
        c.course_title,
        c.credit_unit,
        ses.SessionName,
        sem.SemesterName,
        CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
        r.SubmittedDate
      FROM dbo.results r
      INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
      INNER JOIN dbo.courses c ON r.CourseID = c.course_id
      INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
      INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
      INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
      INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
      WHERE r.CourseID = @courseID
        AND r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND r.SubmittedBy = @staffCode
        AND r.ResultType = 'Test'
        AND s.Department = @hodId
      ORDER BY r.MatricNo
    `;

    const result = await pool.request()
      .input('courseID', sql.Int, parseInt(courseID))
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .input('staffCode', sql.VarChar, staffCode)
      .input('hodId', sql.Int, parseInt(hodId))
      .query(query);

    if (result.recordset.length === 0) {
      return next(errorHandler(404, "No test results found"));
    }

    const students = result.recordset;
    const courseInfo = students[0];

    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Results');

    // Set column widths
    worksheet.columns = [
      { header: 'S/N', key: 'sn', width: 8 },
      { header: 'Matric Number', key: 'matricNo', width: 20 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'CA Score', key: 'caScore', width: 15 },
      { header: 'Grade', key: 'grade', width: 10 },
      { header: 'Remarks', key: 'remarks', width: 12 }
    ];

    // Add course information header
    worksheet.insertRow(1, ['course code:', courseInfo.course_code]);
    worksheet.insertRow(2, ['Course Name:', courseInfo.course_title]);
    worksheet.insertRow(3, ['Session:', courseInfo.SessionName]);
    worksheet.insertRow(4, ['Semester:', courseInfo.SemesterName]);
    worksheet.insertRow(5, ['Lecturer:', courseInfo.LecturerName]);
    worksheet.insertRow(6, ['Submitted Date:', courseInfo.SubmittedDate ? new Date(courseInfo.SubmittedDate).toLocaleDateString() : 'N/A']);
    worksheet.insertRow(7, []);

    // Style header rows
    for (let i = 1; i <= 6; i++) {
      worksheet.getRow(i).getCell(1).font = { bold: true };
      worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
    }

    // Style table header
    worksheet.getRow(8).font = { bold: true, size: 12 };
    worksheet.getRow(8).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(8).height = 25;
    worksheet.getRow(8).eachCell((cell) => {
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
    });

    // Add student data
    students.forEach((student, index) => {
      const row = worksheet.addRow({
        sn: index + 1,
        matricNo: student.MatricNo,
        name: student.StudentName,
        level: student.LevelName,
        caScore: student.CA_Score || '',
        grade: student.Grade || '',
        remarks: student.Remarks || ''
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

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
    const filename = `${courseInfo.CourseCode}_Test_Results_${courseInfo.SessionName.replace('/', '-')}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
}





// --------------------------------------------
export const getExamResults = async (req, res, next) => {
  const HodId = req.params.id;
  const { semesterID, levelID, search } = req.query;
   
  const SemesterID = parseInt(semesterID);
  const LevelID = parseInt(levelID);

  if (!HodId) {
    return res.status(400).json({ message: "HOD ID is required" });
  }
   
  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
     
    const whereConditions = [`1=1`];
    whereConditions.push(`r.ResultType = 'Exam'`);
    whereConditions.push(`r.ResultStatus = 'Submitted'`);
    whereConditions.push(`r.SessionID = @activeSessionID`);
    whereConditions.push(`r.SemesterID = @activeSemesterID`);
    whereConditions.push(`(
      s.Department = @HodId)`);
    
    const params = []
    let paramIndex = 1; 
    let filtersClause = '';

    if (SemesterID) {
      filtersClause += `AND r.SemesterID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: SemesterID });
      paramIndex++;
    }

    if (LevelID) {
      filtersClause += `AND r.LevelID = @param${paramIndex} `
      params.push({ name: `param${paramIndex}`, type: sql.Int, value: LevelID });
      paramIndex++;
    }

    if (search) {
      filtersClause += `AND (c.course_code LIKE @param${paramIndex} OR c.course_name LIKE @param${paramIndex}) `
      params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
      paramIndex++;
    }
   
    let query = `
SELECT 
COUNT(DISTINCT r.MatricNo) as StudentCount,  
r.CourseID,
c.course_code,
c.course_title,
r.semesterID,
l.LevelName,
r.sessionID,
r.SubmittedBy,
r.ResultStatus,
CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName

FROM dbo.results r
INNER JOIN dbo.courses c ON r.CourseID = c.course_id
INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
INNER JOIN dbo.student s ON r.MatricNo = s.MatNo

WHERE ${whereConditions.join(' AND ')}
${filtersClause}

GROUP BY r.CourseID, c.course_code, c.course_title, r.semesterID, l.LevelName, 
         r.sessionID, CONCAT(staff.LastName, ' ', staff.OtherNames), r.SubmittedBy, r.ResultStatus
ORDER BY c.course_code`;

  const request = pool.request()
    .input('HodId', sql.Int, parseInt(HodId))
    .input('activeSessionID', sql.Int, activeSessionID)
    .input('activeSemesterID', sql.Int, activeSemesterID);
  
  params.forEach(param => {
    request.input(param.name, param.type, param.value);
  });

  const result = await request.query(query);

    return res
      .status(200)
      .json({ success: true, results: result.recordset, count: result.recordset.length });
  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
};


// View Exam Result Details
export const viewExamResultDetails = async (req, res, next) => {
  const { courseID, staffCode } = req.body;
  const hodId = req.params.id;

  if (!courseID) {
    return next(errorHandler(400, "CourseID is required"));
  }

  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

    // Get individual student exam results
    const query = `
      SELECT 
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
        AND r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND r.SubmittedBy = @StaffCode

        AND r.ResultType = 'Exam'
        AND r.ResultStatus = 'Submitted'
        AND s.Department = @hodId
      ORDER BY r.MatricNo
    `;

    const result = await pool.request()
      .input('courseID', sql.Int, parseInt(courseID))
      .input('hodId', sql.Int, parseInt(hodId))
      .input('StaffCode', sql.VarChar, staffCode)
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .query(query);

    if (result.recordset.length === 0) {
      return next(errorHandler(404, "No exam results found for this course"));
    }

    return res.status(200).json({
      success: true,
      students: result.recordset
    });

  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
}


// Download Exam Results
export const downloadExamResults = async (req, res, next) => {
  const { courseID, staffCode } = req.query;
  const hodId = req.params.id;

  if (!courseID || !staffCode) {
    return next(errorHandler(400, "CourseID and StaffCode are required"));
  }

  try {
    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

    // Get student exam results
    const query = `
      SELECT 
        r.MatricNo,
        CONCAT(s.LastName, ' ', s.OtherNames) AS StudentName,
        l.LevelName,
        r.CA_Score,
        r.Exam_Score,
        r.TotalScore,
        r.Grade,
        r.Remarks,
        c.course_code,
        c.course_title,
        c.credit_unit,
        ses.SessionName,
        sem.SemesterName,
        CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
        r.SubmittedDate
      FROM dbo.results r
      INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
      INNER JOIN dbo.courses c ON r.CourseID = c.course_id
      INNER JOIN dbo.levels l ON r.LevelID = l.LevelID
      INNER JOIN dbo.sessions ses ON r.SessionID = ses.SessionID
      INNER JOIN dbo.semesters sem ON r.SemesterID = sem.SemesterID
      INNER JOIN dbo.tblStaffDirectory staff ON r.SubmittedBy = staff.StaffId
      WHERE r.CourseID = @courseID
        AND r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND r.SubmittedBy = @staffCode
        AND r.ResultType = 'Exam'
        AND r.ResultStatus = 'Submitted'
        AND s.Department = @hodId
      ORDER BY r.MatricNo
    `;

    const result = await pool.request()
      .input('courseID', sql.Int, parseInt(courseID))
      .input('staffCode', sql.VarChar, staffCode)
      .input('hodId', sql.Int, parseInt(hodId))
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .query(query);

    if (result.recordset.length === 0) {
      return next(errorHandler(404, "No exam results found"));
    }

    const students = result.recordset;
    const courseInfo = students[0];

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Exam Results');

    // Set column widths
    worksheet.columns = [
      { header: 'S/N', key: 'sn', width: 8 },
      { header: 'Matric Number', key: 'matricNo', width: 20 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'CA Score', key: 'caScore', width: 15 },
      { header: 'Exam Score', key: 'examScore', width: 15 },
      { header: 'Total', key: 'totalScore', width: 12 },
      { header: 'Grade', key: 'grade', width: 10 },
      { header: 'Remarks', key: 'remarks', width: 12 }
    ];

    // Add course information header
    worksheet.insertRow(1, ['Course Code:', courseInfo.CourseCode]);
    worksheet.insertRow(2, ['Course Name:', courseInfo.CourseName]);
    worksheet.insertRow(3, ['Session:', courseInfo.SessionName]);
    worksheet.insertRow(4, ['Semester:', courseInfo.SemesterName]);
    worksheet.insertRow(5, ['Lecturer:', courseInfo.LecturerName]);
    worksheet.insertRow(6, ['Submitted Date:', courseInfo.SubmittedDate ? new Date(courseInfo.SubmittedDate).toLocaleDateString() : 'N/A']);
    worksheet.insertRow(7, []);

    // Style header rows
    for (let i = 1; i <= 6; i++) {
      worksheet.getRow(i).getCell(1).font = { bold: true };
      worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
    }

    // Style table header
    worksheet.getRow(8).font = { bold: true, size: 12 };
    worksheet.getRow(8).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(8).height = 25;
    worksheet.getRow(8).eachCell((cell) => {
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
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
        remarks: student.Remarks || ''
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

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
    const filename = `${courseInfo.CourseCode}_Exam_Results_${courseInfo.SessionName.replace('/', '-')}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }
}


// approve or reject exam results
export const approveOrRejectExamResults = async(req, res, next)=>{
  const { courseID, staffCode, status } = req.body;
  const hodId = req.params.id;

  if(!hodId){
      return next(errorHandler(400, "HOD ID is required"))
  }

  if(!courseID || !staffCode || !status){
     return next(errorHandler(400, "CourseID, StaffCode and Status are required"))
  }

  try {


    const pool = await poolPromise;

    if (!pool) {
      return next(errorHandler(500, "Database connection failed"));
    }

    // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = '1'`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

    const chexkExistence = await pool.request()
      .input('courseID', sql.Int, parseInt(courseID))
      .input('staffCode', sql.VarChar, staffCode)
      .input('hodId', sql.Int, parseInt(hodId))
      .input('activeSessionID', sql.Int, activeSessionID)
      .input('activeSemesterID', sql.Int, activeSemesterID)
      .query(`
        SELECT COUNT(*) AS count FROM dbo.results r
        INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
        WHERE r.CourseID = @courseID
          AND r.SubmittedBy = @staffCode
          AND r.ResultType = 'Exam'
          AND r.ResultStatus = 'Submitted'
          AND r.SessionID = @activeSessionID
          AND r.SemesterID = @activeSemesterID
          AND s.Department = @hodId
      `);
      
      if(chexkExistence.recordset[0].count === 0){
        return next(errorHandler(404, "No submitted exam results found for this course"))
      }

      //now to update the results status
      const updateQuery = `
      UPDATE r
      SET r.ResultStatus = @status
      FROM dbo.results r
      INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
      WHERE r.CourseID = @courseID
        AND r.SubmittedBy = @staffCode
        AND r.ResultType = 'Exam'
        AND r.ResultStatus = 'Submitted'
        AND r.SessionID = @activeSessionID
        AND r.SemesterID = @activeSemesterID
        AND s.Department = @hodId
      `

      const result = await pool.request()
        .input('status', sql.VarChar, status)
        .input('courseID', sql.Int, parseInt(courseID))
        .input('staffCode', sql.VarChar, staffCode)
        .input('hodId', sql.Int, parseInt(hodId))
        .input('activeSessionID', sql.Int, activeSessionID)
        .input('activeSemesterID', sql.Int, activeSemesterID)
        .query(updateQuery);

        if(result.rowsAffected[0] === 0){
          return next(errorHandler(500, "Failed to update exam results status"))
        }

        // If approved, calculate and update GPA
        if(status === 'Approved'){
          try {
            // Use the active session and semester IDs
            const sessionID = activeSessionID;
            const semesterID = activeSemesterID;

            // Get all students affected by this approval
            const affectedStudents = await pool.request()
              .input('courseID', sql.Int, parseInt(courseID))
              .input('staffCode', sql.VarChar, staffCode)
              .input('sessionID', sql.Int, sessionID)
              .input('semesterID', sql.Int, semesterID)
              .input('hodId', sql.Int, parseInt(hodId))
              .query(`
                SELECT DISTINCT r.StudentID, r.MatricNo, r.LevelID, s.Department
                FROM dbo.results r
                INNER JOIN dbo.student s ON r.MatricNo = s.MatNo
                WHERE r.CourseID = @courseID
                  AND r.SubmittedBy = @staffCode
                  AND r.SessionID = @sessionID
                  AND r.SemesterID = @semesterID
                  AND r.ResultStatus = 'Approved'
                  AND s.Department = @hodId
              `)
               
              // Calculate GPA for each student
              for(const student of affectedStudents.recordset){
                // Calculate Semester GPA
                const semesterGPA = await pool.request()
                  .input('studentID', sql.Int, student.StudentID)
                  .input('sessionID', sql.Int, sessionID)
                  .input('semesterID', sql.Int, semesterID)
                  .query(`
                    SELECT 
                      SUM(r.GradePoint * r.CreditUnits) AS TotalGradePoints,
                      SUM(r.CreditUnits) AS TotalUnits,
                      SUM(r.DeficitPoint) AS TotalDeficitUnits
                  

                    FROM dbo.results r
                    WHERE r.StudentID = @studentID
                      AND r.SessionID = @sessionID
                      AND r.SemesterID = @semesterID
                      AND r.ResultStatus = 'Approved'
                      AND r.ResultType = 'Exam'
                      AND r.GradePoint IS NOT NULL
                  `);

                console.log(`Semester GPA calculation for Student ${student.StudentID}:`, semesterGPA.recordset[0]);

                const semGPA = semesterGPA.recordset[0].TotalUnits > 0 
                  ? (semesterGPA.recordset[0].TotalGradePoints / semesterGPA.recordset[0].TotalUnits).toFixed(2)
                  : 0;

                const semTotalUnits = semesterGPA.recordset[0].TotalUnits || 0;
                const semTotalDeficitUnits = semesterGPA.recordset[0].TotalDeficitUnits || 0;

                // Calculate Cumulative GPA (all approved semesters up to current)
                const cumulativeGPA = await pool.request()
                  .input('studentID', sql.Int, student.StudentID)
                  .input('sessionID', sql.Int, sessionID)
                  .input('semesterID', sql.Int, semesterID)
                  .query(`
                    SELECT 
                      SUM(r.GradePoint * r.CreditUnits) AS TotalGradePoints,
                      SUM(r.CreditUnits) AS TotalUnits,
                      SUM(r.DeficitPoint) AS TotalDeficitUnits
                    FROM dbo.results r
                    WHERE r.StudentID = @studentID
                      AND r.ResultStatus = 'Approved'
                      AND r.ResultType = 'Exam'
                      AND r.GradePoint IS NOT NULL
                      AND (
                        r.SessionID < @sessionID 
                        OR (r.SessionID = @sessionID AND r.SemesterID <= @semesterID)
                      )
                  `);

                console.log(`Cumulative GPA calculation for Student ${student.StudentID}:`, cumulativeGPA.recordset[0]);

                const cumGPA = cumulativeGPA.recordset[0].TotalUnits > 0
                  ? (cumulativeGPA.recordset[0].TotalGradePoints / cumulativeGPA.recordset[0].TotalUnits).toFixed(2)
                  : 0;

                const cumTotalUnits = cumulativeGPA.recordset[0].TotalUnits || 0;
                const cumTotalDeficitUnits = cumulativeGPA.recordset[0].TotalDeficitUnits || 0;
                
                console.log(`GPA Summary for Student ${student.MatricNo}:`, {
                  semesterGPA: semGPA,
                  cumulativeGPA: cumGPA,
                  semesterUnits: semTotalUnits,
                  cumulativeUnits: cumTotalUnits
                });

                // Insert or update student_gpa table
                const existingGPA = await pool.request()
                  .input('studentID', sql.Int, student.StudentID)
                  .input('sessionID', sql.Int, sessionID)
                  .input('semesterID', sql.Int, semesterID)
                  .query(`
                    SELECT gpaID FROM dbo.student_gpa
                    WHERE StudentID = @studentID
                      AND SessionID = @sessionID
                      AND SemesterID = @semesterID
                  `);

                if(existingGPA.recordset.length > 0){
                  // Update existing GPA record
                  console.log(`Updating existing GPA record for ${student.MatricNo}`);
                  await pool.request()
                    .input('gpaID', sql.Int, existingGPA.recordset[0].gpaID)
                    .input('semesterGPA', sql.Decimal(3,2), parseFloat(semGPA))
                    .input('cumulativeGPA', sql.Decimal(3,2), parseFloat(cumGPA))
                    .input('semesterUnits', sql.Int, semTotalUnits)
                    .input('cumulativeUnits', sql.Int, cumTotalUnits)
                    .input('semesterDeficitUnits', sql.Int, semTotalDeficitUnits)
                    .input('cumulativeDeficitUnits', sql.Int, cumTotalDeficitUnits)
                    .input('departmentID', sql.Int, student.Department)
                    .query(`
                      UPDATE dbo.student_gpa
                      SET GPA = @semesterGPA,
                          CGPA = @cumulativeGPA,
                          TotalCreditUnits = @semesterUnits,
                          CumulativeCreditUnits = @cumulativeUnits,
                          TotalCreditUnitsFailed = @semesterDeficitUnits,
                          TotalCreditUnitsPassed = @semesterUnits - @semesterDeficitUnits,
                          CumulativeCreditUnitsFailed = @cumulativeDeficitUnits,
                          CumulativeCreditUnitsPassed = @cumulativeUnits - @cumulativeDeficitUnits,
                          DepartmentID = @departmentID,
                          CalculatedDate = GETDATE()
                      WHERE gpaID = @gpaID
                    `);
                } else {
                  // Insert new GPA record
                  console.log(`Inserting new GPA record for ${student.MatricNo}`);
                  const insertResult = await pool.request()
                    .input('studentID', sql.Int, student.StudentID)
                    .input('matricNo', sql.VarChar, student.MatricNo)
                    .input('sessionID', sql.Int, sessionID)
                    .input('semesterID', sql.Int, semesterID)
                    .input('semesterGPA', sql.Decimal(3,2), parseFloat(semGPA))
                    .input('cumulativeGPA', sql.Decimal(3,2), parseFloat(cumGPA))
                    .input('semesterUnits', sql.Int, semTotalUnits)
                    .input('cumulativeUnits', sql.Int, cumTotalUnits)
                    .input('semesterDeficitUnits', sql.Int, semTotalDeficitUnits)
                    .input('cumulativeDeficitUnits', sql.Int, cumTotalDeficitUnits)
                    .input('LevelID', sql.Int, student.LevelID)
                    .input('departmentID', sql.Int, student.Department)
                    .query(`
                      INSERT INTO dbo.student_gpa 
                      (StudentID, MatricNo, SessionID, SemesterID, GPA, CGPA, TotalCreditUnits, CumulativeCreditUnits, TotalCreditUnitsFailed, CumulativeCreditUnitsFailed, TotalCreditUnitsPassed, CumulativeCreditUnitsPassed, CalculatedDate, LevelID, DepartmentID)
                      VALUES 
                      (@studentID, @matricNo, @sessionID, @semesterID, @semesterGPA, @cumulativeGPA, @semesterUnits, @cumulativeUnits, @semesterDeficitUnits, @cumulativeDeficitUnits, @semesterUnits - @semesterDeficitUnits, @cumulativeUnits - @cumulativeDeficitUnits, GETDATE(), @LevelID, @departmentID)
                    `);
                  console.log(`GPA inserted successfully for ${student.MatricNo}, rows affected:`, insertResult.rowsAffected);
                }
              }
          } catch (gpaError) {
            console.error("GPA Calculation Error:", gpaError);
            console.error("GPA Error Stack:", gpaError.stack);
            // Don't fail the approval if GPA calculation fails, but log the error
          }
        }

        return res.status(200).json({
          success: true,
          message: `Exam results have been ${status === 'Approved' ? 'approved' : 'rejected'} successfully`
        });



  } catch (error) {
    return next(errorHandler(500, "Server Error: " + error.message));
  }

}


