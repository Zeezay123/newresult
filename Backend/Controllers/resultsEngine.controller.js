import {sql, poolPromise } from '../db.js';
import {errorHandler} from '../utils/error.js';

/**
 * Sync Normalized Tables Controller
 * 
 * This controller manages synchronization between legacy comma-separated value tables
 * and normalized tables (newcourses, newcourse_registration) for performance optimization.
 * 
 * Benefits:
 * - Eliminates need for STRING_SPLIT in queries
 * - Improves query performance significantly
 * - Maintains backward compatibility with original tables
 * - Automatic sync via triggers + manual sync via API
 */

/**
 * GET /api/results-engine/sync-status
 * Check the status of synchronized tables
 */
export const getSyncStatus = async (req, res, next) => {
    try {
        const pool = await poolPromise;
        
        // Get row counts for comparison
        const query = `
            SELECT 
                'Original Tables' as table_group,
                OBJECT_NAME(object_id) as table_name,
                SUM(row_count) as row_count
            FROM sys.dm_db_partition_stats
            WHERE database_id = DB_ID()
              AND OBJECT_NAME(object_id) IN ('courses', 'course_registrations')
              AND index_id IN (0, 1)
            GROUP BY OBJECT_NAME(object_id)
            
            UNION ALL
            
            SELECT 
                'Normalized Tables' as table_group,
                OBJECT_NAME(object_id) as table_name,
                SUM(row_count) as row_count
            FROM sys.dm_partition_stats
            WHERE database_id = DB_ID()
              AND OBJECT_NAME(object_id) IN ('newcourses', 'newcourse_registration')
              AND index_id IN (0, 1)
            GROUP BY OBJECT_NAME(object_id);
        `;
        
        const result = await pool.request().query(query);
        
        res.status(200).json({
            success: true,
            message: 'Sync status retrieved successfully',
            tables: result.recordset,
            timestamp: new Date()
        });
        
    } catch (error) {
        next(errorHandler(500, `Failed to get sync status: ${error.message}`));
    }
};

/**
 * POST /api/results-engine/sync-now
 * Manually trigger synchronization of normalized tables
 * 
 * Request body: {
 *   logOutput?: boolean (default: true) - Whether to include detailed logs
 * }
 */
