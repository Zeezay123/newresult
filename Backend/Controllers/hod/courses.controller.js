<<<<<<< HEAD
import {sql, poolPromise, poolPromiseTwo} from '../../db.js'
=======
import {sql, poolPromise} from '../../db.js'
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
import { errorHandler } from '../../utils/error.js'
 


// export const getCourses = async (req, res, next) => {
//   const hodDepartmentID = req.user.departmentID

//     const search = req.query.search || ''; // Search term for course code or title
//     const courseStatus = req.query.courseStatus || ''; // Course status filter
//     const assignmentStatus = req.query.assignmentStatus || 'all'; // all, assigned, unassigned
//     const programmeID = req.query.programmeID || ''; // Programme filter
//     // HOD's department ID from auth
//    const page = parseInt(req.query.page) || 1;
//    const limit = parseInt(req.query.limit) || 10;
//    const offset = (page - 1) * limit;


//     try {
//       const pool = await poolPromise;
      
//       if(!pool){
//           return next(errorHandler(500, "Database connection failed"))
//       }

//       // Get the active session and semester
//       const activeSessionResult = await pool.request()
//         .query(`
//           SELECT SessionID, SessionName 
//           FROM dbo.sessions 
<<<<<<< HEAD
//           WHERE isActive = '1'
=======
//           WHERE isActive = 1
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
//         `);

//       if(activeSessionResult.recordset.length === 0){
//         return next(errorHandler(404, "No active session found"))
//       }

//       const sessionID = activeSessionResult.recordset[0].SessionID;

//       const activeSemesterResult = await pool.request()
//         .query(`
//           SELECT SemesterID, SemesterName 
//           FROM dbo.semesters 
<<<<<<< HEAD
//           WHERE isActive = '1'
=======
//           WHERE isActive = 1
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
//         `);

//       if(activeSemesterResult.recordset.length === 0){
//         return next(errorHandler(404, "No active semester found"))
//       }

//       const semesterID = activeSemesterResult.recordset[0].SemesterID;

//       // Build WHERE conditions and filters once - will be reused for both queries
//       const whereConditions = ['1=1'];
      
//       // HOD can only see courses related to their department - apply this filter first
//       // Check if any discipline in the course's Discipline column belongs to HOD's department
//       if (hodDepartmentID) {
//         whereConditions.push(`
//           c.Semester = @semesterID
//           AND EXISTS (
//             SELECT 1 
//             FROM STRING_SPLIT(c.discipline, ',') AS courseDiscipline
//             INNER JOIN dbo.Disciplines d ON CAST(TRIM(courseDiscipline.value) AS INT) = d.DisciplineID
//             WHERE d.DepartmentID = @hodDept
//           )`);
//       }

//       // Filter course assignments by active session and semester
//       whereConditions.push(`(ca.SessionID = @sessionID AND ca.SemesterID = @semesterID OR ca.SessionID IS NULL)`);


      
//       const params = [];
//       let paramIndex = 1;
//       let filterClause = ''; 

//       // Search filter
//       if (search) {
//         filterClause += ` AND (c.CourseCode LIKE @param${paramIndex} OR c.CourseTitle LIKE @param${paramIndex})`;
//         params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: `%${search}%` });
//         paramIndex++;
//       }

//       // Course status filter
//       if (courseStatus) {
//         filterClause += ` AND c.course_type = @param${paramIndex}`;
//         params.push({ name: `param${paramIndex}`, type: sql.VarChar, value: courseStatus });
//         paramIndex++;
//       }

//       // Programme filter
//       if (programmeID) {
//         filterClause += ` AND ca.TeachingProgrammeID = @param${paramIndex}`;
//         params.push({ name: `param${paramIndex}`, type: sql.Int, value: parseInt(programmeID) });
//         paramIndex++;
//       }

