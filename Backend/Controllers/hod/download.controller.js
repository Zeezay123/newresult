import {sql, poolPromise} from '../../db.js'
import { errorHandler } from '../../utils/error.js'
import ExcelJS from 'exceljs';


export const downloadAssignedCourses = async (req, res, next) => {

    const HodId = req.params.id;

    console.log("HOD ID for download:", HodId);

 try {
   const pool = await poolPromise;
   
   
   if(!HodId){
        return res.status(400).json({message: "HOD ID is required"});
    }
 

    if(!pool){
        return next(errorHandler(500, "Database connection failed"));
    }

        const result = await pool.request()
        .input('HodId', sql.Int, HodId)
        .query(`
                SELECT
                    c.CourseCode,
                    c.CourseName,
                    ca.LecturerID,
                    CONCAT(staff.LastName, ' ', staff.OtherNames) AS LecturerName,
                    ca.AssignedDate
                FROM dbo.course c
                INNER JOIN dbo.course_assignment ca ON c.CourseID = ca.CourseID
                INNER JOIN dbo.tblStaffDirectory staff ON ca.LecturerID = staff.StaffId
                WHERE 
                    ca.LecturerID IS NOT NULL
                    AND ca.AssignmentStatus = 'assigned';
        `)


        if(result.recordset.length === 0){
            return res.status(404).json({message: "No assigned courses found for this HOD"});}

const assignedCourses = result.recordset;

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Assigned Courses');
    
worksheet.columns = [
    { header: 'Course Code', key: 'CourseCode', width: 15 },
    { header: 'Course Name', key: 'CourseName', width: 40 },
    { header: 'Lecturer ID', key: 'LecturerID', width: 15 },
    { header: 'Lecturer Name', key: 'LecturerName', width: 30 },
    { header: 'Assigned Date', key: 'AssignedDate', width: 20 }
];


worksheet.getRow(1).font ={bold: true};
worksheet.getRow(1).eachCell((cell) => {
    cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF000000' } }
    }
})


//  worksheet.insertRow(1, ['Course Code:', courseInfo.CourseCode]);
//         worksheet.insertRow(2, ['Course Name:', courseInfo.CourseName]);
//         worksheet.insertRow(3, ['Session:', courseInfo.SessionName]);
//         worksheet.insertRow(4, ['Semester:', courseInfo.SemesterName]);
//         worksheet.insertRow(5, ['Credit Units:', courseInfo.CreditUnits]);
//         worksheet.insertRow(6, ['Department Name:', courseInfo.DepartmentName]);
//         worksheet.insertRow(7, []);

     worksheet.getRow(1).font = { color: { argb: 'FF000000' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 25;


assignedCourses.forEach((course) => {
    worksheet.addRow({
        CourseCode: course.CourseCode,
        CourseName: course.CourseName,
        LecturerID: course.LecturerID,
        LecturerName: course.LecturerName,
        AssignedDate: course.AssignedDate ? new Date(course.AssignedDate) : ''
    });
});

// Apply autofilter and basic formatting
worksheet.autoFilter = { from: 'A1', to: 'E1' };
worksheet.getColumn('AssignedDate').numFmt = 'yyyy-mm-dd hh:mm';

// Stream workbook to response as attachment
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `attachment; filename=assigned_courses_${Date.now()}.xlsx`);
await workbook.xlsx.write(res);
res.end();



  
 } catch (error) {
     console.error('downloadAssignedCourses error:', error);
     return next(errorHandler(500, "Server Error: " + error.message))
 }



}


