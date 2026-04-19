import {sql,poolPromise} from "../../db.js";
import { errorHandler } from "../../utils/error.js";

export const getScoreTypes = async (req, res,next) => {
 
    const userId = req.user.id;
    const hodID = req.user.departmentID;


    try{

        const pool = await poolPromise 
      
        if(!pool){
            return next(errorHandler(404,'cannot connect to database'))
        }

     if(!userId || !hodID){
        return next(errorHandler(403,'staffcode and hodID required'))
     }


     const query = `SELECT ScoreID, ScoreType FROM dbo.scoretypes`

     const result = await pool.request().query(query)

     res.status(200).json({ success: true, data: result.recordset });

    }catch(error){
        return next(errorHandler(500,`can't access the database`))
    }

}


export const setScoreType = async (req, res,next) => {
   const  userId = req.user.id;
   const  hodID = req.user.departmentID;

    const { ScoreID, course_id } = req.body;

    if(!ScoreID){
        return next(errorHandler(400,'score type is required'))
     }

     if(!course_id){
        return next(errorHandler(400,'course_id is required'))
     }

     if(!userId || !hodID){
        return next(errorHandler(403,'staffcode and hodID required'))
     }

     try{
        
        const pool = await poolPromise

        if(!pool){
            return next(errorHandler(404,'cannot connect to database'))
        }


        const checkQuery = `SELECT * FROM dbo.allocated_scoretype WHERE CourseID = @course_id`
        const checkResult = await pool.request()
        .input('course_id', sql.Int, course_id)
        .query(checkQuery) 

        if(checkResult.recordset.length > 0){
            const updateQuery = `UPDATE dbo.allocated_scoretype SET ScoreID = @ScoreID WHERE CourseID = @course_id`
            await pool.request()
            .input('ScoreID', sql.Int, ScoreID)
            .input('course_id', sql.Int, course_id)
            .query(updateQuery)
        
            return res.status(200).json({ success: true, message: 'Score type updated successfully' });
        }

        const insertQuery = `INSERT INTO dbo.allocated_scoretype (CourseID, ScoreID) VALUES (@course_id, @ScoreID)`
        await pool.request()
        .input('course_id', sql.Int, course_id)
        .input('ScoreID', sql.Int, ScoreID)
        .query(insertQuery)

        return res.status(201).json({ success: true, message: 'Score type assigned successfully' });

     }catch(error){
        return next(errorHandler(500,`can't access the database`))
     }
}

export const getAssignedScoreTypes = async (req, res,next) => {
  
    const userId = req.user.id;
    const hodID = req.user.departmentID;

    if(!userId || !hodID){
        return next(errorHandler(403,'staffcode and hodID required'))
     }

     try {

        const pool = await poolPromise

        if(!pool){
            return next(errorHandler(404,'cannot connect to database'))
        }


        const query = `SELECT a.CourseID, a.ScoreID,c.course_id, c.course_code, c.course_title, s.ScoreType
        FROM dbo.allocated_scoretype a 
        INNER JOIN dbo.courses c ON  a.CourseID = c.course_id
        INNER JOIN dbo.scoretypes s ON a.ScoreID = s.ScoreID
        where a.CourseID in (
        select cs.course_id 
        from dbo.courses cs
        CROSS APPLY STRING_SPLIT(ISNULL(cs.discipline, '')  , ',') AS courseDIS 
        INNER JOIN disciplines d ON TRY_CAST(LTRIM(RTRIM(courseDIS.value)) AS INT) = d.DisciplineID
        WHERE d.DepartmentID = @HodID
       )
        `

        const result = await pool.request()
        .input('HodID', sql.Int, hodID)
        .query(query)

        return res.status(200).json({ success: true, data: result.recordset });
        
     } catch (error) {
         console.error('Error fetching assigned score types:', error.stack); 
        return next(errorHandler(500,`can't access the database`))
     }

}