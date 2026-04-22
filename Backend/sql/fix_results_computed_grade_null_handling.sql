/*
  Fix dbo.results computed grading columns.

  Problem:
  - Grade-related columns are computed from CA_Score + Exam_Score.
  - When either score is NULL, SQL Server evaluates the CASE expression through
    the ELSE branch, which currently yields Grade = 'F' and GradePoint = 0.

  Desired behavior:
  - Keep Grade, GradePoint, Remarks, TotalGradePoints, and DeficitPoint NULL
    until both CA_Score and Exam_Score are present.
  - Preserve the existing grading scale once both scores exist.
*/

IF COL_LENGTH('dbo.results', 'TotalGradePoints') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN TotalGradePoints;

IF COL_LENGTH('dbo.results', 'DeficitPoint') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN DeficitPoint;

IF COL_LENGTH('dbo.results', 'Remarks') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN Remarks;

IF COL_LENGTH('dbo.results', 'GradePoint') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN GradePoint;

IF COL_LENGTH('dbo.results', 'Grade') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN Grade;

IF COL_LENGTH('dbo.results', 'TotalScore') IS NOT NULL
    ALTER TABLE dbo.results DROP COLUMN TotalScore;

ALTER TABLE dbo.results
ADD TotalScore AS (
    CASE
        WHEN CA_Score IS NULL AND Exam_Score IS NULL THEN NULL
        ELSE ISNULL(CA_Score, 0) + ISNULL(Exam_Score, 0)
    END
);

ALTER TABLE dbo.results
ADD Grade AS (
    CASE
        WHEN CA_Score IS NULL OR Exam_Score IS NULL THEN NULL
        WHEN (CA_Score + Exam_Score) >= 70 THEN 'A'
        WHEN (CA_Score + Exam_Score) >= 60 THEN 'B'
        WHEN (CA_Score + Exam_Score) >= 50 THEN 'C'
        WHEN (CA_Score + Exam_Score) >= 45 THEN 'D'
        WHEN (CA_Score + Exam_Score) >= 40 THEN 'E'
        ELSE 'F'
    END
);

ALTER TABLE dbo.results
ADD GradePoint AS (
    CASE
        WHEN CA_Score IS NULL OR Exam_Score IS NULL THEN NULL
        WHEN (CA_Score + Exam_Score) >= 70 THEN 5.0
        WHEN (CA_Score + Exam_Score) >= 60 THEN 4.0
        WHEN (CA_Score + Exam_Score) >= 50 THEN 3.0
        WHEN (CA_Score + Exam_Score) >= 45 THEN 2.0
        WHEN (CA_Score + Exam_Score) >= 40 THEN 1.0
        ELSE 0.0
    END
);

ALTER TABLE dbo.results
ADD Remarks AS (
    CASE
        WHEN CA_Score IS NULL OR Exam_Score IS NULL THEN NULL
        WHEN (CA_Score + Exam_Score) >= 40 THEN 'Pass'
        ELSE 'Fail'
    END
);

ALTER TABLE dbo.results
ADD TotalGradePoints AS (
    CASE
        WHEN CA_Score IS NULL OR Exam_Score IS NULL THEN NULL
        WHEN (CA_Score + Exam_Score) >= 70 THEN 5.0 * CreditUnits
        WHEN (CA_Score + Exam_Score) >= 60 THEN 4.0 * CreditUnits
        WHEN (CA_Score + Exam_Score) >= 50 THEN 3.0 * CreditUnits
        WHEN (CA_Score + Exam_Score) >= 45 THEN 2.0 * CreditUnits
        WHEN (CA_Score + Exam_Score) >= 40 THEN 1.0 * CreditUnits
        ELSE 0.0
    END
);

ALTER TABLE dbo.results
ADD DeficitPoint AS (
    CASE
        WHEN CA_Score IS NULL OR Exam_Score IS NULL THEN NULL
        WHEN (CA_Score + Exam_Score) < 40 THEN CAST(CreditUnits AS numeric(10, 1))
        ELSE 0.0
    END
);

SELECT
    ResultID,
    CA_Score,
    Exam_Score,
    TotalScore,
    Grade,
    GradePoint,
    Remarks,
    TotalGradePoints,
    DeficitPoint
FROM dbo.results
WHERE CA_Score IS NULL OR Exam_Score IS NULL;