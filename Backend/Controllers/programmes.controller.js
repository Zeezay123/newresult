import { sql, poolPromise } from "../db.js";
import { errorHandler } from "../utils/error.js";

export const getProgrammes = async (req, res) => {
    const user = req.user;

    if(!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            
            .query(`
                SELECT ProgrammeID, ProgrammeName, Duration 
                FROM Programmes 
                
            `)

            if(result.recordset.length === 0) {
                return res.status(404).json({ success: false, message: 'No programmes found' });
            }

            return res.status(200).json({ success: true, programmes: result.recordset });
            
    }catch (error) {
        console.error('Error fetching programmes:', error);
        return errorHandler(res, 'Failed to fetch programmes', 500);
    }

}