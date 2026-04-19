-- ============================================
-- CREATE NORMALIZED COURSE TABLES
-- ============================================
-- Purpose: Replace comma-separated values with properly normalized structure
-- This allows queries without STRING_SPLIT and improves performance
-- Original tables (courses, course_registrations) remain unchanged for backward compatibility

-- ============================================
-- TABLE 1: newcourses - Normalized courses with single faculty/discipline per row
-- ============================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'newcourses' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.newcourses (
        newcourse_id INT PRIMARY KEY IDENTITY(1,1),
        course_id INT NOT NULL,
        curriculum INT NOT NULL,
        course_code VARCHAR(50) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        credit_unit INT,
        course_type VARCHAR(50),
        semester INT,
        level_id INT,
        programme_id INT,
        faculty INT,  -- Single faculty value (no longer comma-separated)
        discipline INT,  -- Single discipline value (no longer comma-separated)
        amount VARCHAR(50) NULL,
        deleted INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (course_id) REFERENCES dbo.courses(course_id),
        INDEX IX_newcourses_course_id (course_id),
        INDEX IX_newcourses_faculty (faculty),
        INDEX IX_newcourses_discipline (discipline),
        INDEX IX_newcourses_level_id (level_id)
    )
END;

-- ============================================
-- TABLE 2: newcourse_registration - Normalized course registration
-- ============================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'newcourse_registration' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.newcourse_registration (
        newregistration_id INT PRIMARY KEY IDENTITY(1,1),
        mat_no VARCHAR(50) NOT NULL,
        course INT NOT NULL,
        programme INT NOT NULL,
        faculty INT NOT NULL,
        discipline INT NOT NULL,
        level_id INT NOT NULL,
        session INT,
        deleted INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (course) REFERENCES dbo.courses(course_id),
        INDEX IX_newcourse_reg_matno (mat_no),
        INDEX IX_newcourse_reg_course (course),
        INDEX IX_newcourse_reg_session (session),
        CONSTRAINT UQ_newcourse_reg_student_course UNIQUE (mat_no, course, session)
    )
END;

-- ============================================
-- SYNC PROCEDURE: sp_SyncNormalizedCourses
-- ============================================
DELETE FROM dbo.newcourses -- Clear existing data before sync
SELECT COUNT(*) AS after_delete FROM dbo.newcourses; -- should be 0
DELETE FROM dbo.newcourse_registration -- Clear existing data before sync  
SELECT COUNT(*) AS after_delete FROM dbo.newcourse_registration; -- should be 0


INSERT INTO dbo.newcourses (
    course_id, course_code, curriculum, course_title, credit_unit,
    course_type, programme_id, semester, level_id,
    faculty, discipline, amount, deleted, created_at, updated_at
)
SELECT DISTINCT
    c.course_id, c.course_code, c.curriculum, c.course_title, c.credit_unit,
    c.course_type, c.programme_id, c.semester, c.level_id,
    d.FacultyID   AS faculty,
    d.DisciplineID           AS discipline,
    c.amount, c.deleted, GETDATE(), GETDATE()
FROM dbo.courses c
CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.faculty AS NVARCHAR(MAX)), ''), ',') fac
CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.discipline AS NVARCHAR(MAX)), ''), ',') disc
INNER JOIN dbo.disciplines d
    ON d.DisciplineID         = TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT)
    AND d.FacultyID = TRY_CAST(LTRIM(RTRIM(fac.value))  AS INT)
WHERE LTRIM(RTRIM(fac.value))  != ''
  AND LTRIM(RTRIM(disc.value)) != ''
  AND TRY_CAST(LTRIM(RTRIM(fac.value))  AS INT) IS NOT NULL
  AND TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT) IS NOT NULL;

SELECT COUNT(*) AS after_insert FROM dbo.newcourses; -- should be > 0

-- STEP 3: If STEP 2 inserted rows, the problem is inside the procedure
-- Check if a transaction is being rolled back by running this
EXEC dbo.sp_SyncNormalizedCourses @LogOutput = 1;
SELECT COUNT(*) AS final_count FROM dbo.newcourses; -- is it still 0?
SELECT COUNT(*) AS final_count FROM dbo.newcourse_registration; -- is it still 0?


SELECT COLUMNPROPERTY(OBJECT_ID('dbo.newcourses'), c.name, 'AllowsNull') AS allows_null,
       c.name, c.is_nullable
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('dbo.newcourses')
ORDER BY c.column_id;

-- Does newcourses have any triggers that might be rolling back?
SELECT t.name AS trigger_name, t.is_disabled
FROM sys.triggers t
WHERE t.parent_id = OBJECT_ID('dbo.newcourses');

