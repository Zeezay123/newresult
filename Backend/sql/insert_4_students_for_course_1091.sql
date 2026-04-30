-- ============================================
-- INSERT 4 STUDENTS FOR COURSE ID 1091
-- ============================================
-- This script creates 4 test students and registers them for CourseID 1091
-- Adjust ProgrammeID, DepartmentID, FacultyID, LevelID, SessionID as needed

-- First, let's check what course 1091 is (for reference)
-- SELECT * FROM dbo.course WHERE CourseID = 1091;

-- Insert 4 test students
-- Using generic values - adjust based on your course requirements
INSERT INTO dbo.student (MatricNo, Reg_No, LastName, OtherNames, ProgrammeID, DisciplineID, FacultyID, DepartmentID, LevelID, SessionID, Email, Phone, DateOfAdmission, [Status])
VALUES 

('FOS/26/27/001091', 'REG2026001091', 'Adebayo', 'Oluwaseun Michael', 1, 1, 1, 1, 2, 2, 'oluwaseun.adebayo@student.edu', '08091234501', GETDATE(), 'Active'),


('FOS/26/27/001092', 'REG2026001092', 'Okonkwo', 'Chioma Grace', 1, 1, 1, 1, 2, 2, 'chioma.okonkwo@student.edu', '08091234502', GETDATE(), 'Active'),


('FOS/26/27/001093', 'REG2026001093', 'Mohammed', 'Ibrahim Yusuf', 1, 1, 1, 1, 2, 2, 'ibrahim.mohammed@student.edu', '08091234503', GETDATE(), 'Active'),


('FOS/26/27/001094', 'REG2026001094', 'Eze', 'Blessing Ngozi', 1, 1, 1, 1, 2, 2, 'blessing.eze@student.edu', '08091234504', GETDATE(), 'Active');

-- Get the StudentIDs of the newly inserted students
DECLARE @Student1ID INT, @Student2ID INT, @Student3ID INT, @Student4ID INT;

SELECT @Student1ID = StudentID FROM dbo.student WHERE MatricNo = 'FOS/26/27/001091';
SELECT @Student2ID = StudentID FROM dbo.student WHERE MatricNo = 'FOS/26/27/001092';
SELECT @Student3ID = StudentID FROM dbo.student WHERE MatricNo = 'FOS/26/27/001093';
SELECT @Student4ID = StudentID FROM dbo.student WHERE MatricNo = 'FOS/26/27/001094';

-- Register all 4 students for CourseID 1093 - Semester 1
-- Using SessionID = 2 and SemesterID = 1
INSERT INTO dbo.course_registration (StudentID, CourseID, SessionID, SemesterID, RegistrationDate, RegistrationStatus)
VALUES 
(@Student1ID, 1092, 5, 1, GETDATE(), 'registered'),
(@Student2ID, 1092, 5, 1, GETDATE(), 'registered'),
(@Student3ID, 1092, 5, 1, GETDATE(), 'registered'),
(@Student4ID, 1092, 5, 1, GETDATE(), 'registered');

-- Register all 4 students for CourseID 1094 - Semester 2
-- Using SessionID = 2 and SemesterID = 2


-- Verify the insertions
SELECT 
    s.StudentID,
    s.MatricNo,
    s.LastName,
    s.OtherNames,
    s.Email,
    cr.RegistrationStatus,
    cr.SemesterID,
    sem.SemesterName,
    c.CourseCode,
    c.CourseName
FROM dbo.student s
INNER JOIN dbo.course_registration cr ON s.StudentID = cr.StudentID
INNER JOIN dbo.course c ON cr.CourseID = c.CourseID
LEFT JOIN dbo.semesters sem ON cr.SemesterID = sem.SemesterID
WHERE s.MatricNo IN ('FOS/26/27/001091', 'FOS/26/27/001092', 'FOS/26/27/001093', 'FOS/26/27/001094')
AND cr.CourseID = 1092
ORDER BY s.MatricNo, cr.SemesterID;

PRINT '4 students successfully created and registered for CourseID 1092 (Semesters 1 & 2)';


