-- alter_course_assignment_add_extra_columns.sql
-- Adds CourseType, CourseCategory, and LevelID columns to dbo.course_assignment if they do not exist

-- Add CourseType if missing
IF COL_LENGTH('dbo.course_assignment', 'CourseType') IS NULL
    EXEC('ALTER TABLE dbo.course_assignment ADD CourseType NVARCHAR(50) NULL');

-- Add CourseCategory if missing
IF COL_LENGTH('dbo.course_assignment', 'CourseCategory') IS NULL
    EXEC('ALTER TABLE dbo.course_assignment ADD CourseCategory NVARCHAR(50) NULL');

-- Add LevelID if missing
IF COL_LENGTH('dbo.course_assignment', 'LevelID') IS NULL
    EXEC('ALTER TABLE dbo.course_assignment ADD LevelID INT NULL');