-- Does newcourses have identity/computed columns that conflict with your INSERT list?
SELECT c.name, c.is_identity, c.is_computed
FROM sys.columns c
WHERE c.object_id = OBJECT_ID('dbo.newcourses')
ORDER BY c.column_id;


        DELETE FROM dbo.newcourse_registration;  
        DELETE FROM dbo.newcourses;     






CREATE OR ALTER PROCEDURE dbo.sp_SyncNormalizedCourses
    @LogOutput BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Starting sp_SyncNormalizedCourses procedure'; 
    
    BEGIN TRY
            

        RAISERROR('Tables cleared', 0, 1) WITH NOWAIT;
        
       
        INSERT INTO dbo.newcourses (course_id, course_code, curriculum, course_title, credit_unit, course_type, programme_id, semester, level_id, faculty, discipline, amount, deleted, created_at, updated_at)
        SELECT 
            c.course_id,
            c.course_code,
            c.curriculum,
            c.course_title, 
            c.credit_unit,
            c.course_type,
            c.programme_id,
            c.semester,
            c.level_id,
            d.FacultyID as faculty,
            d.DisciplineID as discipline,
            c.amount,
            c.deleted,
            GETDATE(),
            GETDATE()
        FROM dbo.courses c

        CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.faculty AS NVARCHAR(MAX)), ''), ',') fac
        CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.discipline AS NVARCHAR(MAX)), ''), ',') disc

        INNER JOIN dbo.Disciplines d ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT)
        AND d.FacultyID = TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT)

        WHERE LTRIM(RTRIM(fac.value)) != '' 
          AND LTRIM(RTRIM(disc.value)) != ''
          AND TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT) IS NOT NULL
          AND TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT) IS NOT NULL;
        
        DECLARE @SyncedCount INT = @@ROWCOUNT;
        RAISERROR('Synced %d rows into newcourses', 0, 1, @SyncedCount) WITH NOWAIT;

      
     


        ;WITH RegRows AS (
            SELECT
                cr.mat_no,
                TRY_CAST(LTRIM(RTRIM(course.value)) AS INT) AS course,
                cr.programme,
                cr.session,
                d.FacultyID AS faculty,
                d.DisciplineID AS discipline,
                cr.level_id,
                cr.deleted,
                ROW_NUMBER() OVER (
                    PARTITION BY cr.mat_no,
                                 TRY_CAST(LTRIM(RTRIM(course.value)) AS INT),
                                 cr.session
                    ORDER BY d.DisciplineID, d.FacultyID
                ) AS rn
            FROM dbo.course_registrations cr
            CROSS APPLY STRING_SPLIT(ISNULL(CAST(cr.courses AS NVARCHAR(MAX)), ''), ',', 1) course
            INNER JOIN dbo.courses c ON c.course_id = TRY_CAST(LTRIM(RTRIM(course.value)) AS INT)
            CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.faculty AS NVARCHAR(MAX)), ''), ',') fac
            CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.discipline AS NVARCHAR(MAX)), ''), ',') disc
            INNER JOIN dbo.disciplines d 
                ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT)
                AND d.FacultyID = TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT)
            WHERE LTRIM(RTRIM(course.value)) != '' 
              AND TRY_CAST(LTRIM(RTRIM(course.value)) AS INT) IS NOT NULL
              AND LTRIM(RTRIM(fac.value)) != ''
              AND LTRIM(RTRIM(disc.value)) != ''
              AND TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT) IS NOT NULL
              AND TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT) IS NOT NULL
        )
        INSERT INTO dbo.newcourse_registration (mat_no, course, programme, session, faculty, discipline, level_id, deleted, created_at, updated_at)
        SELECT
            mat_no,
            course,
            programme,
            session,
            faculty,
            discipline,
            level_id,
            deleted,
            GETDATE(),
            GETDATE()
        FROM RegRows
        WHERE rn = 1;

        DECLARE @SyncedReg INT = @@ROWCOUNT;
        RAISERROR('Synced %d rows into newcourse_registration', 0, 1, @SyncedReg) WITH NOWAIT;

        IF @SyncedReg = 0
            RAISERROR('WARNING: 0 rows inserted into newcourse_registration — check course_registrations data', 1, 1) WITH NOWAIT;

        IF @LogOutput = 1
            PRINT 'Sync completed successfully at ' + CAST(GETDATE() AS VARCHAR);

        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        PRINT 'ERROR: ' + @ErrorMessage;
        THROW;
    END CATCH;
END;

GO

-- ============================================
-- TRIGGER 1: Sync newcourses when courses table changes
-- ============================================
IF  EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'tr_courses_sync')
BEGIN
    DROP TRIGGER dbo.tr_courses_sync
END;

GO

