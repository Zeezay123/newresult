import {sql,poolPromise} from "../../db.js"
import { errorHandler } from "../../utils/error.js";


export const getAdvisors = async (req, res, next) =>{
    const hodID = req.user.departmentID;

    // const programmeID = req.query.programmeID; 
    
    // if(!programmeID){
    //     return next(errorHandler(400, 'ProgrammeID is required'));
    // }

    if(!hodID) {
        return next(errorHandler(400, 'HOD DepartmentID is required'));
    }

   try {
     
    const pool = await poolPromise;

    if(!pool){
        return next(errorHandler(500, 'Database connection failed'));
    }

    const lecturersResult = await pool.request()
        .input('DepartmentID', sql.Int, hodID)
        .query(`
            SELECT StaffId, CONCAT(LastName, ' ', OtherNames) AS StaffName 
            FROM dbo.tblStaffDirectory 
            WHERE departmentid = @DepartmentID
        `);

    if(lecturersResult.recordset.length === 0){
        return res.status(404).json({ success: false, message: 'No lecturers found in this department' });
    }

    const levelsResult = await pool.request() 

    .query(`
        SELECT LevelID, LevelName 
        FROM dbo.levels
    `);

    if(levelsResult.recordset.length === 0){
        return res.status(404).json({ success: false, message: 'No levels found' });
    }

    return res.status(200).json({
        success: true,
        advisors: lecturersResult.recordset,
        levels: levelsResult.recordset
    });


   } catch (error) {
    console.error('Error fetching advisors:', error.stack);
    return next(errorHandler(500, 'Failed to fetch advisors', error.message));
   }
}


export const assignAdvisor = async (req, res, next) => {



    const { LevelID, StaffCode, ProgrammeID, DepartmentID } = req.body;

    if(!DepartmentID){
        return next(errorHandler(400, 'DepartmentID is required'));
    }
  
    if (!LevelID || !StaffCode || !ProgrammeID) {
        return next(errorHandler(400, 'LevelID, StaffCode, ProgrammeID and DepartmentID are required'));
    }


    try {

        const pool = await poolPromise;
        if(!pool){
            return next(errorHandler(500, 'Database connection failed'));
        }

        const getSessionID = await pool.request()
<<<<<<< HEAD
        .query(`SELECT SessionID from dbo.sessions WHERE isActive = '1'`)
=======
        .query(`SELECT SessionID from dbo.sessions WHERE isActive = 1`)
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938

        if(getSessionID.recordset.length == 0){
            return next(errorHandler(404,'No Level Found'))
        }
    
        const assignmentExist = await pool.request()
        .input('LevelID', sql.Int, LevelID)
        .input('ProgrammeID', sql.Int, ProgrammeID)
        .input('StaffCode',sql.VarChar, StaffCode)
        .input('DepartmentID', sql.Int, DepartmentID)
        .input('SessionID', sql.Int, getSessionID.recordset[0].SessionID)
        .query(`
            SELECT AdvisorID FROM dbo.Level_Advisors
             WHERE LevelID = @LevelID
             AND ProgrammeID = @ProgrammeID
             AND StaffCode = @StaffCode
             AND DepartmentID = @DepartmentID
             AND SessionID = @SessionID
            `)

        if(assignmentExist.recordset.length > 0){
            return next(errorHandler(400, 'This advisor is already/coordinator assigned to this level and programme for the current session'));
        }


        const existingAdvisor = await pool.request()
        .input('LevelID', sql.Int, LevelID)
        .input('ProgrammeID', sql.Int, ProgrammeID)
        .input('DepartmentID', sql.Int, DepartmentID)
        .input('SessionID', sql.Int, getSessionID.recordset[0].SessionID)
        .query(`
            SELECT AdvisorID, StaffCode FROM dbo.level_Advisors
             WHERE LevelID = @LevelID
             AND ProgrammeID = @ProgrammeID
             AND DepartmentID = @DepartmentID
             AND SessionID = @SessionID
        `);
      
        let result;
        if(existingAdvisor.recordset.length > 0){
            result = await pool.request()
            .input('LevelID', sql.Int, LevelID)
            .input('ProgrammeID', sql.Int, ProgrammeID)
            .input('StaffCode',sql.VarChar, StaffCode)
            .input('DepartmentID', sql.Int, DepartmentID)
            .input('SessionID', sql.Int, getSessionID.recordset[0].SessionID)
            .query(` UPDATE dbo.Level_Advisors 
                     SET StaffCode = @StaffCode
                     WHERE LevelID = @LevelID
                     AND ProgrammeID = @ProgrammeID
                     AND DepartmentID = @DepartmentID
                     AND SessionID = @SessionID`)
        }
        else {
            
            const getStaff = await pool.request()
            .input('StaffCode', sql.VarChar, StaffCode)
            .query(`SELECT StaffId FROM dbo.tblStaffDirectory WHERE StaffId = @StaffCode`)

                if(getStaff.recordset.length === 0){
                    return next(errorHandler(404, 'Staff member not found'));
                }

                const staffID = getStaff.recordset[0].StaffId;
            
            result = await pool.request()
        .input('LevelID', sql.Int, LevelID)
        .input('ProgrammeID', sql.Int, ProgrammeID)
        .input('StaffCode',sql.VarChar, StaffCode)
        .input('DepartmentID', sql.Int, DepartmentID)
        .input('StaffID', sql.VarChar, staffID)
        .input('SessionID', sql.Int, getSessionID.recordset[0].SessionID)
        .query(` INSERT INTO dbo.Level_Advisors (LevelID, ProgrammeID, StaffCode, DepartmentID, StaffID, SessionID, RoleType)
                 VALUES (@LevelID, @ProgrammeID, @StaffCode, @DepartmentID, @StaffID, @SessionID, 'Advisor')`)
        }


        if(result.rowsAffected[0] === 0){
            return next(errorHandler(500, 'Failed to assign advisor'));
        }


        return res.status(200).json({ success: true, message: 'Advisor assigned successfully' });
    } catch (error) {
        console.error('Error assigning advisor:', error.stack);
        return next(errorHandler(500, 'Failed to assign advisor', error.message));
    }
}

export const getAssignedAdvisors = async(req,res,next) =>{
    const hodID = req.params.HodID

    if(!hodID){

        return next(errorHandler(400, 'HOD ID is required'));
     }

   try {
    const pool = await poolPromise;

    if(!pool){
        return next(errorHandler(500, 'Database connection failed'));
    }

    const result = await pool.request()
    .input('HodID', sql.Int, hodID)
    .query(`
        SELECT
        la.AdvisorID,
        l.LevelName,
        CONCAT(s.LastName, ' ', s.OtherNames) as StaffName,
        p.ProgrammeName
         

        FROM dbo.Level_Advisors la
        JOIN dbo.levels l ON la.LevelID = l.LevelID
        JOIN dbo.programmes p ON la.ProgrammeID = p.ProgrammeID
        JOIN dbo.tblStaffDirectory s ON la.StaffCode = s.StaffId
        WHERE la.DepartmentID = @HodID

        
             
     `)

     if(result.recordset.length === 0){
        return res.status(404).json({ success: false, message: 'No assigned advisors found for this HOD' });
     }

        return res.status(200).json({ success: true, assignedAdvisors: result.recordset });
    
   } catch (error) {
    console.error('Error fetching assigned advisors:', error.stack);
    return next(errorHandler(500, 'Failed to fetch assigned advisors', error.message));
   }


    }
