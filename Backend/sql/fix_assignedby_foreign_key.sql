-- fix_assignedby_foreign_key.sql
-- Quick fix to drop incorrect foreign key and create correct one

USE DELSUPortal;
GO

-- Drop the incorrect foreign key constraint (pointing to appusers.UserID)
IF EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_course_assignment_assignedby'
    AND parent_object_id = OBJECT_ID('dbo.course_assignment')
)
BEGIN
    ALTER TABLE dbo.course_assignment
    DROP CONSTRAINT FK_course_assignment_assignedby;
    
    PRINT 'Dropped incorrect FK_course_assignment_assignedby constraint';
END
ELSE
BEGIN
    PRINT 'FK_course_assignment_assignedby does not exist';
END
GO

-- Add correct foreign key constraint pointing to staff.StaffID
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_course_assignment_staff_assignedby'
    AND parent_object_id = OBJECT_ID('dbo.course_assignment')
)
BEGIN
    ALTER TABLE dbo.course_assignment
    ADD CONSTRAINT FK_course_assignment_staff_assignedby
        FOREIGN KEY (AssignedBy)
        REFERENCES dbo.staff(StaffID)
        ON DELETE SET NULL;  -- If staff is deleted, set AssignedBy to NULL
    
    PRINT 'Created correct foreign key constraint pointing to staff.StaffID';
END
ELSE
BEGIN
    PRINT 'FK_course_assignment_staff_assignedby already exists';
END
GO

-- Verify the constraint
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.course_assignment')
    AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'AssignedBy';
GO

PRINT 'Foreign key fix completed successfully!';
