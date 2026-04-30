<<<<<<< HEAD

import {sql, poolPromise, poolPromiseTwo} from '../../db.js'
=======
import { log } from 'node:console';
import {sql, poolPromise} from '../../db.js'
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
import { errorHandler } from '../../utils/error.js'


// Get all lecturers in HOD's department
export const getLecturers = async (req, res, next) => {
<<<<<<< HEAD
    const hodDepartmentID = req.user?.departmentID; 
    const hodStaffCode = req.user?.id;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || '';

    console.log('HOD Department ID:', hodDepartmentID);
=======
    const hodDepartmentID = req.user?.departmentID; // HOD's department ID from auth
    const hodStaffCode = req.user?.id;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || ''; // asc or desc for units

    console.log('HOD Department ID:', hodDepartmentID);
    console.log('User object:', req.user);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
    console.log('HOD Staff Code:', hodStaffCode);

    try {
        const pool = await poolPromise;
<<<<<<< HEAD
        const poolTwo = await poolPromiseTwo;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }
=======
        



        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }



>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        
         //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
<<<<<<< HEAD
            WHERE isActive = '1'
=======
            WHERE isActive = 1
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
         `);

         if(activeSessionResult.recordset.length === 0){
            return next(errorHandler(404, "No active session found"))
         }
  
         const sessionID = activeSessionResult.recordset[0].SessionID;
        
<<<<<<< HEAD
=======


>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
         //get active semester
         const activeSemesterResult = await pool.request()
         .query(`
            SELECT  SemesterID , SemesterName 
            FROM dbo.semesters 
            WHERE isActive = 'true'
         `);
<<<<<<< HEAD
=======

>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        
         if(activeSemesterResult.recordset.length === 0){
            return next(errorHandler(404, "No active semester found"))
         }

         const semesterID = activeSemesterResult.recordset[0].SemesterID;

        // Get HOD's StaffID
<<<<<<< HEAD
        const hodResult = await poolTwo.request()
=======
        const hodResult = await pool.request()
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
            .input('staffCode', sql.VarChar, hodStaffCode)
          
            .query('SELECT StaffId FROM dbo.tblStaffDirectory WHERE StaffId = @staffCode');
        
        const hodStaffID = hodResult.recordset.length > 0 ? hodResult.recordset[0].StaffId : null;
<<<<<<< HEAD
         
        console.log('HOD Staff ID:', hodStaffID);
=======
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        let query = `
            SELECT 
                s.StaffId as LecturerID,
                s.LastName,
                s.OtherNames,
                s.EmailAddress,
                s.DepartmentID,
                d.DepartmentName,
                ca.SessionID,
                ca.SemesterID,
            
                COUNT(ca.AssignmentID) AS TotalCoursesAssigned,
                STRING_AGG(c.course_code, ', ') AS AssignedCourses,
                STRING_AGG(CAST(c.course_title AS VARCHAR), ', ') AS AssignedCourseNames,
                STRING_AGG(CAST(ca.AssignmentID AS VARCHAR), ', ') AS AssignmentIDs,
                STRING_AGG(CAST(ca.TeachingProgrammeID AS VARCHAR), ', ') AS TeachingProgrammeIDs,
                STRING_AGG(CAST(ca.TeachingDepartmentID AS VARCHAR), ', ') AS TeachingDepartmentIDs,
                STRING_AGG(CAST(tp.ProgrammeName AS VARCHAR), ', ') AS TeachingProgrammeNames,
                STRING_AGG(CAST(td.DepartmentName AS VARCHAR), ', ') AS TeachingDepartmentNames
                
<<<<<<< HEAD
            FROM delsu.dbo.tblStaffDirectory s
            LEFT JOIN dbo.appdepartment d ON s.departmentid = d.DepartmentID 
