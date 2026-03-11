import {sql, poolPromise} from './db.js';

async function queryDisciplines() {
    try {
        const pool = await poolPromise;
        
        if (!pool) {
            console.error('Database connection failed');
            process.exit(1);
        }

        console.log('=== DISCIPLINES TABLE STRUCTURE ===');
        const structureResult = await pool.request().query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Disciplines'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(structureResult.recordset);

        console.log('\n=== SAMPLE DISCIPLINES DATA ===');
        const dataResult = await pool.request().query(`
            SELECT TOP 10 * FROM dbo.Disciplines
        `);
        console.table(dataResult.recordset);

        console.log('\n=== SELECTEDDISCIPLINES TABLE STRUCTURE ===');
        const structureResult2 = await pool.request().query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'SelectedDisciplines'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(structureResult2.recordset);

        console.log('\n=== SAMPLE SELECTEDDISCIPLINES DATA ===');
        const dataResult2 = await pool.request().query(`
            SELECT TOP 10 * FROM dbo.SelectedDisciplines
        `);
        console.table(dataResult2.recordset);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

queryDisciplines();
