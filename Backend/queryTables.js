import {sql, poolPromise} from './db.js';

async function queryTables() {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed');
            process.exit(1);
        }

        // Check for discipline-related tables
        console.log('=== AVAILABLE TABLES ===');
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_NAME LIKE '%discip%' OR TABLE_NAME LIKE '%depart%' OR TABLE_NAME LIKE '%faculty%'
            ORDER BY TABLE_NAME
        `);
        console.table(tablesResult.recordset);

        // If discipline table exists, check its structure
        const disciplineCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'discipline' OR TABLE_NAME = 'appdiscipline'
        `);

        if (disciplineCheck.recordset.length > 0) {
            const tableName = disciplineCheck.recordset[0].TABLE_NAME;
            console.log(`\n=== ${tableName.toUpperCase()} TABLE STRUCTURE ===`);
            const structureResult = await pool.request().query(`
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${tableName}'
                ORDER BY ORDINAL_POSITION
            `);
            console.table(structureResult.recordset);

            console.log(`\n=== SAMPLE ${tableName.toUpperCase()} DATA ===`);
            const dataResult = await pool.request().query(`
                SELECT TOP 5 * FROM dbo.${tableName}
            `);
            console.table(dataResult.recordset);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

queryTables();
