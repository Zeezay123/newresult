import { sql, poolPromise } from '../../db.js';
import { errorHandler } from '../../utils/error.js';
import ExcelJS from 'exceljs';

// Generate Excel template with registered students
export const downloadResultTemplate = async (req, res, next) => {
    const { courseId } = req.query;

    try {
        const pool = await poolPromise;

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
  
         const sessionID = activeSessionResult.recordset[0].SessionID;
        


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

         const semesterID = activeSemesterResult.recordset[0].SemesterID;
         
            if (!courseId) {
            return next(errorHandler(400, "Course is required"));
            }

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        if (!courseId) {
            return next(errorHandler(400, "Course, Session, and Semester are required"));
        }

        // Get course details and registered students
        const result = await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('SessionID', sql.Int, sessionID)
            .input('SemesterID', sql.Int, semesterID)
            .query(`
                SELECT 
                    s.StudentID,
                    s.MatNo,
                    s.LastName,
                    s.OtherNames,
                    c.course_code,
                    c.course_title,
                    c.credit_unit,
                    ses.SessionName,
                    sem.SemesterName,
                    d.DepartmentName,
                    l.LevelName
                FROM dbo.course_registrations cr
                INNER JOIN dbo.Student s ON cr.mat_no = s.MatNo
                INNER JOIN dbo.courses c ON c.course_id = @CourseID
                LEFT JOIN dbo.sessions ses ON cr.session = ses.SessionID
                LEFT JOIN dbo.semesters sem ON cr.SemesterID = sem.SemesterID
                LEFT JOIN dbo.AppDepartment d ON s.department = d.DepartmentID
                LEFT JOIN dbo.levels l ON s.LevelID = l.LevelID
                WHERE EXISTS (
                    SELECT 1
                    FROM STRING_SPLIT(CAST(ISNULL(cr.courses, '') AS NVARCHAR(MAX)), ',') AS registeredCourse
                    WHERE TRY_CAST(LTRIM(RTRIM(registeredCourse.value)) AS INT) = @CourseID
                )
                    AND cr.session = @SessionID
                    AND cr.SemesterID = @SemesterID
                ORDER BY s.MatNo
            `);

        if (result.recordset.length === 0) {
            return next(errorHandler(404, "No students registered for this course"));
        }

        const students = result.recordset;
        const courseInfo = students[0]; // Get course info from first record

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Results');

        // Set column widths
        worksheet.columns = [
            { header: 'S/N', key: 'sn', width: 8 },
            { header: 'Matric Number', key: 'MatNo', width: 20 },
            { header: 'Name', key: 'Name', width: 50 },
            { header: 'Test Score (30)', key: 'testScore', width: 15 },
            { header: 'Exam Score (70)', key: 'examScore', width: 15 },
            { header: 'Total Score (100)', key: 'totalScore', width: 15 },
            { header: 'Grade', key: 'grade', width: 10 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).eachCell((cell)=>{
        cell.border={
            bottom: {style:'medium', color: {argb:'FF000000'}}
        }
      })

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FF000000' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 25;

        // Add course information at the top (insert rows before data)
        worksheet.insertRow(1, ['Course Code:', courseInfo.course_code]);
        worksheet.insertRow(2, ['Course Name:', courseInfo.course_title]);
        worksheet.insertRow(3, ['Session:', courseInfo.SessionName]);
        worksheet.insertRow(4, ['Semester:', courseInfo.SemesterName]);
        worksheet.insertRow(5, ['Credit Units:', courseInfo.credit_unit]);
        worksheet.insertRow(6, ['Department Name:', courseInfo.DepartmentName]);
        worksheet.insertRow(7, []); // Empty row

        // Style course info rows
        for (let i = 1; i <= 6; i++) {
            worksheet.getRow(i).getCell(1).font = { bold: true };
            worksheet.getRow(i).getCell(2).font = { bold: true, color: { argb: 'FF1E3A8A' } };
        }

        // Add student data starting from row 8 (after course info + empty row + header)
        students.forEach((student, index) => {
            const row = worksheet.addRow({
                sn: index + 1,
                MatNo: student.MatNo,
                Name: student.LastName + ' ' + student.OtherNames,
                testScore: '',
                examScore: '',
                totalScore: '',
                grade: ''
            });

            // Add formula for total score
            const rowNumber = row.number;
            row.getCell('totalScore').value = {
                formula: `IF(AND(D${rowNumber}<>"",E${rowNumber}<>""),D${rowNumber}+E${rowNumber},"")`
            };

            // Add formula for grade
            row.getCell('grade').value = {
                formula: `IF(F${rowNumber}="","",IF(F${rowNumber}>=70,"A",IF(F${rowNumber}>=60,"B",IF(F${rowNumber}>=50,"C",IF(F${rowNumber}>=45,"D",IF(F${rowNumber}>=40,"E","F"))))))`
            };

            // Add borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

           
        });

        // Add data validation for test score (0-30)
        const testScoreColumn = worksheet.getColumn('testScore');
        testScoreColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 7) { // Skip header and course info
                cell.dataValidation = {
                    type: 'decimal',
                    operator: 'between',
                    formulae: [0, 30],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Score',
                    error: 'Test score must be between 0 and 30'
                };
            }
        });

        // Add data validation for exam score (0-70)
        const examScoreColumn = worksheet.getColumn('examScore');
        examScoreColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.dataValidation = {
                    type: 'decimal',
                    operator: 'between',
                    formulae: [0, 70],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Score',
                    error: 'Exam score must be between 0 and 70'
                };
            }
        });

        // Protect worksheet but allow editing score columns
        worksheet.protect('', {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: false,
            formatColumns: false,
            formatRows: false,
            insertColumns: false,
            insertRows: false,
            deleteColumns: false,
            deleteRows: false
        });

        // Unlock test and exam score columns for editing
        testScoreColumn.eachCell((cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.protection = { locked: false };
            }
        });
        examScoreColumn.eachCell((cell, rowNumber) => {
            if (rowNumber > 7) {
                cell.protection = { locked: false };
            }
        });

        // Generate filename
        const filename = `${courseInfo.CourseCode}_${courseInfo.SessionName.replace('/', '-')}_${courseInfo.SemesterName}_Results.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating template:', error);
        return next(errorHandler(500, "Error generating template: " + error.message));
    }
};

// Upload and process results
export const uploadResults = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(errorHandler(400, "No file uploaded"));
        }

        const { courseId, ResultType } = req.query;
        const lectid = req.user.id;
        let ResultStatus = 'Test';
        

        if(ResultType !== 'Test'){
       ResultStatus = 'Pending'
    
        }

        if (!lectid) {
            return next(errorHandler(400, "Lecturer ID is required"));
        }

        if (!courseId) {
            return next(errorHandler(400, "Course is required"));
        }

        const pool = await poolPromise;

        if (!pool) {
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
  
         const SessionID = activeSessionResult.recordset[0].SessionID;
        


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

         const SemesterID = activeSemesterResult.recordset[0].SemesterID;
         


        // Read uploaded Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.worksheets[0];

        // Extract course info from the file (rows 1-5)
        const sessionCell = worksheet.getRow(3).getCell(2).value;
        const semesterCell = worksheet.getRow(4).getCell(2).value;
        const units = worksheet.getRow(5).getCell(2).value;
        
 

        const results = [];
        const errors = [];
        let successCount = 0;
        let errorCount = 0;

        // Process student data (starts from row 8 after headers)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 7) return; // Skip header rows

            const matricNo = row.getCell(2).value;
            const testScore = row.getCell(4).value;
            const examScore = row.getCell(5).value;
            
            // Cell 6 has a formula, get the calculated result or compute it
            const totalScoreCell = row.getCell(6);
            const totalScore = totalScoreCell.result !== undefined ? totalScoreCell.result : 
                               ((testScore || 0) + (examScore || 0));
            
            // const grade = row.getCell(7).value;

            // Skip empty rows
            if (!matricNo) return;

           
            
          
                results.push({
                    matricNo,
                    testScore: parseFloat(testScore) || 0,
                    examScore: parseFloat(examScore) || 0,
                    totalScore: parseFloat(totalScore) || 0,
                    // grade: grade || null
                });
            
        });

        if (results.length === 0) {
            return next(errorHandler(400, "No valid results found in the uploaded file. Please ensure at least one student has test or exam scores entered."));
        }

        // Begin transaction
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            for (const result of results) {
                // Get StudentID from MatricNo
                const studentResult = await transaction.request()
                    .input('MatricNo', sql.VarChar, result.matricNo)
                    .query('SELECT MatNo FROM dbo.student WHERE MatNo = @MatricNo');

                if (studentResult.recordset.length === 0) {
                    errors.push({ matricNo: result.matricNo, error: 'Student not found' });
                    errorCount++;
                    continue;
                }

                const UploadSession = await transaction.request()
                .input('SessionName', sql.VarChar, sessionCell)
                .query(`
                    SELECT SessionID FROM dbo.sessions WHERE SessionName = @SessionName
                `);
                
                const UploadSemester = await transaction.request()
                .input('SemesterName', sql.VarChar, semesterCell)
                .query(`
                    SELECT SemesterID FROM dbo.semesters WHERE SemesterName = @SemesterName
                `);

                const MatricNo = studentResult.recordset[0].MatNo;
                const sessId = UploadSession.recordset[0].SessionID;
                const semId = UploadSemester.recordset[0].SemesterID;


                // Check if result already exists
                const existingResult = await transaction.request()
                    .input('MatricNo', sql.VarChar, MatricNo)
                    .input('CourseID', sql.Int, courseId)
                    .input('SessionID', sql.Int, sessId)
                    .input('SemesterID', sql.Int, semId)
                    .input('SubmittedBy', sql.VarChar, lectid)
                    .query(`
                        SELECT ResultID, ResultStatus, ResultType FROM dbo.results 
                        WHERE MatricNo = @MatricNo 
                            AND CourseID = @CourseID 
                            AND SessionID = @SessionID 
                            AND SemesterID = @SemesterID
                            AND SubmittedBy = @SubmittedBy
                    `);

                if (existingResult.recordset.length > 0) {
                    // Update existing result

                if(existingResult.recordset[0].ResultType === 'Exam' && (existingResult.recordset[0].ResultStatus === 'Submitted' || existingResult.recordset[0].ResultStatus === 'Approved')){
                    return next(errorHandler(400, `Result for student ${MatricNo} cannot be edited. Contact HOD to unsubmit the results.`));
                 
                }


                   

                    let query = '';

                    if(ResultType === 'Test'){
                        query = `
                            UPDATE dbo.results 
                            SET CA_Score = @TestScore,
                                ResultType = @ResultType,
                                SubmittedDate = GETDATE(),
                                SubmittedBy = @lectid
                            WHERE ResultID = @ResultID
                        `;
                    }

                    else {
                        query = `
                        UPDATE dbo.results
                        SET Exam_Score = @ExamScore,
                            ResultType = @ResultType,
                            ResultStatus = @ResultStatus,
                            SubmittedDate = GETDATE(),
                            SubmittedBy = @lectid
                        WHERE ResultID = @ResultID
                        `;
                    }

                     await transaction.request()
                        .input('ResultID', sql.Int, existingResult.recordset[0].ResultID)
                        .input('TestScore', sql.Decimal(5, 2), result.testScore)
                        .input('ExamScore', sql.Decimal(5, 2), result.examScore)
                        .input('ResultType', sql.VarChar, ResultType)
                        .input('ResultStatus', sql.VarChar, ResultStatus)
                        .input('lectid', sql.VarChar, lectid)

                        // .input('TotalScore', sql.Decimal(5, 2), result.totalScore)
                        // .input('Grade', sql.VarChar, result.grade)
                        .query(query)
            
                } else {

                    const idandlevel = await transaction.request()
                    .input('MatricNO', sql.VarChar, MatricNo)
                    .query(`
                    SELECT StudentID, LevelID FROM dbo.student WHERE MatNo = @MatricNO
                    `);
                    const studentId = idandlevel.recordset[0].StudentID;
                    const levelId = idandlevel.recordset[0].LevelID;

                    console.log('StudentID:', studentId, 'LevelID:', levelId);
                 
                 
                    // Insert new result

                    await transaction.request()
                        .input('MatricNo', sql.VarChar, MatricNo)
                        .input('CourseID', sql.Int, courseId)
                        .input('SessionID', sql.Int, sessId)
                        .input('SemesterID', sql.Int, semId)
                        .input('TestScore', sql.Decimal(5, 2), result.testScore)
                        .input('ExamScore', sql.Decimal(5, 2), result.examScore)
                        .input('CreditUnits', sql.Int, units)
                        .input('ResultStatus', sql.VarChar, ResultStatus)
                        // .input('TotalScore', sql.Decimal(5, 2), result.totalScore)
                        // .input('Grade', sql.VarChar, result.grade)
                        .input('StudentID', sql.Int, studentId)
                        .input('LevelID', sql.Int, levelId)
                        .input('ResultType', sql.VarChar, ResultType)
                        .input('lectid', sql.VarChar, lectid)
                        .query(`
                            INSERT INTO dbo.results 
                            (MatricNo, CourseID, SessionID, SemesterID, CA_Score, Exam_Score, CreditUnits, StudentID, LevelID, ResultType,ResultStatus, SubmittedDate, SubmittedBy)
                            VALUES 
                            (@MatricNo, @CourseID, @SessionID, @SemesterID, @TestScore, @ExamScore, @CreditUnits, @StudentID, @LevelID, @ResultType, @ResultStatus, GETDATE(), @lectid)
                        `);
                }

                successCount++;
            }

            await transaction.commit();

            res.status(200).json({
                success: true,
                message: "Results uploaded successfully",
                summary: {
                    total: results.length + errorCount,
                    successful: successCount,
                    failed: errorCount
                },
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error('Error uploading results:', error.stack);
        return next(errorHandler(500, "Error uploading results: " + error.message));
    }
};


export const getUploadedResults = async (req, res, next) => {
    const lectid = req.user.id;
    const { courseID, search } = req.query;

if (!lectid) {
    return next(errorHandler(403, "Lecturer ID is required"))
}

if(!courseID ){
    return next(errorHandler(400, "Course is required"));
}

try {

    const pool = await poolPromise;

    if (!pool) {
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
  
         const SessionID = activeSessionResult.recordset[0].SessionID;
        


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

         const SemesterID = activeSemesterResult.recordset[0].SemesterID;
    
   let query = `
   SELECT 
   r.MatricNo,
   CONCAT(s.LastName, ' ', s.OtherNames) AS Name,
   l.levelName,
   r.CA_Score,
   r.Exam_Score,
   r.TotalScore,
   r.Grade,
   r.Remarks,
   r.ResultType

    FROM dbo.results r
    LEFT JOIN dbo.student s ON r.MatricNo = s.MatNo
    LEFT JOIN dbo.levels l ON s.LevelID = l.LevelID

    WHERE r.CourseID = @CourseID
      AND r.SessionID = @SessionID
      AND r.SemesterID = @SemesterID
      AND r.SubmittedBy = @lectid
   `

   if(search){
    query += ` AND (r.MatricNo LIKE '%' + @Search + '%' OR CONCAT(s.LastName, ' ', s.OtherNames) LIKE '%' + @Search + '%')`
   }

    const request = pool.request()
    .input('CourseID', sql.Int, parseInt(courseID))
    .input('SessionID', sql.Int, parseInt(SessionID))
    .input('SemesterID', sql.Int, parseInt(SemesterID))
    .input('lectid', sql.VarChar, lectid)
    if(search){
        request.input('Search', sql.VarChar, search);
    }

    const results = await request.query(query);

    res.status(200).json({
        success: true,
        data: results.recordset
    });

} catch (error) {
    return next(errorHandler(500, "Error fetching uploaded results: " + error.message));
}

}


export const updateScoreById = async(req, res, next) => {
    const lectid = req.user.id;
    const { MatricNo, CA_Score, Exam_Score, SessionID, SemesterID, CourseID } = req.body;


    console.log(CourseID,MatricNo,SessionID,SemesterID,CA_Score,Exam_Score)
    if(!lectid){
        return next(errorHandler(403, "Lecturer ID and Matric Number are required"));
    }
    
    try {
        
        const pool = await poolPromise;
        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }
       
        const checkType = await pool.request()

        .input('MatricNo', sql.VarChar, MatricNo)
        .input('CourseID', sql.Int, parseInt(CourseID))
        .input('SessionID', sql.Int, parseInt(SessionID))
        .input('SemesterID', sql.Int, parseInt(SemesterID))
        .input('lectid', sql.VarChar, lectid)
        
        .query(`SELECT ResultType, ResultStatus FROM dbo.results 
            WHERE MatricNo = @MatricNo 
                AND CourseID = @CourseID
                AND SessionID = @SessionID
                AND SemesterID = @SemesterID
                AND SubmittedBy = @lectid
        `);

        console.log(checkType.recordset[0])

        if(checkType.recordset[0].ResultType === 'Exam'  && (checkType.recordset[0].ResultStatus === 'Submitted' || checkType.recordset[0].ResultStatus === 'Approved')){
           
            return next(errorHandler(400, `Result for student ${MatricNo} cannot be edited. Contact HOD to unsubmit the results.`));
       
        }
        const query = `
        UPDATE dbo.results
        SET CA_Score = @CA_Score,
            Exam_Score = @Exam_Score
        WHERE MatricNo = @MatricNo
            AND SessionID = @SessionID
            AND SemesterID = @SemesterID
            AND CourseID = @CourseID
            AND SubmittedBy = @lectid
        `;

     const result = await pool.request()
        .input('CA_Score', sql.Decimal(5,2), parseFloat(CA_Score))
        .input('Exam_Score', sql.Decimal(5,2), parseFloat(Exam_Score))
        .input('MatricNo', sql.VarChar, MatricNo)
        .input('SessionID', sql.Int, parseInt(SessionID))
        .input('SemesterID', sql.Int, parseInt(SemesterID))
        .input('CourseID', sql.Int, parseInt(CourseID))
        .input('lectid', sql.VarChar, lectid)
        .query(query);

        if(result.rowsAffected[0] === 0){
            return next(errorHandler(404, "Result not found "));
        }

      return  res.status(200).json({
            success: true,
            message: "Result updated successfully"
        });

    } catch (error) {
        return next(errorHandler(500, "Error updating result: " + error.message));
    }

}


export const submitResultsToHOD = async(req, res, next) => {
    const lectid = req.user.id;
    const { courseID} = req.body;
    const ResultType = req.query.ResultType


    console.log('this is the resultType:',ResultType)
    if(!lectid){
        return next(errorHandler(403, "Lecturer ID is required"));
    }

    if(!courseID){
        console.log(courseID);
        return next(errorHandler(400, "Course, Session, and Semester are required"));
    }
    
    if(!ResultType){
        return next(errorHandler(400, "ResultType query parameter is required and must be either 'Test' or 'Exam'"));
    }
    try {
   
        const pool = await poolPromise;

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
  
         const SessionID = activeSessionResult.recordset[0].SessionID;
        


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

         const SemesterID = activeSemesterResult.recordset[0].SemesterID;

        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }

        // Verify lecturer is assigned to this course
        const assignmentCheck = await pool.request()
            .input('lectid', sql.VarChar, lectid)
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('SessionID', sql.Int, parseInt(SessionID))
            .input('SemesterID', sql.Int, parseInt(SemesterID))
            .query(`
                SELECT 
                ca.AssignmentID,
                s.StaffNo 

                FROM dbo.course_assignment ca
                
                INNER JOIN dbo.tblStaffDirectory s ON ca.LecturerID = s.StaffId
                
                WHERE s.StaffId = @lectid 
                    AND CourseID = @CourseID 
                    AND SessionID = @SessionID 
                    AND SemesterID = @SemesterID
            `);
 
        if (assignmentCheck.recordset.length === 0) {
            return next(errorHandler(403,  `${lectid}You are not assigned to this course for the selected session/semester`));
        }

   
        let query= ''


    if(ResultType === 'Test'){


            query = `
                UPDATE dbo.results
                SET SubmittedDate = GETDATE(),
                    ResultStatus = 'Pending',
                    SubmittedBy = @lectid
                WHERE CourseID = @CourseID
                    AND SessionID = @SessionID
                    AND SemesterID = @SemesterID
                    AND ResultType = 'Test'
            `;
    }

    else {
   
            query =    `
                UPDATE dbo.results
                SET SubmittedDate = GETDATE(),
                    ResultStatus = 'Submitted',
                    SubmittedBy = @lectid
                WHERE CourseID = @CourseID
                    AND SessionID = @SessionID
                    AND SemesterID = @SemesterID
                    AND (
                        ResultType = 'Test'
                        OR ResultStatus IS NULL
                        OR (ResultType = 'Exam' AND ResultStatus NOT IN ('Submitted', 'Approved'))
                    )
            `;
            }



 const result = await pool.request()

        
            .input('CourseID', sql.Int, parseInt(courseID))
            .input('SessionID', sql.Int, parseInt(SessionID))
            .input('SemesterID', sql.Int, parseInt(SemesterID))
            .input('lectid', sql.VarChar, lectid)
            .query(query);




            if(result.rowsAffected[0] === 0){
                return next(errorHandler(404, "No results found to submit or results have already been submitted/approved"));
            }

        res.status(200).json({
            success: true,
            message: "Results submitted to HOD successfully"
        });

    } catch (error) {
        return next(errorHandler(500, "Error submitting results: " + error.message));
    }

}


export const editResults = async (req, res, next) => {

}