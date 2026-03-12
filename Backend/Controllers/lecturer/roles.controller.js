import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


// export const getRoles = async (req, res, next) => {
//     const lectid = req.user.lectid;

//     if(!lectid){
//         return(next(403, "Lecturer ID is required"));
//     }

//     try{

//         const pool = await poolPromise;

//         if(!pool){
//             return next(errorHandler(500, "Database connection failed"));
//         }
         
       
//         const staffRoles = await pool.request()
//         .input('StaffCode', sql.VarChar, lectid)
//         .query(`
//             SELECT s.roles,
//             FROM dbo.staff s
//             WHERE s.StaffNo = @StaffCode
//         `)
//         if(staffRoles.recordset.length === 0){
//             return next(errorHandler(404, "No roles found for this lecturer"))
//         }

//         const rolesString = staffRoles.recordset[0].roles;
//         const rolesArray = rolesString.split(',').map(role => role.trim());
    


//     }catch(error){
//         console.log()
//         return next(errorHandler(500, "Error fetching roles: " + error.message));
//     }
// }


 export const CheckAdvisor = async (req, res, next) => {
    const lectid = req.user.id
    
    try {
        
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }


        const result = await pool.request()
            .input('StaffCode', sql.VarChar, lectid)
            .query(`
                SELECT la.AdvisorID, la.StaffCode 
                FROM dbo.Level_Advisors la
                WHERE StaffCode = @StaffCode
            `);

            if(result.recordset.length === 0){
                return res.status(200).json({ success: true, isAdvisor: false });
            } else {
                return res.status(200).json({ success: true, isAdvisor: true });
            }

    } catch (error) {
        console.error('Error checking advisor role:', error.stack);
        return next(errorHandler(500, "Error checking advisor role: " + error.message));
    }
}