-- alter_course_assignment_add_faculty_department.sql
-- Adds FacultyID and DepartmentID columns to dbo.course_assignment if they do not exist


-- Add FacultyID if missing
IF COL_LENGTH('dbo.course_assignment', 'FacultyID') IS NULL
    EXEC('ALTER TABLE dbo.course_assignment ADD FacultyID INT NULL');

-- Add DepartmentID if missing
IF COL_LENGTH('dbo.course_assignment', 'DepartmentID') IS NULL
    EXEC('ALTER TABLE dbo.course_assignment ADD DepartmentID INT NULL');

-- Optionally, update existing rows with correct values if you have a mapping
UPDATE ca
 SET ca.FacultyID = c.FacultyID, ca.DepartmentID = c.DepartmentID
 FROM dbo.course_assignment ca
 JOIN dbo.course c ON ca.CourseID = c.CourseID;

ALTER TABLE dbo.course_assignment
ADD CourseCategory VARCHAR(50) NULL;  -- New column to store course type

UPDATE ca
 SET ca.CourseCategory = c.CourseCategory, ca.CourseType = c.CourseType
 FROM dbo.course_assignment ca
 JOIN dbo.course c ON ca.CourseID = c.CourseID;

ALTER TABLE dbo.course_assignment
ADD CourseCode VARCHAR(50) NULL;  -- New column to store course type