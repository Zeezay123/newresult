import {sql,poolPromise,poolPromiseTwo} from '../../db.js'

export const getLecturers = async (req, res, next) => {
        const { search, orderBy } = req.query;
        const hodId = req.user?.departmentID;
        const staffCode = req.user?.id;
    
    
    
    
    try {
        const pool = await poolPromise;
        const poolTwo = await poolPromiseTwo;

        if (!hodId) {
            return res.status(400).json({ error: "HOD department ID not found" });
        }
        if (!staffCode) {
            return res.status(400).json({ error: "HOD staff code not found" });
        }
       
        //active session and semester

          const activeSessionResult = await pool.request()
                 .query(`
                    SELECT  SessionID , SessionName 
                    FROM dbo.sessions 
                    WHERE isActive = '1'
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


                 //get full lecturers details.

                 const query = `
                    SELECT s.StaffID, s.LastName, s.OtherNames, s.EmailAddress, s.DepartmentID, d.DepartmentName
                      

                    `
    

    } catch (err) {
        console.error("Error fetching lecturers:", err);
        res.status(500).json({ error: "An error occurred while fetching lecturers" });
    }

}