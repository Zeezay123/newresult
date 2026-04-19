import {sql, poolPromise} from '../../db.js';
import { errorHandler } from '../../utils/error.js';


export const getPendingResults = async (req, res, next) => {

       const senateID = req.user.id
       if(!senateID){
        return next(errorHandler(400, 'Invalid senate ID'))
       }
      
    try{

        const pool = await poolPromise

        if(!pool){
            return next(errorHandler(500, 'Database connection failed'))
        }
        



// Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

        const result = await pool.request()
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, activeSemesterID)
        .query(`
            SELECT COUNT(*) AS PendingCount
            FROM dbo.results r
            WHERE r.SessionID = @SessionID
              AND r.SemesterID = @SemesterID
              AND r.Advisor = 'Approved'
              AND r.hod_Approval = 'Approved'
              AND (r.Bsc_Approval = 'Pending' OR r.Bsc_Approval IS NULL)
        `)
         
        if(result.recordset.length === 0){
            return res.status(200).json({ success: true, pendingCount: 0 })
        }

        const pendingCount = result.recordset[0].PendingCount

        return res.status(200).json({ success: true, pendingCount })
            




    }catch(error){
       console.log('Error fetching pending results:', error.stack)
       return next(errorHandler(500, 'Error fetching pending results'))
    }
}


export const getApprovedResults = async (req, res, next) => {

    const senateID = req.user.id

    if(!senateID){
     return next(errorHandler(400, 'Invalid senate ID'))
    }

    try{
          const pool = await poolPromise
          
          if(!pool) {
              return next(errorHandler(500, 'Database connection failed'))
          }

     
           // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;

        const result = await pool.request()
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, activeSemesterID)
        .query(`
            SELECT COUNT(*) AS ApprovedCount
            FROM dbo.results r
            WHERE r.SessionID = @SessionID
              AND r.SemesterID = @SemesterID
              AND r.Advisor = 'Approved'
              AND r.hod_Approval = 'Approved'
              AND r.Bsc_Approval = 'Approved'
        `)
         
        if(result.recordset.length === 0){
            return res.status(200).json({ success: true, approvedCount: 0 })
        }

        const approvedCount = result.recordset[0].ApprovedCount

        return res.status(200).json({ success: true, approvedCount })
            

    } catch(error){
        console.log('Error fetching approved results:', error.stack)
        return next(errorHandler(500, 'Error fetching approved results'))
    }

}

export const getStudentStats = async (req, res, next) => {
    const senateID = req.user.id

    if(!senateID){
        return next(errorHandler(400, 'Invalid senate ID'))
    
    }

    try{

        const pool = await poolPromise

        if(!pool){
            return next(errorHandler(500, 'Database connection failed'))
        }
     
    
   // Get active session and semester
    const activeSessionResult = await pool.request()
      .query(`SELECT SessionID FROM dbo.sessions WHERE isActive = 1`);
    
    if(activeSessionResult.recordset.length === 0){
      return next(errorHandler(404, "No active session found"))
    }
    
    const activeSessionID = activeSessionResult.recordset[0].SessionID;

    const activeSemesterResult = await pool.request()
      .query(`SELECT SemesterID FROM dbo.semesters WHERE isActive = 'true'`);
    
    if(activeSemesterResult.recordset.length === 0){
      return next(errorHandler(404, "No active semester found"))
    }
    
    const activeSemesterID = activeSemesterResult.recordset[0].SemesterID;
   


        const result = await pool.request()
        .input('SessionID', sql.Int, activeSessionID)
        .input('SemesterID', sql.Int, activeSemesterID)
        .query(`
            SELECT COUNT(DISTINCT r.MatricNo) AS StudentCount
            FROM dbo.results r
            WHERE r.SessionID = @SessionID
              AND r.SemesterID = @SemesterID
        `)
         
        if(result.recordset.length === 0){
            return res.status(200).json({ success: true, studentCount: 0 })
        }

        const studentCount = result.recordset[0].StudentCount

        return res.status(200).json({ success: true, studentCount })
           
    }catch(error){
        console.log('Error fetching student stats:', error.stack)
        return next(errorHandler(500, 'Error fetching student stats'))
    }
}