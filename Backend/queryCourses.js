import {sql, poolPromise} from './db.js';

async function queryCourses() {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed');
            process.exit(1);
        }

        // Get table structure
        console.log('=== COURSE TABLE STRUCTURE ===');
        const structureResult = await pool.request().query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'course'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(structureResult.recordset);

        // Get sample data
        console.log('\n=== SAMPLE COURSE DATA (First 5 rows) ===');
        const dataResult = await pool.request().query(`
            SELECT TOP 5 * FROM dbo.course
        `);
        console.table(dataResult.recordset);

        console.log('\n=== Total Courses Count ===');
        const countResult = await pool.request().query(`
            SELECT COUNT(*) as TotalCourses FROM dbo.course
        `);
        console.log('Total courses:', countResult.recordset[0].TotalCourses);

        process.exit(0);
    } catch (error) {
        console.error('Error querying courses:', error);
        process.exit(1);
    }
}

queryCourses();