=======
            FROM dbo.tblStaffDirectory s
            LEFT JOIN dbo.appdepartment d ON s.departmentid = d.DepartmentID
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
            LEFT JOIN dbo.course_assignment ca ON s.StaffId = ca.LecturerID
                AND (
                    ca.AssignedBy = @hodStaffID  -- Show assignments made by this HOD
                    OR ca.TeachingDepartmentID = @departmentID  -- Or assignments in their department
                )
            LEFT JOIN dbo.courses c ON ca.CourseID = c.Course_ID
            LEFT JOIN dbo.programmes tp ON ca.TeachingProgrammeID = tp.ProgrammeID
            LEFT JOIN dbo.appdepartment td ON ca.TeachingDepartmentID = td.DepartmentID 
            WHERE 
            ca.SemesterID = @semesterID
            AND ca.SessionID = @sessionID
        `;

        const params = [];
        let paramIndex = 1;
        
        // Only filter by department if hodDepartmentID is provided
        if (hodDepartmentID) {
            query += `AND s.DepartmentID = @departmentID`;
        }

<<<<<<< HEAD
      
 // Search filter



=======
        // Search filter
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        if (search) {
            query += ` AND (s.LastName LIKE @search OR s.OtherNames LIKE @search OR s.EmailAddress LIKE @search)`;
        }

        query += ` GROUP BY s.StaffID, s.LastName, s.OtherNames, s.EmailAddress, s.DepartmentID, d.DepartmentName, ca.SessionID, ca.SemesterID`;

<<<<<<< HEAD



        // Order by courses assigned count


=======
        // Order by courses assigned count
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        if (orderBy === 'asc') {
            query += ` ORDER BY TotalCoursesAssigned ASC`;
        } else if (orderBy === 'desc') {
            query += ` ORDER BY TotalCoursesAssigned DESC`;
        } else {
            query += ` ORDER BY s.LastName ASC`;
        }


        const request = pool.request()
          .input(`semesterID`,sql.Int, semesterID)
            .input('sessionID', sql.Int, sessionID)

        if (hodStaffID) {
            request.input('hodStaffID', sql.VarChar, hodStaffID)
            ;
        }
        if (hodDepartmentID) {
            request.input('departmentID', sql.Int, hodDepartmentID);
        }
        if (search) {
            request.input('search', sql.VarChar, `%${search}%`);
        }

<<<<<<< HEAD
        // console.log('Executing query:', query);
=======
        console.log('Executing query:', query);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        const result = await request.query(query);
        
        console.log('Found lecturers:', result.recordset.length);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            lecturers: result.recordset
        });

    } catch (error) {
        console.error('Error in getLecturers:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}

// Lightweight endpoint: return only lecturer count for HOD (fast summary)
export const getLecturersCount = async (req, res, next) => {
    const hodDepartmentID = req.user?.departmentID;
    try {
<<<<<<< HEAD
        const pool = await poolPromiseTwo; // Use second pool for lightweight queries
=======
        const pool = await poolPromise;
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const request = pool.request();
        if (hodDepartmentID) request.input('departmentID', sql.Int, hodDepartmentID);

        const query = hodDepartmentID
            ? 'SELECT COUNT(*) AS count FROM dbo.tblStaffDirectory WHERE departmentid = @departmentID'
            : 'SELECT COUNT(*) AS count FROM dbo.tblStaffDirectory';

        const result = await request.query(query);
        const count = result.recordset[0]?.count || 0;

        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error in getLecturersCount:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


// Assign course to lecturer
export const assignCourse = async (req, res, next) => {
    const { courseID, lecturerID, AssignedProgrammeID, DisciplineID } = req.body;



    const hodDepartmentID = req.user?.departmentID;
    const hodStaffCode = req.user?.id; // Get HOD's StaffCode from JWT
   
    console.log('Assign Course Request:', req.body);
    
    // Validate required fields
    if (!courseID || !lecturerID  || !AssignedProgrammeID || !DisciplineID) {
        return next(errorHandler(400, "CourseID, Lecturer Name, Programme Name, and Discipline Name are required"));
    }


    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        // Get HOD's StaffID from StaffCode
        const hodResult = await pool.request()
            .input('staffNo', sql.VarChar, hodStaffCode)
            .query('SELECT StaffId, FacultyID FROM dbo.tblStaffDirectory WHERE StaffId = @staffNo');
        
        if (hodResult.recordset.length === 0) {
            return next(errorHandler(404, "HOD staff record not found"));
        }
        
        const hodStaffID = hodResult.recordset[0].StaffId;
        const hodFacultyID = hodResult.recordset[0].FacultyID;
 //get the active session 
         const activeSessionResult = await pool.request()
         .query(`
            SELECT  SessionID , SessionName 
            FROM dbo.sessions 
