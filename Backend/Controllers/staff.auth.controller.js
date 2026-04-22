import {sql, poolPromise} from '../db.js'
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

const authCookiesOptions = {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: cookieSameSite
};

export const staffSignin = async (req, res, next) => {

    const {username} = req.body 

    if(!username){
        return next(errorHandler(400, "Staffid/code is required"))
    }

    try {
        
      const pool = await poolPromise

      if(!pool){
          return next(errorHandler(500, "Database connection failed"))
      }


        const query = `
        SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM STRING_SPLIT(roles, ',') 
            WHERE TRIM(value) = '4'
        ) THEN '4'
        WHEN EXISTS (
            SELECT 1 
            FROM STRING_SPLIT(roles, ',') 
            WHERE TRIM(value) = '3'
        ) THEN '3'
        ELSE '1'  -- default lecturer role
    END AS AssignedRole,
   
    StaffId,
    facultyid,
    departmentid,
    roles
FROM tblStaffDirectory
WHERE StaffId = @StaffId`


        const result = await pool.request()
        .input('StaffId', sql.VarChar, username)
        .query(query);

   
        console.log('Database query result:', result.recordset[0]);

        if(result.recordset.length === 0){
            return next(errorHandler(401, "Invalid Staff Code"))
        }
    

   const user = result.recordset[0]
   const roleID = user?.AssignedRole

   const roles = await pool.request()
   .input('roleID', sql.Int, parseInt(roleID))
   .query(`SELECT RoleName FROM Roles WHERE RoleID = @roleID`)

    const roleName = roles.recordset[0]?.RoleName;
    const scopeId = String(roleID) === '4' ? user.facultyid : user.departmentid;
   
 
   const token = jwt.sign({
      id: user.StaffId,
      role: roleName,
        departmentID: scopeId
   },
    process.env.JWT_SECRET, {expiresIn: '1d'})

    res.status(200)
                .cookie('access_token', token, authCookiesOptions)
                .json({
                    success: true,
                    message: "Signin Successful",
                    user: {
                        id: user.StaffId,
                        name: user.name,
                        email: user.email,
                        role: roleName,
                        department: scopeId
                    },
                  
                   
                    token: token
                })
 

    } catch (error) {
        console.error('Signin error:', error.stack || error );
        return next(errorHandler(500, "Internal Server Error"))
    }
}