CREATE TRIGGER dbo.tr_courses_sync
ON dbo.courses
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Delete affected rows from newcourses based on inserted/updated/deleted course_ids
        DELETE FROM dbo.newcourses
        WHERE course_id IN (
            SELECT DISTINCT course_id FROM inserted
            UNION ALL
            SELECT DISTINCT course_id FROM deleted
        );
        
        -- Re-insert normalized rows for affected courses
        INSERT INTO dbo.newcourses (course_id, course_code, curriculum, course_title, credit_unit, course_type, programme_id, semester, level_id, faculty, discipline, amount, deleted, created_at, updated_at)
        SELECT 
            c.course_id,
            c.course_code,
            c.curriculum,
            c.course_title,
            c.credit_unit,
            c.course_type,
            c.programme_id,
            c.semester,
            c.level_id,
            CAST(LTRIM(RTRIM(fac.value)) AS INT) AS faculty,
            CAST(LTRIM(RTRIM(disc.value)) AS INT) AS discipline,
            c.amount,
            c.deleted,
            GETDATE(),
            GETDATE()
        FROM dbo.courses c

        INNER JOIN inserted i ON c.course_id = i.course_id

        CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.faculty AS NVARCHAR(MAX)), ''), ',') fac
        CROSS APPLY STRING_SPLIT(ISNULL(CAST(c.discipline AS NVARCHAR(MAX)), ''), ',') disc
      
    INNER JOIN dbo.Disciplines d ON d.DisciplineID = TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT) AND d.FacultyID = TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT)   

        WHERE LTRIM(RTRIM(fac.value)) != '' AND LTRIM(RTRIM(disc.value)) != ''
            AND TRY_CAST(LTRIM(RTRIM(fac.value)) AS INT) IS NOT NULL
            AND TRY_CAST(LTRIM(RTRIM(disc.value)) AS INT) IS NOT NULL;
        
    END TRY
    BEGIN CATCH
        -- Log error but don't fail the trigger
        PRINT 'Trigger error on tr_courses_sync: ' + ERROR_MESSAGE();
    END CATCH; 
END;

GO

-- tESTING: Check if trigger fires by inserting a course


   
    
    
  
    

    
   
    
  
INSERT INTO dbo.courses (course_code, curriculum, course_title, credit_unit, course_type, programme_id, semester, level_id, faculty, discipline)
VALUES ('TEST101', 1, 'Test Course', 3, 'C', 1, 2, 2, '24,1002', '1002,1003');


  
-- TRIGGER 2: Sync newcourse_registration when course_registrations changes

IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'tr_course_registrations_sync')
BEGIN
    DROP TRIGGER dbo.tr_course_registrations_sync;
END;

GO

CREATE TRIGGER dbo.tr_course_registrations_sync
ON dbo.course_registrations
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Delete affected rows from newcourse_registration
        DELETE FROM dbo.newcourse_registration
        WHERE mat_no IN (
            SELECT DISTINCT mat_no FROM inserted
            UNION ALL
            SELECT DISTINCT mat_no FROM deleted
        );
        
        -- Re-insert normalized rows for affected students
        ;WITH RegRows AS (
            SELECT
                cr.mat_no,
                CAST(LTRIM(RTRIM(course.value)) AS INT) AS course,
                cr.programme,
                cr.session,
                cr.faculty,
                cr.discipline,
                cr.level_id,
                CAST(LTRIM(RTRIM(score.value)) AS INT) AS scores,
                cr.deleted,
                ROW_NUMBER() OVER (
                    PARTITION BY cr.mat_no,
                                 CAST(LTRIM(RTRIM(course.value)) AS INT),
                                 cr.session
                    ORDER BY cr.mat_no
                ) AS rn
            FROM dbo.course_registrations cr
            INNER JOIN inserted i ON cr.mat_no = i.mat_no
            CROSS APPLY STRING_SPLIT(ISNULL(CAST(cr.courses AS NVARCHAR(MAX)), ''), ',') course
            WHERE LTRIM(RTRIM(course.value)) != ''
              AND TRY_CAST(LTRIM(RTRIM(course.value)) AS INT) IS NOT NULL
        )
        INSERT INTO dbo.newcourse_registration (mat_no, course, programme, session, faculty, discipline, level_id, deleted, created_at, updated_at)
        SELECT
            mat_no,
            course,
            programme,
            session,
            faculty,
            discipline,
            level_id,
            deleted,
            GETDATE(),
            GETDATE()
        FROM RegRows
        WHERE rn = 1;
        
    END TRY
    BEGIN CATCH
        -- Log error but don't fail the trigger
        PRINT 'Trigger error on tr_course_registrations_sync: ' + ERROR_MESSAGE();
    END CATCH;
END;

GO

-- ============================================
-- INITIAL SYNC: Populate normalized tables
-- ============================================
EXEC dbo.sp_SyncNormalizedCourses @LogOutput = 1;
