-- alter_course_add_semesterid.sql
-- Adds SemesterID column to dbo.course if it does not exist, and sets it to 1 or 2 for all rows

-- Add SemesterID if missing
IF COL_LENGTH('dbo.course', 'SemesterID') IS NULL
    EXEC('ALTER TABLE dbo.course ADD SemesterID INT NULL');

-- Set SemesterID to 1 or 2 for all existing courses
-- Example: set all to 1 (change logic as needed)
UPDATE dbo.course SET SemesterID = 1 WHERE SemesterID IS NULL;

-- If you want to set some to 2, run another update with a WHERE clause, e.g.:
-- UPDATE dbo.course SET SemesterID = 2 WHERE <your condition>;

CREATE TABLE dbo.student_gpa (
    GPAID INT IDENTITY(1,1) PRIMARY KEY,
    MatricNo VARCHAR(20) NOT NULL,
    StudentID INT NOT NULL,
    SessionID INT NOT NULL,
    SemesterID INT NOT NULL,
    LevelID INT NOT NULL,
    GPA DECIMAL(3,2), -- Semester GPA (e.g., 3.75)
    CGPA DECIMAL(3,2), -- Cumulative GPA
    TotalCreditUnits INT, -- Credits taken this semester
    TotalCreditUnitsPassed INT, -- Credits passed
    CumulativeCreditUnits INT, -- Total credits so far
    CumulativeCreditUnitsPassed INT,
    CalculatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (StudentID) REFERENCES dbo.student(StudentID),
    FOREIGN KEY (SessionID) REFERENCES dbo.sessions(SessionID),
    FOREIGN KEY (SemesterID) REFERENCES dbo.semesters(SemesterID),
    UNIQUE(MatricNo, SessionID, SemesterID) -- One GPA record per student per semester
);