//       // Assignment status filter
//       if (assignmentStatus === 'assigned') {
//         filterClause += ` AND ca.LecturerID IS NOT NULL`;
//       } else if (assignmentStatus === 'unassigned') {
//         filterClause += ` AND ca.LecturerID IS NULL`;
//       }

//       // Add hodDept parameter if needed
//       if (hodDepartmentID) {
//         params.push({ name: 'hodDept', type: sql.Int, value: hodDepartmentID });
//       }

//       // Add session and semester parameters
//       params.push({ name: 'sessionID', type: sql.Int, value: sessionID });
//       params.push({ name: 'semesterID', type: sql.Int, value: semesterID });

//       // Get total count using the reusable filter
//       let countQuery = `
//         SELECT COUNT(*) as TotalCount
//         FROM dbo.courses c
//         LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.course_id
//         WHERE ${whereConditions.join(' AND ')}
//         ${filterClause}
//       `;

//       const countRequest = pool.request();
//       params.forEach(param => {
//         countRequest.input(param.name, param.type, param.value);
//       });
      
//       const countResult = await countRequest.query(countQuery);
//       const totalCourses = countResult.recordset[0].TotalCount;

//       if(totalCourses === 0){
//         return res.status(200).json({message: "No courses found matching the criteria"});
//       }

//       const totalPages = Math.ceil(totalCourses / limit);

//       // paginated query using the same filter
//       let query = `
//         SELECT 
//           c.course_id,
//           c.course_code,
//           c.course_title,
//           c.credit_unit,
//           c.course_type,
//           c.discipline,
//           c.programme_id,
//           ca.AssignmentID,
//           ca.TeachingDepartmentID,
//           ca.TeachingProgrammeID,
//           f.FacultyName,
//           d.DepartmentName,
//           l.LevelName,
//           ca.AssignmentStatus,
//           ca.AssignedDate,
//           ca.LecturerID,
//           CONCAT(staff.LastName, ' ', staff.OtherNames) AS AssignedLecturer,
//           s.SemesterName,
//           sess.SessionName
//         FROM dbo.courses c
//         LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.course_id 
//         LEFT JOIN dbo.appfaculty f ON c.Faculty = f.FacultyID
//         LEFT JOIN dbo.appdepartment d ON ca.TeachingDepartmentID = d.DepartmentID
//         LEFT JOIN dbo.Levels l ON c.level_id = l.LevelID
//         LEFT JOIN dbo.tblStaffDirectory staff ON ca.LecturerID = staff.StaffId
//         LEFT JOIN dbo.semesters s ON ca.SemesterID = s.SemesterID
//         LEFT JOIN dbo.sessions sess ON ca.SessionID = sess.SessionID
//         WHERE ${whereConditions.join(' AND ')}
//         ${filterClause}
//         ORDER BY c.course_code
//         OFFSET @offset ROWS
//         FETCH NEXT @limit ROWS ONLY
//       `;
      
//       const request = pool.request();
      
//       // Set request timeout to 1 second
//       request.timeout = 1000;
      
//       // Add all filter params
//       params.forEach(param => {
//         request.input(param.name, param.type, param.value);
//       });
      
//       // Add pagination params
//       request.input('offset', sql.Int, offset);
//       request.input('limit', sql.Int, limit);

//       const result = await request.query(query);

//       // Build response with pagination
//       const response = {
//         success: true,
//         count: result.recordset.length,
//         totalCourses,
//         totalPages,
//         currentPage: page,
//         courses: result.recordset
//       };
      
//       res.status(200).json(response);
        
//     } catch (error) {
//       console.error('Error fetching courses:', error.stack);
//        return next(errorHandler(500, "Server Error: " + error.message))
//     }

// }

