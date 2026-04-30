-- SQL Server Trigger to automatically create course_assignment entry when a new course is added

CREATE TRIGGER trg_AfterInsertCourse
ON dbo.course
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert a new assignment record for each newly inserted course
    INSERT INTO dbo.course_assignment (CourseID, AssignmentStatus, AssignedDate)
    SELECT 
        i.CourseID,
        'unassigned',
        NULL
    FROM inserted i;
    
END;
GO

-- To drop the trigger if needed:
-- DROP TRIGGER trg_AfterInsertCourse;
