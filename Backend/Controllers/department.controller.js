import { sql, poolPromise } from '../db.js';
import { errorHandler } from '../utils/error.js';

// Get all departments
export const getAllDepartments = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const result = await pool.request()
            .query(`
                SELECT 
                    DepartmentID,
                    DepartmentName,
                    FacultyID
                FROM dbo.appdepartment
                ORDER BY DepartmentName ASC
            `);

        res.status(200).json({
            success: true,
            departments: result.recordset
        });

    } catch (error) {
        console.error('Error fetching departments:', error);
        next(errorHandler(500, "Error fetching departments"));
    }
};