<<<<<<< HEAD
            WHERE isActive = '1'
=======
            WHERE isActive = 1
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
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

        // Get course details from course table and validate HOD has permission
        const courseCheck = await pool.request()
            .input('courseID', sql.Int, parseInt(courseID))
            .input('departmentID', sql.Int, parseInt(hodDepartmentID))
            .input('disciplineID', sql.Int, parseInt(DisciplineID))
            .query(`
                SELECT 
                    c.course_id,
                    c.course_code,
                    c.course_type,
                    c.programme_id,
                    c.level_id,
                    c.discipline,
                    c.faculty
                FROM dbo.courses c
                WHERE c.course_id = @courseID 
                 AND Exists (
                    SELECT 1 FROM STRING_SPLIT(c.discipline, ',') AS coursediscipline
                    WHERE CAST(coursediscipline.value AS INT) = @disciplineID
                    And @disciplineID IN (SELECT DisciplineID FROM dbo.Disciplines WHERE DepartmentID = @departmentID)
                    
                )
            `);

        if (courseCheck.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to assign this course or course does not exist"));
        }

        const course = courseCheck.recordset[0];

        // Check if this lecturer already has this course assigned for this session/semester
        const existingAssignment = await pool.request()
            .input('courseID', sql.Int, parseInt(courseID))
            .input('lecturerID', sql.VarChar, lecturerID)
            .input('semesterID', sql.Int, parseInt(semesterID))
            .input('sessionID', sql.Int, parseInt(sessionID))
            .input('TeachingProgrammeID', sql.Int, parseInt(AssignedProgrammeID))
            .input('DisciplineID', sql.Int, parseInt(DisciplineID))
            .query(`
                SELECT AssignmentID FROM dbo.course_assignment 
                WHERE CourseID = @courseID 
                AND LecturerID = @lecturerID
                AND SemesterID = @semesterID 
                AND SessionID = @sessionID
                AND TeachingProgrammeID = @TeachingProgrammeID
                
                AND DisciplineID = @DisciplineID
            `);

        if (existingAssignment.recordset.length > 0) {
            return next(errorHandler(400, "This course is already assigned to this lecturer for this semester/session and discipline"));
        }

        
        // Insert new course assignment record with AssignedBy field
        const assignQuery = `
            INSERT INTO dbo.course_assignment 
            (CourseID, CourseCode, LecturerID, SessionID, SemesterID, ProgrammeID, DisciplineID,  CourseType, LevelID, DepartmentID, FacultyID, AssignedDate, AssignmentStatus, TeachingProgrammeID, TeachingDepartmentID, AssignedBy)
            VALUES 
            (@courseID, @courseCode, @lecturerID, @sessionID, @semesterID, @programmeID, @disciplineID, @courseType, @levelID, @departmentID, @facultyID, GETDATE(), 'assigned', @TeachingProgrammeID, @TeachingDepartmentID, @assignedBy)
        `;

        await pool.request()
            .input('courseID', sql.Int, courseID)
            .input('courseCode', sql.VarChar, course.course_code)
            .input('lecturerID', sql.VarChar, lecturerID)
            .input('sessionID', sql.Int, sessionID)
            .input('semesterID', sql.Int, semesterID)
            .input('programmeID', sql.Int, course.programme_id)
            .input('disciplineID', sql.Int, DisciplineID)
            .input('courseType', sql.VarChar, course.course_type)
            .input('levelID', sql.Int, course.level_id)
            .input('departmentID', sql.Int, parseInt(hodDepartmentID))
            .input('facultyID', sql.Int, parseInt(hodFacultyID))
            .input('TeachingProgrammeID', sql.Int, parseInt(AssignedProgrammeID))
            .input('TeachingDepartmentID', sql.Int, parseInt(hodDepartmentID))
            .input('assignedBy', sql.VarChar, hodStaffID)
            .query(assignQuery);

        res.status(200).json({
            success: true,
            message: "Course assigned successfully"
        });

    } catch (error) {
        console.error('Error in assignCourse:', error.stack);
        return next(errorHandler(500, "Server Error: " + error.message));
    }
}