export const getCourses = async (req, res, next) => {

    const hodDepartmentID = req.user.departmentID

    if(!hodDepartmentID){
        return next(errorHandler(400, "HOD Department ID is required"))
    }

    try {
      
        const pool = await poolPromise;
<<<<<<< HEAD
        const poolTwo = await poolPromiseTwo;
=======
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }
<<<<<<< HEAD
        if(!poolTwo){
            return next(errorHandler(500, "Database connection to Pool Two failed"))
        }
=======
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

// get active semester

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
        // logic to fetch courses goes here

    const query =  ` SELECT
    c.course_id,
    c.course_code,
<<<<<<< HEAD
    cal.discipline,
    c.course_title,
    c.credit_unit,
    c.course_type,
    cal.programme_id,
=======
    c.discipline,
    c.course_title,
    c.credit_unit,
    c.course_type,
    c.programme_id,
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
    ca.AssignmentID,
    ca.DisciplineID,
    ca.TeachingDepartmentID,
    ca.AssignmentStatus,
    ca.AssignedDate,
    ca.LecturerID,
    d.DepartmentName,
    d.DepartmentID,
    l.LevelName,
    CONCAT(s.LastName, ' ', s.OtherNames) AS AssignedLecturer
FROM dbo.courses c
<<<<<<< HEAD
INNER JOIN dbo.course_allocations cal ON cal.course_id = c.course_id
LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.course_id
LEFT JOIN dbo.Levels l ON cal.level_id = l.LevelID
LEFT JOIN delsu.dbo.tblStaffDirectory s ON ca.LecturerID = s.StaffId
=======
LEFT JOIN dbo.course_assignment ca ON ca.CourseID = c.course_id
LEFT JOIN dbo.Levels l ON c.level_id = l.LevelID
LEFT JOIN dbo.tblStaffDirectory s ON ca.LecturerID = s.StaffId
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
LEFT JOIN dbo.AppDepartment d ON d.DepartmentID = @hodDept
WHERE  
c.semester = @semesterID
AND
<<<<<<< HEAD
cal.department = @hodDept `
=======
EXISTS (
    SELECT 1
    FROM STRING_SPLIT(c.Discipline, ',') AS courseDiscipline
    INNER JOIN dbo.Disciplines dis
      ON dis.DisciplineID = TRY_CAST(LTRIM(RTRIM(courseDiscipline.value)) AS INT)
    WHERE dis.DepartmentID = @hodDept 
)`
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        const result = await pool.request()
        .input('hodDept', sql.Int, hodDepartmentID)
        .input('semesterID', sql.Int, parseInt(semesterID))
        .query(query);

       if(result.recordset.length === 0) {
        return res.status(200).json('No Course found for your department ')
       }

       return res.status(200).json({
        success:true,
        courses:result.recordset,
        count:result.recordset.length
       })

<<<<<<< HEAD
    } catch (error) { 
=======
    } catch (error) {
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
      console.error('Error fetching courses:', error.stack);
       return next(errorHandler(500, "Server Error: " + error.message))
    }
}

export const getCourseStats = async (req, res, next) => {
    const hodDepartmentID = req.user.departmentID;

    try {
        const pool = await poolPromise;
        
        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        if (!hodDepartmentID) {
            return next(errorHandler(400, "HOD Department ID is required"));
        }

        // Get the active session and semester
        const activeSessionResult = await pool.request()
            .query(`
                SELECT SessionID, SessionName 
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
    
        // A course is fully assigned only when every discipline (in HOD's department) has a lecturer assignment.
<<<<<<< HEAD
        // const query = `
        //     WITH CourseDepartmentDisciplines AS (
        //         SELECT DISTINCT
        //             cal.course_id,
        //             d.DisciplineID,
        //         FROM dbo.course_allocations cal
        //         INNER JOIN dbo.Disciplines d ON cal.discipline = d.DisciplineID
        //         WHERE cal.semester = @semesterID
        //           AND d.DepartmentID = @hodDept
        //     ),
        //     CourseStatus AS (
        //         SELECT
        //             cdd.course_id,
        //             CASE
        //                 WHEN EXISTS (
        //                     SELECT 1
        //                     FROM CourseDepartmentDisciplines x
        //                     WHERE x.course_id = cdd.course_id
        //                       AND NOT EXISTS (
        //                           SELECT 1
        //                           FROM dbo.course_assignment ca
        //                           WHERE ca.CourseID = x.course_id
        //                             AND ca.DisciplineID = x.DisciplineID
        //                             AND ca.SessionID = @sessionID
        //                             AND ca.SemesterID = @semesterID
        //                             AND ca.LecturerID IS NOT NULL
        //                       )
        //                 ) THEN 1 ELSE 0
        //             END AS HasUnassignedDiscipline
        //         FROM CourseDepartmentDisciplines cdd
        //         GROUP BY cdd.course_id
        //     )
        //     SELECT
        //         COUNT(*) AS TotalCourses,
        //         SUM(CASE WHEN HasUnassignedDiscipline = 0 THEN 1 ELSE 0 END) AS AssignedCourses,
        //         SUM(CASE WHEN HasUnassignedDiscipline = 1 THEN 1 ELSE 0 END) AS UnassignedCourses
        //     FROM CourseStatus
        // `;

        const queryTwo =`
           SELECT COUNT(DISTINCT cal.course_id) AS TotalCourses
      
        FROM dbo.course_allocations cal
       
                 
        `
       
            //   SUM(CASE WHEN ca.LecturerID IS NOT NULL THEN 1 ELSE 0 END) AS AssignedCourses,
            // SUM(CASE WHEN ca.LecturerID IS NULL THEN 1 ELSE 0 END) AS UnassignedCourses


        //  INNER JOIN dbo.course_assignment ca ON cal.course_id = ca.CourseID
        // INNER JOIN dbo.Disciplines d ON cal.Discipline = d.DisciplineID
        // where d.DepartmentID = @hodDept

        //     and  cal.semester = @semesterID
        //     AND   ca.SessionID = @sessionID
=======
        const query = `
            WITH CourseDepartmentDisciplines AS (
                SELECT DISTINCT
                    c.course_id,
                    d.DisciplineID
                FROM dbo.courses c
                CROSS APPLY STRING_SPLIT(c.Discipline, ',') AS courseDiscipline
                INNER JOIN dbo.Disciplines d
                    ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(courseDiscipline.value)) AS INT)
                WHERE c.semester = @semesterID
                  AND d.DepartmentID = @hodDept
            ),
            CourseStatus AS (
                SELECT
                    cdd.course_id,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM CourseDepartmentDisciplines x
                            WHERE x.course_id = cdd.course_id
                              AND NOT EXISTS (
                                  SELECT 1
                                  FROM dbo.course_assignment ca
                                  WHERE ca.CourseID = x.course_id
                                    AND ca.DisciplineID = x.DisciplineID
                                    AND ca.SessionID = @sessionID
                                    AND ca.SemesterID = @semesterID
                                    AND ca.LecturerID IS NOT NULL
                              )
                        ) THEN 1 ELSE 0
                    END AS HasUnassignedDiscipline
                FROM CourseDepartmentDisciplines cdd
                GROUP BY cdd.course_id
            )
            SELECT
                COUNT(*) AS TotalCourses,
                SUM(CASE WHEN HasUnassignedDiscipline = 0 THEN 1 ELSE 0 END) AS AssignedCourses,
                SUM(CASE WHEN HasUnassignedDiscipline = 1 THEN 1 ELSE 0 END) AS UnassignedCourses
            FROM CourseStatus
        `;

        const queryTwo =`
           SELECT COUNT(DISTINCT c.course_id) AS TotalCourses,
            SUM(CASE WHEN ca.LecturerID IS NOT NULL THEN 1 ELSE 0 END) AS AssignedCourses,
            SUM(CASE WHEN ca.LecturerID IS NULL THEN 1 ELSE 0 END) AS UnassignedCourses
        FROM dbo.courses c
        INNER JOIN dbo.course_assignment ca ON ca.CourseID = c.course_id
        CROSS APPLY STRING_SPLIT(ISNULL(c.discipline, ''), ',') AS courseDiscipline
        INNER JOIN dbo.Disciplines d ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(courseDiscipline.value)) AS INT)
        where d.DepartmentID = @hodDept

            and  c.semester = @semesterID
            AND   ca.SessionID = @sessionID
                 
        `
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        const result = await pool.request()
            .input('hodDept', sql.Int, hodDepartmentID)
            .input('sessionID', sql.Int, sessionID)
            .input('semesterID', sql.Int, semesterID)
            .query(queryTwo);

        const stats = result.recordset[0];

        console.log('Course stats:', stats);
        res.status(200).json({
            success: true,
            stats: {
                total: stats.TotalCourses || 0,
                assigned: stats.AssignedCourses || 0,
                unassigned: stats.UnassignedCourses || 0
            }
        });

    } catch (error) {
        console.error('Error fetching course stats:', error);
        return next(errorHandler(500, "Server Error: " + error.message));
    }
};


