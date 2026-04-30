-- alter_course_assignment_add_assignedby.sql
-- Adds AssignedBy column to track which HOD made the course assignment
-- This is crucial for cross-department assignments (e.g., GST courses assigned to other departments)

-- Add AssignedBy column if it doesn't exist
IF COL_LENGTH('dbo.course_assignment', 'AssignedBy') IS NULL
BEGIN
    ALTER TABLE dbo.course_assignment 
    ADD AssignedBy INT NULL;
    
    PRINT 'AssignedBy column added successfully';
END
ELSE
BEGIN
    PRINT 'AssignedBy column already exists';
END

-- Drop incorrect foreign key constraint if it exists (pointing to wrong table)
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

-- Drop old constraint if it exists with different name
IF EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_course_assignment_staff_assignedby'
)
BEGIN
    ALTER TABLE dbo.course_assignment
    DROP CONSTRAINT FK_course_assignment_staff_assignedby;
    
    PRINT 'Dropped old FK_course_assignment_staff_assignedby constraint';
END

-- Add correct foreign key constraint to staff table
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_course_assignment_staff_assignedby'
    AND parent_object_id = OBJECT_ID('dbo.course_assignment')
)
BEGIN
    ALTER TABLE dbo.course_assignment
    ADD CONSTRAINT FK_course_assignment_staff_assignedby
        FOREIGN KEY (AssignedBy)
        REFERENCES dbo.staff(StaffID);
    
    PRINT 'Foreign key constraint added successfully (pointing to staff.StaffID)';
END
ELSE
BEGIN
    PRINT 'Foreign key constraint already exists';
END

-- Optional: Add index for better query performance
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_course_assignment_assignedby' 
    AND object_id = OBJECT_ID('dbo.course_assignment')
)
BEGIN
    CREATE INDEX IX_course_assignment_assignedby 
    ON dbo.course_assignment(AssignedBy);
    
    PRINT 'Index created successfully';
END
ELSE
BEGIN
    PRINT 'Index already exists';
END;

ALTER TABLE dbo.course_assignment
DROP CONSTRAINT FK_course_assignment_assignedby;