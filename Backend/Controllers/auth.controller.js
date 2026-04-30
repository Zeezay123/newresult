
import {sql, poolPromise, poolPromiseTwo} from '../db.js'
import { errorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const useSecureCookie = process.env.COOKIE_SECURE === 'true' || isProduction;
let cookieSameSite = (process.env.COOKIE_SAMESITE || (isProduction ? 'lax' : 'lax')).toLowerCase();

if (cookieSameSite === 'none' && !useSecureCookie) {
    cookieSameSite = 'lax';
}

const authCookieOptions = {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: cookieSameSite
};




export const Signinii = async (req, res, next) => {

    const {username} =req.body
const type = process.env.NODE_ENV || 'development';
   
    if(!username){
        return next(errorHandler(400, "Username, password, and role are required"))
    }

   if( type ==='development'){
  try{

    const pool = await poolPromise
    const poolTwo = await poolPromiseTwo



    if(!pool){
        return next(errorHandler(500, "Database connection failed"))
    }

    if(!poolTwo){
        return next(errorHandler(500, "Database connection to Pool Two failed"))
    }

    const query =` SELECT StaffId, departmentid, facultyid, Status from tblStaffDirectory WHERE StaffId = @StaffId`;
    const result = await poolTwo.request()
    .input('StaffId', sql.VarChar, username)
    .query(query)

    if(result.recordset.length === 0){
        return next(errorHandler(401, "Invalid Credentials"))
    }



    const status = result.recordset[0].Status
    const StaffId = result.recordset[0].StaffId
    const departmentid = result.recordset[0].departmentid
    const facultyid = result.recordset[0].facultyid

    // get role from resultUsers table

    const roleQuery = `SELECT ru.RoleID, r.RoleName 
    FROM dbo.resultUsers ru
    INNER JOIN dbo.Roles r ON ru.RoleID = r.RoleID
    WHERE ru.StaffID = @StaffId`; 

    const roleResult = await pool.request()
    .input('StaffId', sql.VarChar, StaffId)
    .query(roleQuery)

    if(roleResult.recordset.length === 0){
        
        if (status !== 'Academic Staff'){
            return next(errorHandler(403, "Unauthorized: Not an academic staff"))
        }

        // Default to lecturer role if no specific role found
        const token = jwt.sign(
            {
                id: StaffId,
                role: 'Lecturer',
                departmentID: departmentid,
                facultyID: facultyid
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        // Send response
        return res.status(200)
            .cookie('access_token', token, authCookieOptions)
            .json({
                success: true,
                message: "Signin Successful",
                user: {
                    id: StaffId,
                    name: StaffId,
                    role: 'Lecturer',
                    department: departmentid,
                    faculty: facultyid
                },
                token: token
            })

    }

    const roles = roleResult.recordset.map(r => r.RoleName);
    const roleName =roles.includes('Dean') ? 'Dean' : roles.includes('Admin') ? 'Admin' : roles.includes('Senate') ? 'Senate' : 'Staff';
    //generate jwt token 
   const token = jwt.sign(
        {
            id: StaffId,
            role: roleName,
            departmentID: departmentid,
            facultyID: facultyid
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

    // Send response
    return res.status(200)
        .cookie('access_token', token, authCookieOptions)
        .json({
            success: true,
            message: "Signin Successful",
            user: {
                id: StaffId,
                name: StaffId,
                role: roleName,
                department: departmentid,
                faculty: facultyid
            },
            token: token
        })
  } catch(error){
    console.error('Error during sign-in:', error.stack);    
    return next(errorHandler(500, "Server error"))
  } 

}







    // if(role?.toLowerCase() === 'advisor' ){
    //     try{

    //         const pool = await poolPromise

    //         if(!pool){
    //             return next(errorHandler(500, "Database connection failed"))
    //         }


    //         const result = await pool.request()
    //         .input('StaffCode', sql.VarChar, username)
    //         .query(`SELECT * FROM Level_Advisors
    //              WHERE 
    //             StaffCode = @StaffCode`)      
                 
         




    //         if(result.recordset.length === 0){
    //             return next(errorHandler(401, "Invalid Credentials"))
    //         }

    //         const user = result.recordset[0]
        
    //         // Generate JWT token
    //         const token = jwt.sign(
    //             {
    //                 id: user.StaffCode,
    //                 role: 'Advisor',
    //                 departmentID: user.DepartmentID
    //             }, 
    //             process.env.JWT_SECRET,
    //             { expiresIn: '1h' }
    //         )

    //         // Send response
    //         return res.status(200)
    //             .cookie('access_token', token, authCookieOptions)
    //             .json({
    //                 success: true,
    //                 message: "Signin Successful",
    //                 user: {
    //                     id: user.StaffCode,
    //                     name: user.StaffCode,
    //                     role: 'Advisor',
    //                     department: user.DepartmentID
    //                 },
    //                 token: token
    //             })
    //     }catch(err){
    //         console.error("Signin error details:", err.message)
    //         console.error("Full error:", err)
    //         return next(errorHandler(500, `Server error: ${err.message}`))
    //     }
    // }
    // if(role?.toLowerCase()  === 'student'){
    //     try {
            
    //        const pool = await poolPromise
         
        
         
    //      if(!pool){
    //          return next(errorHandler(500, "Database connection failed"))
    //      }
         
    //      const result = await pool.request()
    //      .input('MatNo', sql.VarChar, username)
    //      .query(`SELECT * FROM student
    //          WHERE MatNo = @MatNo`) 
    
       
            
    //         if(result.recordset.length === 0){
    //             return next(errorHandler(401, "Invalid Credentials"))
    //         }

    //         const user = await result.recordset[0]
        
    //         // Generate JWT token
    //         const token = jwt.sign(
    //             {
    //                 id: user.MatNo,
    //                 role: 'Student',
    //                 departmentID: user.DisciplineID  // Add departmentID to JWT
    //             }, 
    //             process.env.JWT_SECRET,
    //             { expiresIn: '1h' }
    //         )

    //          console.log('role:', 'Student');
    //         // Send response matching Redux slice expectations
    //         return res.status(200)
    //             .cookie('access_token', token, authCookieOptions)
    //             .json({
    //                 success: true,
    //                 message: "Signin Successful",
    //                 user: {
    //                     id: user.MatNo,
    //                     name: `${user.LastName} ${user.OtherNames}`,
    //                     email: user.email,
    //                     role: 'Student',
    //                     //department is used but but discipleid is used for students as it is the smallest unit of organization for students
    //                     department: user.DisciplineID
    //                 },
                  
                   
    //                 token: token
    //             })
 
  


    //     }catch(err){
    //         console.error("Signin error details:", err.message)
    //         console.error("Full error:", err)
    //         return next(errorHandler(500, `Server error: ${err.message}`))
    //     }


    // }
//   if(role?.toLowerCase() === 'admin'){
//     try{
//         const pool = await poolPromise
//         if(!pool){
//             return next(errorHandler(500, "Database connection failed"))
//         }
//         const result = await pool.request()
//         .input('StaffId', sql.VarChar, username)
//         .query(`SELECT StaffId, departmentid, CONCAT(LastName, ' ', OtherNames) AS name, EmailAddress AS email FROM tblStaffDirectory WHERE StaffId = @StaffId`)
        
        
   
//     }catch(err){
//         console.error("Signin error details:", err.message)
//         console.error("Full error:", err)
//         return next(errorHandler(500, `Server error: ${err.message}`))
//     }
//   }
//use for lecturers specificlogin
//  if(role?.toLowerCase() === 'lecturer'){
//     try{
//          const pool = await poolPromise
         
        
         
//          if(!pool){
//              return next(errorHandler(500, "Database connection failed"))
//          }
         
//          const result = await pool.request()
//          .input('StaffId', sql.VarChar, username)
//          .query(`SELECT StaffId, departmentid, CONCAT(LastName, ' ', OtherNames) AS name, EmailAddress AS email FROM tblStaffDirectory WHERE StaffId = @StaffId`) 
    
       
            
//             if(result.recordset.length === 0){
//                 return next(errorHandler(401, "Invalid Credentials"))
//             }

//             const user = await result.recordset[0]
         
//             console.log('User found:', user);
//             // Generate JWT token
//             const token = jwt.sign(
//                 {
//                     id: user.StaffId,
//                     role:role,
//                     departmentID: user.departmentid  // Add departmentID to JWT
//                 }, 
//                 process.env.JWT_SECRET,
//                 { expiresIn: '1h' }
//             )

//              console.log('role:', role);
//             // Send response matching Redux slice expectations
//           return  res.status(200)
//                 .cookie('access_token', token, authCookieOptions)
//                 .json({
//                     success: true,
//                     message: "Signin Successful",
//                     user: {
//                         id: user.StaffId,
//                         name: user.name,
//                         email: user.email,
//                         role: role,
//                         department: user.departmentid
//                     },
                  
                   
//                     token: token
//                 })
 
  


//         }catch(err){
//             console.error("Signin error details:", err.message)
//             console.error("Full error:", err.stack)
//             return next(errorHandler(500, `Server error: ${err.message}`))
//         }
//     }


//      try {
//         const pool = await poolPromise;
//         const result = await pool.request()
//             .input('Username', sql.VarChar, username)
//             .input('Password', sql.VarChar, password)
//             .query(`
//                 SELECT u.StaffID, u.StaffID, u.Role, u.FacultyID
//                 FROM dbo.resultUsers u
//                 LEFT JOIN dbo.AppFaculty f ON u.FacultyID = f.FacultyID
//                 WHERE u.StaffID = @Username AND u.Password = @Password
//             `);

//         if(result.recordset.length === 0){
//             return next(errorHandler(401, "Invalid Credentials"));
//         }

//         const user = result.recordset[0];

//     const token = jwt.sign({
//             id: user.StaffID,
//             role: user.Role,
//             departmentID: user.FacultyID
//          }, process.env.JWT_SECRET, { expiresIn: '1h' })

//     return    res.status(200).cookie('access_token', token, authCookieOptions).json({
//             success: true,
//             message: "Signin Successful",
//             user: {
//                 id: user.StaffID, 
//                 username: user.Username,
//                 role: user.Role,
//                 departmentID: user.DepartmentID,
//             }
//         });

//     }catch(error){
//         console.log('Error during sign-in:', error.stack);
//         return next(errorHandler(500, "Internal Server Error"));
//     }

// }
}
export const signOut = (req, res) => {
    res.clearCookie('access_token', authCookieOptions).json({
        success: true,
        message: "Signout Successful"
    });
}


export const Signin = async (req, res, next) => {
    const { username } = req.body;

    if (!username) {
        return next(errorHandler(400, "Username is required"));
    }

    try {
        const pool = await poolPromise;        // DB1
        const poolTwo = await poolPromiseTwo;  // DB2

        if (!pool || !poolTwo) {
            return next(errorHandler(500, "Database connection failed"));
        }

       console.time('staffQuery');


        const staffResult = await poolTwo.request()
            .input('StaffId', sql.VarChar, username)
            .query(`
                SELECT StaffId, departmentid, facultyid, Status 
                FROM tblStaffDirectory 
                WHERE StaffId = @StaffId
            `);
console.timeEnd('staffQuery');
        if (staffResult.recordset.length === 0) {
            return next(errorHandler(401, "Invalid Credentials"));
        }

        const staff = staffResult.recordset[0];
console.time('roleQuery');

     
        const roleResult = await pool.request()
            .input('StaffId', sql.VarChar, staff.StaffId)
            .query(`
                SELECT r.RoleName 
                FROM dbo.resultUsers ru
                INNER JOIN dbo.Roles r ON ru.RoleID = r.RoleID
                WHERE ru.StaffID = @StaffId
            `);

console.timeEnd('roleQuery');

        let roleName = 'Lecturer';

        if (roleResult.recordset.length > 0) {
            const roles = roleResult.recordset.map(r => r.RoleName);

            roleName = roles.includes('Dean') ? 'Dean'
                     : roles.includes('Admin') ? 'Admin'
                     : roles.includes('Senate') ? 'Senate'
                     : 'Staff';
        } else {
            if (staff.Status !== 'Academic Staff') {
                return next(errorHandler(403, "Unauthorized: Not an academic staff"));
            }
        }

       
        const token = jwt.sign(
            {
                id: staff.StaffId,
                role: roleName,
                departmentID: staff.departmentid,
                facultyID: staff.facultyid
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200)
            .cookie('access_token', token, authCookieOptions)
            .json({
                success: true,
                message: "Signin Successful",
                user: {
                    id: staff.StaffId,
                    name: staff.StaffId,
                    role: roleName,
                    department: staff.departmentid,
                    faculty: staff.facultyid
                },
                token
            });

    } catch (error) {
        console.error('Error during sign-in:', error.stack);
        return next(errorHandler(500, "Server error"));
    }
};