//get unassiged courses for a level in the HOD's department
export const unassignedCourses = async (req, res, next) => {


   // LevelID from query parameter
    const LevelID = req.query.levelID;
    try{
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"))
        }

        const hodDepartmentID = parseInt(req.user.departmentID); // HOD's department ID from URL
       
        
        if (!hodDepartmentID || isNaN(hodDepartmentID)) {
            return next(errorHandler(400, "Invalid department ID"))
        }

  
   
        console.log('Getting unassigned courses for Department:', hodDepartmentID)

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
         

        
        // Return courses that still have at least one discipline (within HOD's department)
        // without an assigned lecturer for the current session/semester.
        let query = `SELECT
<<<<<<< HEAD
           cal.course_id,
=======
           c.course_id,
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
           c.course_code,
           c.course_title,
           c.credit_unit,
           c.course_type,
<<<<<<< HEAD
           cal.discipline,
           cal.programme_id,
           cal.semester,
           l.LevelName
         FROM dbo.course_allocations cal
         INNER JOIN dbo.courses c on cal.course_id = c.course_id
         LEFT JOIN dbo.levels l ON cal.level_id = l.LevelID
         LEFT JOIN dbo.Disciplines d ON cal.Discipline = d.DisciplineID
         LEFT JOIN dbo.course_assignment ca ON cal.course_id = ca.CourseID
         WHERE cal.semester = @semesterID
         AND cal.level_id = @LevelID
         AND d.DepartmentID = @hodDept
         AND NOT EXISTS (
=======
           c.discipline,
           c.programme_id,
           c.semester,
           l.LevelName
         FROM dbo.courses c
         LEFT JOIN dbo.levels l ON c.level_id = l.LevelID
         WHERE c.semester = @semesterID
         AND c.level_id = @LevelID
                 AND EXISTS (
                        SELECT 1
                        FROM STRING_SPLIT(c.Discipline, ',') AS courseDiscipline
                        INNER JOIN dbo.Disciplines d
                            ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(courseDiscipline.value)) AS INT)
                        WHERE d.DepartmentID = @hodDept
                            AND NOT EXISTS (
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
                                SELECT 1
                                FROM dbo.course_assignment ca
                                WHERE ca.CourseID = c.course_id
                                    AND ca.DisciplineID = d.DisciplineID
                                    AND ca.SessionID = @sessionID
                                    AND ca.SemesterID = @semesterID
<<<<<<< HEAD
                                    AND ca.LecturerID IS NOT NULL            
                 )

=======
                                    AND ca.LecturerID IS NOT NULL
                            )
                 )
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
         ORDER BY c.course_code`;

        const request = pool.request()
            .input('hodDept', sql.Int, hodDepartmentID)
            .input('sessionID', sql.Int, parseInt(sessionID))
            .input('semesterID', sql.Int, parseInt(semesterID))
            .input('LevelID', sql.Int, parseInt(LevelID));

        const result = await request.query(query);
    
        return res.status(200).json({
            success: true,
            count: result.recordset.length,
            courses: result.recordset
        })
    } catch(error){
        return next(errorHandler(500, "Server Error: " + error.message))
    }
}