export const syncNormalizedTables = async (req, res, next) => {
    try {
        const { logOutput = true } = req.body;
        
        const pool = await poolPromise;
        const request = pool.request();
        
        request.input('LogOutput', logOutput ? 1 : 0);
        
        // Execute the sync stored procedure
        const result = await request.execute('sp_SyncNormalizedCourses');
        
        // Get statistics on what was synced
        const stats = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM dbo.newcourses) AS normalized_courses_count,
                (SELECT COUNT(*) FROM dbo.newcourse_registration) AS normalized_registrations_count,
                (SELECT COUNT(*) FROM dbo.courses) AS original_courses_count,
                (SELECT COUNT(*) FROM dbo.course_registrations) AS original_registrations_count;
        `);
        
        const counts = stats.recordset[0];
        
        res.status(200).json({
            success: true,
            message: 'Normalized tables synchronized successfully',
            syncedAt: new Date(),
            statistics: {
                newcourses: {
                    rowCount: counts.normalized_courses_count,
                    description: 'Courses normalized by faculty/discipline combinations'
                },
                newcourse_registration: {
                    rowCount: counts.normalized_registrations_count,
                    description: 'Course registrations normalized (one row per course per student)'
                },
                original_courses: counts.original_courses_count,
                original_registrations: counts.original_registrations_count
            },
            note: 'Sync is automatic via triggers. Use this endpoint for manual refresh if needed.'
        });
        
    } catch (error) {
        next(errorHandler(500, `Sync operation failed: ${error.message}`));
    }
};

/**
 * GET /api/results-engine/normalization-info
 * Get information about table normalization schema and benefits
 */
export const getNormalizationInfo = async (req, res, next) => {
    try {
        const info = {
            purpose: 'Schema normalization to eliminate comma-separated values and improve query performance',
            
            tables: {
                original: {
                    courses: {
                        description: 'Original courses table with comma-separated faculty and discipline',
                        columns: ['course_id', 'course_code', 'course_name', 'faculty (comma-separated)', 'discipline (comma-separated)'],
                        issue: 'Requires STRING_SPLIT for queries, slower performance, harder to index'
                    },
                    course_registrations: {
                        description: 'Original course registrations with comma-separated course IDs',
                        columns: ['mat_no', 'courses (comma-separated)', 'session_id', 'semester_id'],
                        issue: 'Requires STRING_SPLIT for course lookups, difficult to enforce referential integrity'
                    }
                },
                
                normalized: {
                    newcourses: {
                        description: 'Normalized courses with one row per course/faculty/discipline combination',
                        columns: ['newcourse_id (PK)', 'course_id (FK)', 'course_code', 'course_name', 'credit_unit', 'course_type', 'semester', 'level_id', 'faculty (single value)', 'discipline (single value)'],
                        benefit: 'Can be directly indexed and joined without STRING_SPLIT'
                    },
                    newcourse_registration: {
                        description: 'Normalized registrations with one row per course registered',
                        columns: ['newregistration_id (PK)', 'mat_no', 'course_id (FK)', 'session_id', 'semester_id', 'registration_status'],
                        benefit: 'Proper normalization (1NF), enables constraints and efficient queries'
                    }
                }
            },
            
            synchronization: {
                automatic: 'Triggers on courses and course_registrations tables keep normalized tables in sync automatically',
                manual: 'Call POST /api/results-engine/sync-now to manually refresh if needed',
                procedure: 'sp_SyncNormalizedCourses - Clears and repopulates normalized tables',
                frequency: 'Real-time for inserts/updates/deletes via triggers; manual sync available for bulk operations'
            },
            
            backwardCompatibility: {
                original_tables_remain: true,
                description: 'Original tables (courses, course_registrations) are unchanged; other systems can continue using them',
                recommendation: 'New queries should use normalized tables; update old STRING_SPLIT queries to use newcourses/newcourse_registration'
            },
            
            example_queries: {
                old_query_with_string_split: `
                    SELECT c.course_id, c.course_name, f.value AS faculty
                    FROM dbo.courses c
                    CROSS APPLY STRING_SPLIT(c.faculty, ',') f
                    WHERE c.course_id = 101;
                `,
                new_query_normalized: `
                    SELECT newcourse_id, course_id, course_name, faculty
                    FROM dbo.newcourses
                    WHERE course_id = 101;
                `,
                old_registration_with_string_split: `
                    SELECT cr.mat_no, c.value AS course_id
                    FROM dbo.course_registrations cr
                    CROSS APPLY STRING_SPLIT(cr.courses, ',') c
                    WHERE cr.mat_no = 'MAT001';
                `,
                new_registration_normalized: `
                    SELECT mat_no, course_id
                    FROM dbo.newcourse_registration
                    WHERE mat_no = 'MAT001';
                `
            },
            
            performance_notes: {
                index_support: 'Normalized tables have indexes on faculty, discipline, course_id for fast lookups',
                query_simplification: 'Queries become simpler, more readable, and significantly faster',
                storage: 'Slightly larger due to denormalization of relationships, but trade-off is worth it for performance',
                recommendation: 'Migrate all new queries to use normalized tables'
            }
        };
        
        res.status(200).json(info);
        
    } catch (error) {
        next(errorHandler(500, `Failed to get normalization info: ${error.message}`));
    }
};

/**
 * GET /api/results-engine/query-courses
 * Example endpoint showing how to query normalized courses without STRING_SPLIT
 * 
 * Query parameters:
 *   - faculty?: number - Filter by faculty ID
 *   - discipline?: number - Filter by discipline ID
 *   - level?: number - Filter by level ID
 *   - course_type?: string - Filter by course type
 */
export const queryNormalizedCourses = async (req, res, next) => {
    try {
        const { faculty, discipline, level, course_type } = req.query;
        
        const pool = await poolPromise;
        const request = pool.request();
        
        let query = 'SELECT * FROM dbo.newcourses WHERE 1=1';
        
        if (faculty) {
            request.input('faculty', parseInt(faculty));
            query += ' AND faculty = @faculty';
        }
        
        if (discipline) {
            request.input('discipline', parseInt(discipline));
            query += ' AND discipline = @discipline';
        }
        
        if (level) {
            request.input('level_id', parseInt(level));
            query += ' AND level_id = @level_id';
        }
        
        if (course_type) {
            request.input('course_type', course_type);
            query += ' AND course_type = @course_type';
        }
        
        query += ' ORDER BY course_code';
        
        const result = await request.query(query);
        
        res.status(200).json({
            success: true,
            count: result.recordset.length,
            data: result.recordset,
            note: 'This query uses normalized tables - no STRING_SPLIT needed'
        });
        
    } catch (error) {
        next(errorHandler(500, `Failed to query normalized courses: ${error.message}`));
    }
};

/**
 * GET /api/results-engine/query-registrations
 * Example endpoint showing how to query normalized registrations without STRING_SPLIT
 * 
 * Query parameters:
 *   - mat_no: string - Student matric number
 *   - session_id?: number - Filter by session
 *   - semester_id?: number - Filter by semester
 */
export const queryNormalizedRegistrations = async (req, res, next) => {
    try {
        const { mat_no, session_id, semester_id } = req.query;
        
        if (!mat_no) {
            return next(errorHandler(400, 'mat_no (student matric number) is required'));
        }
        
        const pool = await poolPromise;
        const request = pool.request();
        
        request.input('mat_no', mat_no);
        
        let query = `
            SELECT 
                ncr.newregistration_id,
                ncr.mat_no,
                ncr.course_id,
                nc.course_code,
                nc.course_name,
                nc.credit_unit,
                ncr.session_id,
                ncr.semester_id,
                ncr.registration_status,
                ncr.registration_date
            FROM dbo.newcourse_registration ncr
            JOIN dbo.newcourses nc ON ncr.course_id = nc.course_id
            WHERE ncr.mat_no = @mat_no
        `;
        
        if (session_id) {
            request.input('session_id', parseInt(session_id));
            query += ' AND ncr.session_id = @session_id';
        }
        
        if (semester_id) {
            request.input('semester_id', parseInt(semester_id));
            query += ' AND ncr.semester_id = @semester_id';
        }
        
        query += ' ORDER BY nc.course_code';
        
        const result = await request.query(query);
        
        res.status(200).json({
            success: true,
            student: mat_no,
            courseCount: result.recordset.length,
            data: result.recordset,
            note: 'This query uses normalized tables - no STRING_SPLIT needed'
        });
        
    } catch (error) {
        next(errorHandler(500, `Failed to query normalized registrations: ${error.message}`));
    }
};
