import { sql, poolPromise } from '../../db.js';

export const syncCourseAssignments = async () => {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed during sync');
            return;
        }

        // Insert missing course assignments (courses without assignment entries)
        // Creates entries only for active session - historical data comes from result table
        const query = `
            INSERT INTO dbo.course_assignment (CourseID,CourseCode, SemesterID ,AssignmentStatus,ProgrammeID, CourseType, CourseCategory, LevelID, AssignedDate, SessionID,FacultyID, DepartmentID)
            SELECT 
                c.CourseID,
                c.CourseCode,
                c.SemesterID,
                'unassigned' as AssignmentStatus,
                c.ProgrammeID,
                c.CourseType,
                c.CourseCategory,
                c.LevelID,
                NULL as AssignedDate, 
                s.SessionID, 
                c.FacultyID,
                c.DepartmentID
            FROM dbo.course c
            CROSS JOIN dbo.sessions s
            LEFT JOIN dbo.course_assignment ca 
                ON c.CourseID = ca.CourseID 
                AND s.SessionID = ca.SessionID
            WHERE ca.CourseID IS NULL
                AND s.isActive = 1

            ORDER BY c.CourseCode   
        `;

        const result = await pool.request().query(query);
        
        console.log(`Synced course assignments: ${result.rowsAffected[0]} new entries created`);
        
        return result.rowsAffected[0];
    } catch (error) {
        console.error('Error syncing course assignments:', error);
        throw error;
    }
};
