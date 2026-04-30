import express from 'express';
import {
    getSyncStatus,
    syncNormalizedTables,
    getNormalizationInfo,
    queryNormalizedCourses,
    queryNormalizedRegistrations
} from '../Controllers/resultsEngine.controller.js';

const router = express.Router();

/**
 * Results Engine Routes
 * 
 * Endpoints for managing normalized/denormalized tables to eliminate STRING_SPLIT usage
 * These endpoints allow:
 * 1. Viewing sync status between original and normalized tables
 * 2. Manually triggering synchronization
 * 3. Querying normalized tables efficiently
 * 4. Understanding the normalization schema
 */

// GET - Check synchronization status
// Returns row counts and sync health metrics
router.get('/sync-status', getSyncStatus);

// POST - Manually sync normalized tables
// Triggers the stored procedure sp_SyncNormalizedCourses
// Automatic sync happens via triggers, but this allows manual refresh
router.post('/sync-now', syncNormalizedTables);

// GET - Get information about table normalization schema
// Shows benefits, schema differences, and migration examples
router.get('/normalization-info', getNormalizationInfo);

// GET - Query normalized courses without STRING_SPLIT
// Parameters: faculty, discipline, level, course_type
// Example: /api/results-engine/query-courses?faculty=1&discipline=10
router.get('/query-courses', queryNormalizedCourses);

// GET - Query normalized course registrations without STRING_SPLIT
// Parameters: mat_no (required), session_id, semester_id
// Example: /api/results-engine/query-registrations?mat_no=MAT001&session_id=2024
router.get('/query-registrations', queryNormalizedRegistrations);

export default router;
