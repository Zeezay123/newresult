import {sql, poolPromise} from '../db.js';
import { errorHandler } from '../utils/error.js';


// Get all sessions
export const getSessions = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const result = await pool.request()
            .query(`
                SELECT 
                    SessionID,
                    SessionName,
                    isActive
                FROM dbo.sessions
                ORDER BY SessionID DESC
            `);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            sessions: result.recordset
        });

    } catch (error) {
        console.error('Error fetching sessions:', error);
        return next(errorHandler(500, "Error fetching sessions: " + error.message));
    }
};

// Get all semesters
export const getSemesters = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const result = await pool.request()
            .query(`
                SELECT 
                    SemesterID,
                    SemesterName
                FROM dbo.semesters
                ORDER BY SemesterID
            `);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            semesters: result.recordset
        });

    } catch (error) {
        console.error('Error fetching semesters:', error);
        return next(errorHandler(500, "Error fetching semesters: " + error.message));
    }
};

// Get active session
export const getActiveSession = async (req, res, next) => {
                try {
                    const pool = await poolPromise;

                    if (!pool) {
                        return next(errorHandler(500, "Database connection failed"));
                    }

                    const result = await pool.request()
                        .query(`
                            SELECT 
                                SessionID,
                                SessionName,
                                isActive
                            FROM dbo.sessions
                            WHERE isActive = '1'
                        `);

                    if (result.recordset.length === 0) {
                        return next(errorHandler(404, "No active session found"));
                    }

                    res.status(200).json({
                        success: true,
                        session: result.recordset[0]
                    });

                } catch (error) {
                    console.error('Error fetching active session:', error);
                    return next(errorHandler(500, "Error fetching active session: " + error.message));
                }
};

export const getActiveSemester = async (req, res, next) => {
    try {
        const pool = await poolPromise;

        if (!pool) {
            return next(errorHandler(500, "Database connection failed"));
        }

        const result = await pool.request()
            .query(`
                SELECT 
                    SemesterID,
                    SemesterName,
                    isActive
                FROM dbo.semesters
                WHERE isActive = 'true'
            `);

        if (result.recordset.length === 0) {
            return next(errorHandler(404, "No active semester found"));
        }

        res.status(200).json({
            success: true,
            semester: result.recordset[0]
        });

    } catch (error) {
        console.error('Error fetching active semester:', error);
        return next(errorHandler(500, "Error fetching active semester: " + error.message));
    }
};