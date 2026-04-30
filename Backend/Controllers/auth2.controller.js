import {sql, poolPromise} from '../db.js';
import { errorHandler } from '../utils/error.js';



export const signIn = async (req, res, next) => {
    const { username, password } = req.body

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Password', sql.VarChar, password)
            .query(`
                SELECT u.StaffID, u.StaffID, u.Role, u.FacultyID
                FROM dbo.resultUsers u
                LEFT JOIN dbo.AppFaculty f ON u.FacultyID = f.FacultyID
                WHERE u.StaffID = @Username AND u.Password = @Password
            `);

        if(result.recordset.length === 0){
            return next(errorHandler(401, "Invalid Credentials"));
        }

        const user = result.recordset[0];
        res.status(200).json({
            success: true,
            message: "Signin Successful",
            user: {
                id: user.StaffID, 
                username: user.Username,
                role: user.Role,
                departmentID: user.DepartmentID,
            }
        });

    }catch(error){
        console.log('Error during sign-in:', error.stack);
        return next(errorHandler(500, "Internal Server Error"));
    }
}