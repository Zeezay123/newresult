import {sql, poolPromise} from './db.js';

async function checkTables() {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed');
            process.exit(1);
        }

        // Check for course/courses tables
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME IN ('course', 'courses')
        `);
        
        console.log('Available course tables:');
        console.table(result.recordset);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
