SET XACT_ABORT ON;

/*
Run this script in SQL Server Management Studio or any SQL tool that supports batch
execution. It converts staff reference columns from INT to VARCHAR(20) so they can
store the same canonical values as dbo.tblStaffDirectory.StaffId.

Mapping rules:
1. Prefer the existing varchar staff code where present.
2. Otherwise map numeric values to a matching tblStaffDirectory.StaffId by trailing digits.
3. If no match exists, preserve the current numeric value as text for manual cleanup.
*/

IF COL_LENGTH('dbo.Level_Advisors', 'StaffID_varchar') IS NULL
    ALTER TABLE dbo.Level_Advisors ADD StaffID_varchar varchar(20) NULL;

IF COL_LENGTH('dbo.course_assignment', 'LecturerID_varchar') IS NULL
    ALTER TABLE dbo.course_assignment ADD LecturerID_varchar varchar(20) NULL;

IF COL_LENGTH('dbo.course_assignment', 'AssignedBy_varchar') IS NULL
    ALTER TABLE dbo.course_assignment ADD AssignedBy_varchar varchar(20) NULL;
GO

UPDATE la
SET la.StaffCode = COALESCE(NULLIF(la.StaffCode, ''), matched.StaffId, CAST(la.StaffID AS varchar(20)))
FROM dbo.Level_Advisors la
OUTER APPLY (
    SELECT TOP 1 s.StaffId
    FROM dbo.tblStaffDirectory s
    WHERE s.StaffId = CAST(la.StaffID AS varchar(20))
       OR (
            s.StaffId LIKE '%[0-9]'
            AND TRY_CONVERT(int, RIGHT(s.StaffId, PATINDEX('%[^0-9]%', REVERSE(s.StaffId) + 'X') - 1)) = la.StaffID
       )
) matched
WHERE COL_LENGTH('dbo.Level_Advisors', 'StaffCode') IS NOT NULL
  AND (la.StaffCode IS NULL OR LTRIM(RTRIM(la.StaffCode)) = '');

UPDATE la
SET la.StaffID_varchar = COALESCE(NULLIF(la.StaffCode, ''), matched.StaffId, CAST(la.StaffID AS varchar(20)))
FROM dbo.Level_Advisors la
OUTER APPLY (
    SELECT TOP 1 s.StaffId
    FROM dbo.tblStaffDirectory s
    WHERE s.StaffId = CAST(la.StaffID AS varchar(20))
       OR (
            s.StaffId LIKE '%[0-9]'
            AND TRY_CONVERT(int, RIGHT(s.StaffId, PATINDEX('%[^0-9]%', REVERSE(s.StaffId) + 'X') - 1)) = la.StaffID
       )
) matched
WHERE COL_LENGTH('dbo.Level_Advisors', 'StaffID_varchar') IS NOT NULL;

UPDATE ca
SET ca.LecturerID_varchar = CASE
    WHEN ca.LecturerID IS NULL THEN NULL
    ELSE COALESCE(matched.StaffId, CAST(ca.LecturerID AS varchar(20)))
END
FROM dbo.course_assignment ca
OUTER APPLY (
    SELECT TOP 1 s.StaffId
    FROM dbo.tblStaffDirectory s
    WHERE s.StaffId = CAST(ca.LecturerID AS varchar(20))
       OR (
            s.StaffId LIKE '%[0-9]'
            AND TRY_CONVERT(int, RIGHT(s.StaffId, PATINDEX('%[^0-9]%', REVERSE(s.StaffId) + 'X') - 1)) = ca.LecturerID
       )
) matched
WHERE COL_LENGTH('dbo.course_assignment', 'LecturerID_varchar') IS NOT NULL;

UPDATE ca
SET ca.AssignedBy_varchar = CASE
    WHEN ca.AssignedBy IS NULL THEN NULL
    ELSE COALESCE(matched.StaffId, CAST(ca.AssignedBy AS varchar(20)))
END
FROM dbo.course_assignment ca
OUTER APPLY (
    SELECT TOP 1 s.StaffId
    FROM dbo.tblStaffDirectory s
    WHERE s.StaffId = CAST(ca.AssignedBy AS varchar(20))
       OR (
            s.StaffId LIKE '%[0-9]'
            AND TRY_CONVERT(int, RIGHT(s.StaffId, PATINDEX('%[^0-9]%', REVERSE(s.StaffId) + 'X') - 1)) = ca.AssignedBy
       )
) matched
WHERE COL_LENGTH('dbo.course_assignment', 'AssignedBy_varchar') IS NOT NULL;
GO

IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'Level_Advisors'
      AND COLUMN_NAME = 'StaffID'
      AND DATA_TYPE = 'int'
)
BEGIN
    ALTER TABLE dbo.Level_Advisors DROP COLUMN StaffID;
    EXEC sp_rename 'dbo.Level_Advisors.StaffID_varchar', 'StaffID', 'COLUMN';
    ALTER TABLE dbo.Level_Advisors ALTER COLUMN StaffID varchar(20) NOT NULL;
END
GO

IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'course_assignment'
      AND COLUMN_NAME = 'LecturerID'
      AND DATA_TYPE = 'int'
)
BEGIN
    ALTER TABLE dbo.course_assignment DROP COLUMN LecturerID;
    EXEC sp_rename 'dbo.course_assignment.LecturerID_varchar', 'LecturerID', 'COLUMN';
    ALTER TABLE dbo.course_assignment ALTER COLUMN LecturerID varchar(20) NULL;
END
GO

IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'course_assignment'
      AND COLUMN_NAME = 'AssignedBy'
      AND DATA_TYPE = 'int'
)
BEGIN
    ALTER TABLE dbo.course_assignment DROP COLUMN AssignedBy;
    EXEC sp_rename 'dbo.course_assignment.AssignedBy_varchar', 'AssignedBy', 'COLUMN';
    ALTER TABLE dbo.course_assignment ALTER COLUMN AssignedBy varchar(20) NULL;
END
GO

SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Level_Advisors', 'course_assignment')
  AND COLUMN_NAME IN ('StaffID', 'StaffCode', 'LecturerID', 'AssignedBy')
ORDER BY TABLE_NAME, COLUMN_NAME;

SELECT TOP 20 AdvisorID, StaffCode, StaffID
FROM dbo.Level_Advisors
ORDER BY AdvisorID DESC;

SELECT TOP 20 AssignmentID, LecturerID, AssignedBy
FROM dbo.course_assignment
ORDER BY AssignmentID DESC;

SELECT DISTINCT ca.LecturerID
FROM dbo.course_assignment ca
LEFT JOIN dbo.tblStaffDirectory s ON ca.LecturerID = s.StaffId
WHERE ca.LecturerID IS NOT NULL
  AND s.StaffId IS NULL;

SELECT DISTINCT ca.AssignedBy
FROM dbo.course_assignment ca
LEFT JOIN dbo.tblStaffDirectory s ON ca.AssignedBy = s.StaffId
WHERE ca.AssignedBy IS NOT NULL
  AND s.StaffId IS NULL;
