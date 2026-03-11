import {sql, poolPromise} from '../db.js'
import { errorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// const isProduction = process.env.NODE_ENV === 'production';
// const useSecureCookie = process.env.COOKIE_SECURE === 'true' || isProduction;
// let cookieSameSite = (process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax')).toLowerCase();

// Browsers reject SameSite=None cookies unless Secure=true.
// On local HTTP, force Lax to keep auth working.
// if (cookieSameSite === 'none' && !useSecureCookie) {
//     cookieSameSite = 'lax';
// }

const authCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
};




export const Signin = async (req, res, next) => {

    const {username, password, role, department} =req.body

    // const username = 'admin user'
    // const password = 'password123'
    // const role = 'admin'
    // const department = 1

    // Senate and SuperAdmin don't require department
    // const rolesWithoutDepartment = ['senate', 'superadmin'];
    // const requiresDepartment = !rolesWithoutDepartment.includes(role?.toLowerCase());

    if(!username){
        return next(errorHandler(400, "Username, password, and role are required"))
    }
// 
    // if(requiresDepartment){
    //     return next(errorHandler(400, "Department is required for this role"))
    // }

   
    if(role === 'advisor' ){
        try{

            const pool = await poolPromise

            if(!pool){
                return next(errorHandler(500, "Database connection failed"))
            }


            const result = await pool.request()
            .input('StaffCode', sql.VarChar, username)
            .input('StaffID', sql.Int, parseInt(password))
            .input('departmentID', sql.Int, parseInt(department))
            .query(`SELECT * FROM Level_Advisors
                 WHERE 
                StaffCode = @StaffCode 
                 AND StaffID = @StaffID
                 AND departmentID = @departmentID`)      
                 
         




            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.StaffCode,
                    role: 'Advisor',
                    departmentID: user.DepartmentID
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
                        id: user.StaffCode,
                        name: user.StaffCode,
                        role: 'Advisor',
                        department: user.DepartmentID
                    },
                    token: token
                })
        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }
    }

    // Senate and SuperAdmin login - no department required
    if(role.toLowerCase() === 'senate' || role.toLowerCase() === 'superadmin'){
        try{
            const pool = await poolPromise
            
            if(!pool){
                return next(errorHandler(500, "Database connection failed"))
            }
            
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .input('Role', sql.VarChar, role)
                .query(`SELECT * FROM appusers 
                    WHERE name = @username 
                    AND password = @password 
                    AND role = @Role
                    AND (departmentID IS NULL OR departmentID = 0)`)
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = result.recordset[0]
            
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.name,
                    role: user.Role,
                    departmentID: null  // No department for Senate/SuperAdmin
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            console.log('role:', user.Role);
            
            return res.status(200)
                .cookie('access_token', token, authCookieOptions)
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.Role,
                        department: null  // No department
                    },
                    token: token
                })
                
        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }
    }

    if(role === 'student'){
        try {
            
           const pool = await poolPromise
         
        
         
         if(!pool){
             return next(errorHandler(500, "Database connection failed"))
         }
         
         const result = await pool.request()
         .input('MatNo', sql.VarChar, username)
         .query(`SELECT * FROM student
             WHERE MatNo = @MatNo`) 
    
       
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = await result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.MatNo,
                    role: 'Student',
                    departmentID: user.DisciplineID  // Add departmentID to JWT
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

             console.log('role:', 'Student');
            // Send response matching Redux slice expectations
            res.status(200)
                .cookie('access_token', token, authCookieOptions)
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.MatNo,
                        name: `${user.LastName} ${user.OtherNames}`,
                        email: user.email,
                        role: 'Student',
                        //department is used but but discipleid is used for students as it is the smallest unit of organization for students
                        department: user.DisciplineID
                    },
                  
                   
                    token: token
                })
 
  


        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }


    }




    try{
         const pool = await poolPromise
         
        
         
         if(!pool){
             return next(errorHandler(500, "Database connection failed"))
         }
         
         const result = await pool.request()
         .input('StaffCode', sql.VarChar, username)
         .input('password',sql.VarChar, password)
         .input('Role', sql.VarChar, role)
         .input('departmentID', sql.Int, department)
         .query('SELECT * FROM appusers WHERE StaffCode = @StaffCode AND password = @password AND role = @role AND departmentID = @departmentID') 
    
       
            
            if(result.recordset.length === 0){
                return next(errorHandler(401, "Invalid Credentials"))
            }

            const user = await result.recordset[0]
        
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.StaffCode,
                    role: user.role,
                    departmentID: user.departmentID  // Add departmentID to JWT
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

             console.log('role:', user.Role);
            // Send response matching Redux slice expectations
            res.status(200)
                .cookie('access_token', token, authCookieOptions)
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.StaffCode,
                        name: user.name,
                        email: user.email,
                        role: user.Role,
                        department: user.departmentID
                    },
                  
                   
                    token: token
                })
 
  


        }catch(err){
            console.error("Signin error details:", err.message)
            console.error("Full error:", err)
            return next(errorHandler(500, `Server error: ${err.message}`))
        }

}