//get departments based on course disciplines
export const getCourseDepartments = async (req, res, next)=>{
    const courseID = req.params.id;
    const departmentID = req.user.departmentID;

    if(!courseID || !departmentID){
        return next(errorHandler(400, "courseID and departmentID are required"));
    }

    try {
        
        const pool = await poolPromise;
        
        if(!pool){
            return next(errorHandler(500, "Database connection failed"));
        }
        
        // Get course disciplines
        const coursepool = await pool.request()
        .input('courseID', sql.Int, parseInt(courseID))
<<<<<<< HEAD
        .query(`SELECT discipline FROM dbo.course_allocations cal WHERE  cal.course_id = @courseID`);
=======
        .query(`SELECT discipline FROM dbo.courses WHERE  course_id = @courseID`);
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if(coursepool.recordset.length === 0){
            return next(errorHandler(404, "Course not found"));
        }

        // Get departments that have disciplines in the course's discipline list
        let query = `
          SELECT DISTINCT d.DepartmentID, d.DepartmentName 
          FROM dbo.appdepartment d
          INNER JOIN dbo.Disciplines disc ON d.DepartmentID = disc.DepartmentID
<<<<<<< HEAD
          INNER JOIN dbo.course_allocations cal ON cal.course_id = @courseID
          WHERE 
            cal.discipline = disc.DisciplineID
=======
          INNER JOIN dbo.courses c ON c.course_id = @courseID
          WHERE EXISTS (
            SELECT 1 
                        FROM STRING_SPLIT(CAST(ISNULL(c.discipline, '') AS NVARCHAR(MAX)), ',') AS courseDiscipline
            WHERE CAST(TRIM(courseDiscipline.value) AS INT) = disc.DisciplineID
          )
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
        `;
       
        const request = pool.request()
        .input('courseID', sql.Int, parseInt(courseID));

        const result = await request.query(query);
        return res.json({ success: true, departments: result.recordset });
    } catch (error) {
        console.error('Error fetching course departments:', error.stack);
        return next(errorHandler(500, 'Failed to fetch course departments', error.message));
    }
}


