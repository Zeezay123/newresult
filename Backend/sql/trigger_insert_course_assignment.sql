-- trigger_insert_course_assignment.sql
-- Creates a trigger that inserts any newly created course into dbo.course_assignment
-- Run this manually to create the trigger. The trigger performs an idempotent insert.

CREATE TRIGGER trg_after_insert_course
ON dbo.course
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.course_assignment (CourseID, DepartmentID, FacultyID, CreatedAt)
    SELECT i.CourseID, i.DepartmentID, i.FacultyID, GETDATE()
    FROM inserted i
    LEFT JOIN dbo.course_assignment ca ON ca.CourseID = i.CourseID
    WHERE ca.CourseID IS NULL;
END;

-- NOTE: adjust target columns to match your schema. If your course_assignment
-- requires other NOT NULL columns, adapt the trigger accordingly.