// Unassign course from lecturer
export const unassignCourse = async (req, res, next) => {
    const { assignmentID} = req.body;
    const hodDepartmentID = req.user?.departmentID;
    const hodStaffCode = req.user?.id;

    console.log('Unassign Request:', req.body);

    try {
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        if (!assignmentID) {
            return next(errorHandler(400, "AssignmentID is required"));
        }

        // Get HOD's StaffID
        const hodResult = await pool.request()
            .input('staffCode', sql.VarChar, hodStaffCode)
            .query('SELECT StaffId FROM dbo.tblStaffDirectory WHERE StaffId = @staffCode');
        
        if (hodResult.recordset.length === 0) {
            return next(errorHandler(404, "HOD staff record not found"));
        }
        
        const hodStaffID = hodResult.recordset[0].StaffId;

        // Verify HOD has permission to unassign this course
        // Permission granted if:
        // 1. HOD assigned this course (AssignedBy = hodStaffID), OR
        // 2. Course belongs to HOD's department (for department courses)
        const checkQuery = await pool.request()
            .input('assignmentID', sql.Int, assignmentID)
            .input('departmentID', sql.Int, hodDepartmentID)
            .input('hodStaffID', sql.VarChar, hodStaffID)
            .query(`
                SELECT ca.AssignmentID, ca.CourseCategory, ca.AssignedBy, ca.TeachingDepartmentID
                FROM dbo.course_assignment ca
                WHERE ca.AssignmentID = @assignmentID
                AND (
                    ca.AssignedBy = @hodStaffID  -- HOD who assigned it can unassign
                    OR (
                        -- For courses in HOD's teaching department
                        ca.TeachingDepartmentID = @departmentID
                        AND ca.CourseCategory = 'department'
                    )
                )
            `);

        if (checkQuery.recordset.length === 0) {
            return next(errorHandler(403, "You don't have permission to unassign this course. Only the HOD who assigned it can unassign it."));
        }

        const courseCategory = checkQuery.recordset[0].CourseCategory;

        // For general/faculty courses: DELETE the row (removes this lecturer's assignment)
        // For department courses: UPDATE to NULL (keeps the row for future assignment)
      
            await pool.request()
                .input('assignmentID', sql.Int, assignmentID)
                .query(`
                    DELETE FROM dbo.course_assignment 
                    WHERE AssignmentID = @assignmentID
                `);
     

        res.status(200).json({
            success: true,
            message: "Course unassigned successfully"
        });

    } catch (error) {
        console.error('Unassign Error:', error);
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}

//get lecturers in a department for course assignment dropdown
export const getlecturerDepartment = async (req, res, next)=>{

    const hodID = req.user.departmentID

    if(!hodID){
        return next(errorHandler(404, 'DepartmentId Required '))
    }

    try {

          const pool = await poolPromise
          if(!pool){
            return next(errorHandler(500, 'Database connection failed'))    
                  }



                // const departmentCode = await pool.request()
                // .input('departmentID', sql.Int, hodID)
                // .query('SELECT DepartmentCode, DepartmentName, DepartmentID FROM dbo.appdepartment WHERE DepartmentID = @departmentID')

                // const DepartmentCode = departmentCode.recordset[0]?.DepartmentCode;
                

                // if(!DepartmentCode){
                //     return next(errorHandler(404, 'Department not found'))
                // }
     
                
                let query = `SELECT StaffId, CONCAT(LastName, ' ', Othernames) AS FullName 
                FROM dbo.tblStaffDirectory WHERE departmentid = @departmentID `

            //    if(DepartmentCode !== 'GST'){
            //        query += ` AND DepartmentID = @departmentID`
            //     }

               const  result = await pool.request()
                .input('departmentID', sql.Int, hodID)
                .query(query)
 

                console.log('Lecturers in department', hodID, ':', result.recordset);
                res.status(200).json({
                    success: true,
                    lecturers: result.recordset
                })
        
    } catch (error) {
        console.error('error fetching the departments', error.stack)
        return next(errorHandler(500,"error fetching", error.message))
    }
}


//get assigned courses for all lecturers 