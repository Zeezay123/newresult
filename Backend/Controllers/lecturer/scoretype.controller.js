import {sql,poolPromise} from "../../db.js";
import { errorHandler } from "../../utils/error.js";


export const getAssignedScoreTypes = async (req, res,next) => {
    const userId = req.user.id;
    const hodID = req.user.departmentID;

    let ca=30;
    let ex =70

    const CourseID = req.query.course_id;

    if(!CourseID){
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

          
        const query =`Select ScoreID from dbo.allocated_scoretype where CourseID = @CourseID`
        const result = await pool.request()
        .input('CourseID', sql.Int, CourseID)
        .query(query)

        if(result.rowsAffected[0] === 0){
            return res.status(200).json({ success: true, ca: ca, ex: ex });
        }

        const assignedScoreID = result.recordset[0].ScoreID;

        ca = assignedScoreID === 1 ? 30 : assignedScoreID === 2 ? 40 :  assignedScoreID === 3 ? 50 : ca;
        ex = assignedScoreID === 1 ? 70 : assignedScoreID === 2 ? 60 : assignedScoreID === 3 ? 50 : ex;

       return res.status(200).json({ success: true, ca: ca, ex: ex });


     }catch(error){
        return next(errorHandler(500,`can't access the database`))
     }

}