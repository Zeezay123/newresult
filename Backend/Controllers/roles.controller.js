import {sql,poolPromise} from '../db.js'
import { errorHandler } from '../utils/error.js';



export const getRoles = async (req, res, next) => {
    const hodid = req.user.id;
    
try {
    const pool = await poolPromise;
    if(!pool){
        return next(errorHandler(500, "Database connection failed"));
    }
    const result = await pool.request()
    .input('HODID', sql.VarChar, hodid)
    .query(`
        SELECT roles 
        FROM dbo.tblStaffDirectory 
        WHERE StaffId = @HODID
    `);
    
    const roles = result.recordset.length > 0 ? result.recordset[0].roles : null;

    //filter out empty roles and trim whitespace
    const rolesArray = roles ? roles.split(',').map(role => role.trim()).filter(role => role) : [];

    const isHod = rolesArray.includes('3'); // Assuming '3' is the role ID for HOD
    const isLecturer = rolesArray.includes('1'); // Assuming '1' is the role ID for Lecturer
    const isAdvisor = rolesArray.includes('2'); // Assuming '2' is the role ID for Advisor

    res.status(200).json({ success: true, isHod, isLecturer, isAdvisor });

} catch (error) {
    console.error('Error fetching roles:', error.stack);
    return next(errorHandler(500, "Server Error: " + error.message))
}

}