export const getCourseDisciplines = async (req, res, next) => {
const departmentID = req.user.departmentID; 
const CourseID = req.params.id;

if(!CourseID || !departmentID){
    return next(errorHandler(400, "CourseID and DepartmentID are required"));
}

try{
  const pool = await poolPromise;
   
  if(!pool){
    return next(errorHandler(404, "Database connection failed"))
  }

  const query = `
<<<<<<< HEAD
        SELECT DISTINCT d.DisciplineID, d.Name, cal.course_id
        FROM dbo.course_allocations cal
        INNER JOIN dbo.Disciplines d
            ON cal.discipline = d.DisciplineID
        WHERE cal.course_id = @CourseID
=======
        SELECT DISTINCT d.DisciplineID, d.Name, c.course_id
        FROM dbo.courses c
        CROSS APPLY STRING_SPLIT(CAST(ISNULL(c.discipline, '') AS NVARCHAR(MAX)), ',') AS sd
        INNER JOIN dbo.Disciplines d
            ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(sd.value)) AS INT)
        WHERE c.course_id = @CourseID
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
            AND d.DepartmentID = @departmentID
  `




const result = await pool.request()
.input('departmentID', sql.Int, parseInt(departmentID))
.input('CourseID', sql.Int, parseInt(CourseID))
.query(query);

console.log('Disciplines for course', CourseID, ':', result.recordset);
return res.status(200).json({
    success: true,
    count: result.recordset.length,
    disciplines: result.recordset
});

}catch(error){
  console.log('Error fetching course disciplines:', error.stack);
    return next(errorHandler(500, "Server Error: " + error.message));
}

}


